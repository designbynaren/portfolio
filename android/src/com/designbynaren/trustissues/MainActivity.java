package com.designbynaren.trustissues;

import android.app.Activity;
import android.os.Bundle;
import android.os.Handler;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/** Full-screen WebView that runs the game bundled in assets/index.html. */
public class MainActivity extends Activity {
    private WebView web;
    private final Handler handler = new Handler();
    // runs shortly after onPause so the page has time to pause itself and silence its audio first
    private final Runnable freeze = new Runnable() { public void run() { web.onPause(); web.pauseTimers(); } };

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        setRequestedOrientation(6);              // ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON | WindowManager.LayoutParams.FLAG_FULLSCREEN);
        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);           // progress and best times
        s.setAllowFileAccess(true);
        try {                                   // let sound start without an extra tap (API 17+)
            WebSettings.class.getMethod("setMediaPlaybackRequiresUserGesture", boolean.class).invoke(s, false);
        } catch (Exception ignored) { }
        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient());
        web.setBackgroundColor(0xFF05060A);
        web.addJavascriptInterface(new Bridge(), "AndroidApp");
        setContentView(web);
        hideSystemBars();
        if (state != null) web.restoreState(state);
        else web.loadUrl("file:///android_asset/index.html?app");
    }

    private void hideSystemBars() {
        // IMMERSIVE_STICKY | FULLSCREEN | HIDE_NAVIGATION | LAYOUT_STABLE | LAYOUT_HIDE_NAVIGATION | LAYOUT_FULLSCREEN
        web.setSystemUiVisibility(0x1000 | 0x4 | 0x2 | 0x100 | 0x200 | 0x400);
    }

    @Override public void onWindowFocusChanged(boolean hasFocus) { super.onWindowFocusChanged(hasFocus); if (hasFocus) hideSystemBars(); }
    @Override protected void onSaveInstanceState(Bundle out) { super.onSaveInstanceState(out); web.saveState(out); }
    @Override protected void onPause() {
        web.loadUrl("javascript:window.__appPause&&window.__appPause()");   // pause game + suspend audio
        handler.postDelayed(freeze, 250);                                    // then freeze the WebView
        super.onPause();
    }
    @Override protected void onResume() {
        super.onResume();
        handler.removeCallbacks(freeze);
        web.resumeTimers(); web.onResume();
        web.loadUrl("javascript:window.__appResume&&window.__appResume()");
        hideSystemBars();
    }
    @Override protected void onDestroy() { handler.removeCallbacks(freeze); web.destroy(); super.onDestroy(); }
    @Override public void onBackPressed() { web.loadUrl("javascript:window.__appBack&&window.__appBack()"); }

    /** Lets the page close the app from the main menu. */
    public class Bridge {
        @JavascriptInterface
        public void exit() { runOnUiThread(new Runnable() { public void run() { finish(); } }); }
    }
}
