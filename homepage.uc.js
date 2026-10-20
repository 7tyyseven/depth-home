// ==UserScript==
// @name Depth Home
// @description Buka depth-home.html dari tab kosong (klik kanan "+ New Tab"), new tab klasik, dan homepage Zen
// ==/UserScript==
(() => {
  const TAG = "[DepthHome]";
  const P = "mod.depthhome.";
  const bool = (k, d) => Services.prefs.getBoolPref(P + k, d);
  console.log(TAG, "script dijalankan");
  if (!bool("enabled", true)) return;

  let url = null;

  const find = async () => {
    const root = PathUtils.join(PathUtils.profileDir, "chrome", "sine-mods");
    try {
      for (const d of await IOUtils.getChildren(root)) {
        const f = PathUtils.join(d, "depth-home.html");
        if (await IOUtils.exists(f)) return f;
      }
    } catch (e) { console.error(TAG, e); }
    return null;
  };

  (async () => {
    const path = await find();
    if (!path) return console.error(TAG, "depth-home.html tidak ditemukan di chrome/sine-mods/*/");
    url = PathUtils.toFileURI(path);
    console.log(TAG, "homepage =", url);
    // New tab klasik (about:newtab) -> halaman kita. Hanya berlaku kalau zen.urlbar.replace-newtab = false
    try {
      Cc["@mozilla.org/browser/aboutnewtab-service;1"].getService(Ci.nsIAboutNewTabService).newTabURL = url;
    } catch (e) {
      try { ChromeUtils.importESModule("resource:///modules/AboutNewTab.sys.mjs").AboutNewTab.newTabURL = url; }
      catch (e2) { console.error(TAG, e2); }
    }
    if (bool("replace_newtab_off", false)) Services.prefs.setBoolPref("zen.urlbar.replace-newtab", false);
    if (bool("set_homepage", true)) Services.prefs.setStringPref("browser.startup.homepage", url);
  })();

  // Hook tab kosong (klik kanan / tahan tombol "+ New Tab" di Zen membuka tab about:blank)
  if (window.gBrowser && bool("hook_blank_tab", true)) {
    gBrowser.tabContainer.addEventListener("TabOpen", (e) => {
      const tab = e.target;
      setTimeout(() => {
        try {
          const b = tab.linkedBrowser;
          if (!url || !b || tab.closing || window.PrivateBrowsingUtils?.isWindowPrivate(window)) return;
          if (b.currentURI?.spec !== "about:blank" || b.userTypedValue) return;
          if (b.webProgress?.isLoadingDocument || b.browsingContext?.opener) return;
          console.log(TAG, "tab kosong -> homepage");
          b.fixupAndLoadURIString(url, { triggeringPrincipal: Services.scriptSecurityManager.getSystemPrincipal() });
        } catch (err) { console.error(TAG, err); }
      }, 250);
    });
  }
})();
