#!/usr/bin/env python3
"""Build the Trust Issues Android APK without the Android SDK.

The game is a single HTML file, so the app is one Activity that shows it in a full-screen WebView.
This script does what Gradle + aapt2 + d8 + apksigner normally do:

  1. compile MainActivity.java against android.jar (API 16 from Maven Central)
  2. convert the classes to classes.dex with dx (com.jakewharton.android.repackaged:dalvik-dx)
  3. write the binary AndroidManifest.xml and a one-entry resources.arsc (the launcher icon)
  4. zip everything (resources.arsc stored and 4-byte aligned, as Android 11+ requires)
  5. sign with APK Signature Scheme v2 (RSA 2048 / SHA-256)

Usage:
  python3 android/build_apk.py --android-jar android-4.1.1.4.jar --dx-jar dalvik-dx-16.0.1.jar \
      --key signing-key.pem --out TrustIssues.apk

Requires Java (javac) and the Python package `cryptography`. Keep the signing key safe and out of git:
Android only installs updates signed with the same key.
"""
import argparse, hashlib, os, shutil, struct, subprocess, sys, tempfile, zipfile, datetime

ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(ROOT)
PACKAGE = 'com.designbynaren.trustissues'
LABEL = 'Trust Issues'
VERSION_CODE, VERSION_NAME = 2, '1.1'
MIN_SDK, TARGET_SDK = 24, 34

# android.R.attr / android.R.style ids (read from android.jar with javap)
ATTR = {'theme': 0x01010000, 'label': 0x01010001, 'icon': 0x01010002, 'name': 0x01010003, 'exported': 0x01010010,
        'screenOrientation': 0x0101001e, 'configChanges': 0x0101001f, 'minSdkVersion': 0x0101020c,
        'versionCode': 0x0101021b, 'versionName': 0x0101021c, 'targetSdkVersion': 0x01010270,
        'allowBackup': 0x01010280, 'hardwareAccelerated': 0x010102d3}
THEME_NOTITLEBAR_FULLSCREEN = 0x01030007
ICON_ID = 0x7f010000            # package 0x7f, type 1 (mipmap), entry 0
ANDROID_NS = 'http://schemas.android.com/apk/res/android'

# Res_value data types
T_REF, T_STRING, T_INT_DEC, T_INT_HEX, T_BOOL = 0x01, 0x03, 0x10, 0x11, 0x12


# ---------------------------------------------------------------- binary XML (AXML)
def string_pool(strings, utf8=False):
    """ResStringPool chunk."""
    data, offsets = bytearray(), []
    for s in strings:
        offsets.append(len(data))
        if utf8:
            b = s.encode('utf-8')
            assert len(s) < 128 and len(b) < 128
            data += bytes([len(s), len(b)]) + b + b'\x00'
        else:
            u = s.encode('utf-16-le')
            data += struct.pack('<H', len(s)) + u + b'\x00\x00'
    while len(data) % 4:
        data += b'\x00'
    header = 28
    strings_start = header + 4 * len(strings)
    size = strings_start + len(data)
    flags = 0x100 if utf8 else 0
    return struct.pack('<HHIIIIII', 0x0001, header, size, len(strings), 0, flags, strings_start, 0) + \
        b''.join(struct.pack('<I', o) for o in offsets) + bytes(data)


