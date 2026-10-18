import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { DatabaseSync } from "node:sqlite";
import { mkdir, readFile } from "node:fs/promises";
import { drizzle } from "drizzle-orm/sqlite-proxy";

const require = createRequire(import.meta.url);
const esbuild = require(require.resolve("esbuild", { paths: [require.resolve("vite")] }));
await mkdir(".sites-runtime/qa", { recursive: true });
// Test the actual route and queries; replace only hosted identity and D1 wiring.
await esbuild.build({
  entryPoints: ["app/api/reviews/route.ts"], outfile: ".sites-runtime/qa/review-route-test.mjs",
  bundle: true, packages: "external", platform: "node", format: "esm", logLevel: "silent",
  plugins: [{ name: "hosted-test-adapters", setup(build) {
    build.onResolve({ filter: /^@\/app\/chatgpt-auth$/ }, () => ({ path: "auth", namespace: "test" }));
    build.onResolve({ filter: /^@\/db$/ }, () => ({ path: "db", namespace: "test" }));
    build.onLoad({ filter: /.*/, namespace: "test" }, args => ({ loader: "js", contents: args.path === "auth"
      ? 'export async function getChatGPTUser(){return globalThis.__reviewUser??null;} export function chatGPTSignInPath(){return "/signin-with-chatgpt?return_to=%2F%23leave-review";}'
      : 'export function getDb(){return globalThis.__reviewDatabase;}' }));
  } }],
});
const sqlite = new DatabaseSync(":memory:");
const journal = JSON.parse(await readFile("drizzle/meta/_journal.json", "utf8"));
for (const migration of journal.entries) sqlite.exec(await readFile(`drizzle/${migration.tag}.sql`, "utf8"));
globalThis.__reviewDatabase = drizzle(async (sql, params, method) => {
  const statement = sqlite.prepare(sql);
  if (method === "run") { statement.run(...params); return { rows: [] }; }
  statement.setReturnArrays(true);
  const rows = statement.all(...params);
  return { rows: method === "get" ? rows[0] : rows };
});
const route = await import("../.sites-runtime/qa/review-route-test.mjs");
const origin = "https://portfolio.example";
const input = { name: "Test Client", project: "Test project", rating: 5, comment: "A clear and collaborative project experience.", consent: true };
function request(method, body = input, extra = {}) {
  return new Request(`${origin}/api/reviews`, { method, headers: { Origin: origin, "Content-Type": "application/json", ...extra }, ...(method === "POST" ? { body: JSON.stringify(body) } : {}) });
}
assert.equal((await route.POST(request("POST"))).status, 401);
assert.equal((await route.DELETE(request("DELETE"))).status, 401);
globalThis.__reviewUser = { userId: "client-one", email: "client-one@example.test" };
assert.equal((await route.POST(request("POST", input, { Origin: "https://other.example" }))).status, 403);
for (const invalid of [{ ...input, rating: 0 }, { ...input, rating: 6 }, { ...input, rating: 3.5 }, { ...input, consent: false }, { ...input, comment: "short" }]) {
  assert.equal((await route.POST(request("POST", invalid))).status, 400);
}
assert.equal((await route.POST(request("POST", { ...input, comment: "x".repeat(15000) }))).status, 413);
let response = await route.POST(request("POST", { ...input, name: " Test Client ", authorId: "client-two" }));
assert.equal(response.status, 200);
let saved = (await response.json()).review;
assert.equal(saved.name, "Test Client");
assert.equal("authorId" in saved, false);
const firstId = saved.id;
response = await route.POST(request("POST", { ...input, rating: 4, comment: "An updated comment about the same project." }));
assert.equal(response.status, 200);
assert.equal((await response.json()).review.id, firstId);
let data = await (await route.GET()).json();
assert.equal(data.reviews.length, 1);
assert.equal(data.mine.rating, 4);
assert.equal(sqlite.prepare("SELECT author_id FROM client_reviews").get().author_id, "client-one");
globalThis.__reviewUser = { userId: "client-two", email: "client-two@example.test" };
await route.POST(request("POST", { ...input, name: "Second Client" }));
data = await (await route.GET()).json();
assert.equal(data.reviews.length, 2);
assert.equal(data.mine.name, "Second Client");
assert.equal(JSON.stringify(data).includes("example.test"), false);
assert.equal(JSON.stringify(data).includes("authorId"), false);
assert.equal((await route.DELETE(request("DELETE"))).status, 200);
data = await (await route.GET()).json();
assert.equal(data.reviews.length, 1);
assert.equal(data.mine, null);
assert.equal(data.reviews[0].name, "Test Client");
globalThis.__reviewUser = null;
data = await (await route.GET()).json();
assert.equal(data.mine, null);
assert.equal(data.reviews.length, 1);
sqlite.close();
console.log("Review API checks passed: validation, shared persistence, updates, account ownership, removal and privacy.");
