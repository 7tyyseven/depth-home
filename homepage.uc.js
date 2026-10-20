// ==UserScript==
// @name Depth Home
// @description Set depth-home.html sebagai new tab & homepage Zen
// ==/UserScript==
(() => {
  const P = "mod.depthhome.";
  const on = (k) => Services.prefs.getBoolPref(P + k, true);
  if (!on("enabled")) return;
  const find = async () => {
    const root = PathUtils.join(PathUtils.profileDir, "chrome", "sine-mods");
    try {
      for (const d of await IOUtils.getChildren(root)) {
        const f = PathUtils.join(d, "depth-home.html");
        if (await IOUtils.exists(f)) return f;
      }
    } catch (e) {}
    return null;
  };
  find().then((path) => {
    if (!path) return console.error("[DepthHome] depth-home.html tidak ditemukan di chrome/sine-mods/*");
    const url = PathUtils.toFileURI(path);
    Services.prefs.setBoolPref("zen.urlbar.replace-newtab", false);
    try {
      Cc["@mozilla.org/browser/aboutnewtab-service;1"].getService(Ci.nsIAboutNewTabService).newTabURL = url;
    } catch (e) {
      ChromeUtils.importESModule("resource:///modules/AboutNewTab.sys.mjs").AboutNewTab.newTabURL = url;
    }
    if (on("set_homepage")) Services.prefs.setStringPref("browser.startup.homepage", url);
  });
})();