def manifest_axml():
    # element tree: (tag, [(attr, type, value)], children)
    tree = ('manifest', [('versionCode', T_INT_DEC, VERSION_CODE), ('versionName', T_STRING, VERSION_NAME)], [
        ('uses-sdk', [('minSdkVersion', T_INT_DEC, MIN_SDK), ('targetSdkVersion', T_INT_DEC, TARGET_SDK)], []),
        ('uses-permission', [('name', T_STRING, 'android.permission.VIBRATE')], []),       # button haptics
        ('application', [('theme', T_REF, THEME_NOTITLEBAR_FULLSCREEN), ('label', T_STRING, LABEL), ('icon', T_REF, ICON_ID),
                         ('allowBackup', T_BOOL, True), ('hardwareAccelerated', T_BOOL, True)], [
            ('activity', [('name', T_STRING, PACKAGE + '.MainActivity'), ('exported', T_BOOL, True),
                          ('screenOrientation', T_INT_DEC, 6),                 # sensorLandscape: either way up, never portrait
                          ('configChanges', T_INT_HEX, 0x0DB0)], [   # keyboard|keyboardHidden|orientation|screenLayout|screenSize|smallestScreenSize
                ('intent-filter', [], [
                    ('action', [('name', T_STRING, 'android.intent.action.MAIN')], []),
                    ('category', [('name', T_STRING, 'android.intent.category.LAUNCHER')], []),
                ]),
            ]),
        ]),
    ])
    extra_manifest_attrs = [('package', PACKAGE)]          # plain, un-namespaced attribute on <manifest>

    # attribute names that map to resource ids must come first, in the same order as the resource map
    attr_names = []
    def walk(node):
        tag, attrs, kids = node
        for a, _, _ in attrs:
            if a not in attr_names:
                attr_names.append(a)
        for k in kids:
            walk(k)
    walk(tree)
    strings = list(attr_names)
    def sidx(s):
        if s not in strings:
            strings.append(s)
        return strings.index(s)
    ns_uri, ns_prefix = sidx(ANDROID_NS), sidx('android')

    def node_bytes(node, extra=()):
        tag, attrs, kids = node
        out = bytearray()
        items = []
        for name, value in extra:
            items.append((0xFFFFFFFF, sidx(name), sidx(value), T_STRING, sidx(value), name))
        for a, t, v in attrs:
            if t == T_STRING:
                si = sidx(v); items.append((ns_uri, strings.index(a), si, T_STRING, si, a))
            elif t == T_BOOL:
                items.append((ns_uri, strings.index(a), 0xFFFFFFFF, T_BOOL, 0xFFFFFFFF if v else 0, a))
            else:
                items.append((ns_uri, strings.index(a), 0xFFFFFFFF, t, v, a))
        # Android requires attributes sorted by resource id (un-namespaced ones without an id go first)
        items.sort(key=lambda it: ATTR.get(it[5], -1))
        name_i = sidx(tag)
        attr_bytes = b''.join(struct.pack('<IIIHBBI', ns, nm, raw, 8, 0, typ, data) for ns, nm, raw, typ, data, _ in items)
        # layout of ResXMLTree_attrExt: ns(4) name(4) attributeStart(2) attributeSize(2) attributeCount(2) id(2) class(2) style(2)
        payload = struct.pack('<IIHHHHHH', 0xFFFFFFFF, name_i, 20, 20, len(items), 0, 0, 0) + attr_bytes
        out += struct.pack('<HHIII', 0x0102, 16, 16 + len(payload), 1, 0xFFFFFFFF) + payload
        for k in kids:
            out += node_bytes(k)
        out += struct.pack('<HHIIIII', 0x0103, 16, 24, 1, 0xFFFFFFFF, 0xFFFFFFFF, name_i)
        return out

    elements = node_bytes(tree, extra_manifest_attrs)        # fills the string table
    start_ns = struct.pack('<HHIIIII', 0x0100, 16, 24, 1, 0xFFFFFFFF, ns_prefix, ns_uri)
    end_ns = struct.pack('<HHIIIII', 0x0101, 16, 24, 1, 0xFFFFFFFF, ns_prefix, ns_uri)
    pool = string_pool(strings)
    resmap_ids = b''.join(struct.pack('<I', ATTR[a]) for a in attr_names)
    resmap = struct.pack('<HHI', 0x0180, 8, 8 + len(resmap_ids)) + resmap_ids
    content = pool + resmap + start_ns + bytes(elements) + end_ns
    return struct.pack('<HHI', 0x0003, 8, 8 + len(content)) + content


