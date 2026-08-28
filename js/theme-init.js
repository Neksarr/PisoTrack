(function () {
  const themes = {
    blue: { primary: "#4d6d87", onPrimary: "#ffffff", soft: "rgba(77,109,135,.14)" }, pink: { primary: "#d85b91", onPrimary: "#ffffff", soft: "rgba(216,91,145,.14)" },
    purple: { primary: "#7652a8", onPrimary: "#ffffff", soft: "rgba(118,82,168,.14)" }, red: { primary: "#b94747", onPrimary: "#ffffff", soft: "rgba(185,71,71,.14)" },
    green: { primary: "#3f805d", onPrimary: "#ffffff", soft: "rgba(63,128,93,.14)" }, yellow: { primary: "#f0c94b", onPrimary: "#171717", soft: "rgba(240,201,75,.20)" }
  }, root = document.documentElement;
  function applyTheme(name) {
    const validName = themes[name] ? name : "blue", theme = themes[validName];
    root.dataset.theme = validName;
    [["--accent", theme.primary], ["--accent-text", theme.onPrimary], ["--accent-soft", theme.soft], ["--blue", theme.primary], ["--light-blue", theme.primary]].forEach(([key, value]) => root.style.setProperty(key, value));
    localStorage.setItem("pisotrack_theme", validName);
    document.querySelectorAll(".dash-card").forEach(card => { const tab = card.classList.contains("small") ? 2 : 1; card.style.backgroundImage = `url("${validName === "blue" ? `tab${tab}.png` : `tab${tab}_${validName}.png`}")`; });
    window.dispatchEvent(new CustomEvent("pisotrackthemechange", { detail: { name: validName, ...theme } }));
  }
  const saved = String(localStorage.getItem("pisotrack_theme") || "blue").toLowerCase(), initial = themes[saved] ? saved : "blue";
  window.PisoTrackTheme = { themes, apply: applyTheme, get current() { return root.dataset.theme || "blue"; } };
  applyTheme(initial);
  if (localStorage.getItem("pisotrackDark") === "true") root.classList.add("dark");
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => applyTheme(initial), { once: true });
})();