# ---------------------------------------------------------------- resources.arsc (just the launcher icon)
def resources_arsc(icon_path):
    values = string_pool([icon_path], utf8=True)
    type_pool = string_pool(['mipmap'])
    key_pool = string_pool(['ic_launcher'])
    spec = struct.pack('<HHIBBHI', 0x0202, 16, 16 + 4, 1, 0, 0, 1) + struct.pack('<I', 0)
    config = struct.pack('<I', 64) + b'\x00' * 60                                   # default configuration
    type_header = 20 + len(config)
    entries = struct.pack('<HHI', 8, 0, 0) + struct.pack('<HBBI', 8, 0, T_STRING, 0)  # key 0 -> string 0
    offsets = struct.pack('<I', 0)
    entries_start = type_header + len(offsets)
    type_chunk = struct.pack('<HHIBBHII', 0x0201, type_header, entries_start + len(entries), 1, 0, 0, 1, entries_start) + \
        config + offsets + entries
    pkg_header = 288
    name = PACKAGE.encode('utf-16-le').ljust(256, b'\x00')
    type_off = pkg_header
    key_off = pkg_header + len(type_pool)
    pkg_body = type_pool + key_pool + spec + type_chunk
    package = struct.pack('<HHII', 0x0200, pkg_header, pkg_header + len(pkg_body), 0x7f) + name + \
        struct.pack('<IIIII', type_off, 1, key_off, 1, 0) + pkg_body
    body = values + package
    return struct.pack('<HHII', 0x0002, 12, 12 + len(body), 1) + body


# ---------------------------------------------------------------- code
def build_dex(android_jar, dx_jar, work):
    classes = os.path.join(work, 'classes'); stubs = os.path.join(work, 'stubs')
    os.makedirs(classes); os.makedirs(stubs)
    src = [os.path.join(dp, f) for dp, _, fs in os.walk(os.path.join(ROOT, 'src')) for f in fs if f.endswith('.java')]
    stub_src = [os.path.join(dp, f) for dp, _, fs in os.walk(os.path.join(ROOT, 'stubs')) for f in fs if f.endswith('.java')]
    run(['javac', '-nowarn', '--release', '8', '-cp', android_jar, '-d', stubs] + stub_src)
    run(['javac', '-nowarn', '--release', '8', '-cp', stubs + os.pathsep + android_jar, '-d', classes] + src)
    dex = os.path.join(work, 'classes.dex')
    run(['java', '-cp', dx_jar, 'com.android.dx.command.Main', '--dex', '--min-sdk-version=%d' % MIN_SDK,
         '--output=' + dex, classes])
    return open(dex, 'rb').read()


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        sys.exit('command failed: %s\n%s%s' % (' '.join(cmd[:3]), r.stdout, r.stderr))


# ---------------------------------------------------------------- zip with aligned stored entries
def write_zip(path, entries):
    """entries: list of (name, bytes, compress). Stored entries are padded to 4-byte data alignment."""
    with zipfile.ZipFile(path, 'w') as z:
        for name, data, compress in entries:
            info = zipfile.ZipInfo(name, date_time=(2026, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED if compress else zipfile.ZIP_STORED
            info.create_system = 0
            if not compress:
                offset = z.fp.tell() + 30 + len(name.encode())
                pad = (-offset) % 4
                info.extra = b'\x00' * pad if pad else b''
            z.writestr(info, data)


# ---------------------------------------------------------------- APK Signature Scheme v2
def lp(b):                     # uint32 length-prefixed
    return struct.pack('<I', len(b)) + b


def sign_v2(apk_path, key_pem):
    from cryptography import x509
    from cryptography.hazmat.primitives import hashes, serialization
    from cryptography.hazmat.primitives.asymmetric import rsa, padding
    from cryptography.x509.oid import NameOID

    if not os.path.exists(key_pem):
        key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        with open(key_pem, 'wb') as f:
            f.write(key.private_bytes(serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8, serialization.NoEncryption()))
        os.chmod(key_pem, 0o600)
        print('created new signing key:', key_pem)
    key = serialization.load_pem_private_key(open(key_pem, 'rb').read(), password=None)
    name = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, 'Trust Issues')])
    cert = (x509.CertificateBuilder().subject_name(name).issuer_name(name).public_key(key.public_key())
            .serial_number(int.from_bytes(hashlib.sha256(key.public_key().public_bytes(
                serialization.Encoding.DER, serialization.PublicFormat.SubjectPublicKeyInfo)).digest()[:8], 'big') >> 1)
            .not_valid_before(datetime.datetime(2026, 1, 1)).not_valid_after(datetime.datetime(2076, 1, 1))
            .sign(key, hashes.SHA256()))

    apk = open(apk_path, 'rb').read()
    eocd = apk.rfind(b'PK\x05\x06')
    cd_offset = struct.unpack('<I', apk[eocd + 16:eocd + 20])[0]
    contents, cd, eocd_bytes = apk[:cd_offset], apk[cd_offset:eocd], apk[eocd:]

    def chunked_digest(parts):
        digests = []
        for part in parts:
            for i in range(0, len(part), 1 << 20):
                c = part[i:i + (1 << 20)]
                digests.append(hashlib.sha256(b'\xa5' + struct.pack('<I', len(c)) + c).digest())
        return hashlib.sha256(b'\x5a' + struct.pack('<I', len(digests)) + b''.join(digests)).digest()

    ALGO = 0x0103                                            # RSASSA-PKCS1-v1_5 with SHA2-256
    digest = chunked_digest([contents, cd, eocd_bytes])      # EOCD still points at the central directory here
    signed_data = lp(lp(struct.pack('<I', ALGO) + lp(digest))) + lp(lp(cert.public_bytes(serialization.Encoding.DER))) + lp(b'')
    signature = key.sign(signed_data, padding.PKCS1v15(), hashes.SHA256())
    pubkey = key.public_key().public_bytes(serialization.Encoding.DER, serialization.PublicFormat.SubjectPublicKeyInfo)
    signer = lp(signed_data) + lp(lp(struct.pack('<I', ALGO) + lp(signature))) + lp(pubkey)
    v2_value = lp(lp(signer))
    pair = struct.pack('<QI', 4 + len(v2_value), 0x7109871a) + v2_value
    block_size = len(pair) + 8 + 16
    block = struct.pack('<Q', block_size) + pair + struct.pack('<Q', block_size) + b'APK Sig Block 42'
    new_eocd = eocd_bytes[:16] + struct.pack('<I', cd_offset + len(block)) + eocd_bytes[20:]
    with open(apk_path, 'wb') as f:
        f.write(contents + block + cd + new_eocd)
    return cert


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--android-jar', required=True)
    ap.add_argument('--dx-jar', required=True)
    ap.add_argument('--key', required=True, help='PEM private key (created if missing). Keep it out of git.')
    ap.add_argument('--out', required=True)
    a = ap.parse_args()
    work = tempfile.mkdtemp()
    try:
        dex = build_dex(a.android_jar, a.dx_jar, work)
        html = open(os.path.join(REPO, 'game', 'index.html'), 'rb').read()
        icon = open(os.path.join(ROOT, 'res', 'ic_launcher.png'), 'rb').read()
        icon_path = 'res/mipmap/ic_launcher.png'
        write_zip(a.out, [
            ('AndroidManifest.xml', manifest_axml(), True),
            ('classes.dex', dex, True),
            ('resources.arsc', resources_arsc(icon_path), False),
            (icon_path, icon, False),
            ('assets/index.html', html, True),
        ])
        cert = sign_v2(a.out, a.key)
        print('built %s (%d KB), signer SHA-256 %s' % (a.out, os.path.getsize(a.out) // 1024,
              hashlib.sha256(cert.public_bytes(__import__('cryptography').hazmat.primitives.serialization.Encoding.DER)).hexdigest()[:16]))
    finally:
        shutil.rmtree(work, ignore_errors=True)


if __name__ == '__main__':
    main()
