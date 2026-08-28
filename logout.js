document.addEventListener("DOMContentLoaded", () => {
  if (!document.querySelector('link[href^="mobile.css"]')) {
    const mobileStyles = document.createElement("link");
    mobileStyles.rel = "stylesheet";
    mobileStyles.href = "mobile.css?v=20260818-5";
    document.head.appendChild(mobileStyles);
  }
  const confirmBackdrop = document.createElement("div");
  confirmBackdrop.className = "pt-confirm-backdrop";
  confirmBackdrop.innerHTML = '<div class="pt-confirm-card" role="dialog" aria-modal="true" aria-labelledby="ptConfirmTitle" aria-describedby="ptConfirmMessage"><h3 id="ptConfirmTitle"></h3><p id="ptConfirmMessage"></p><div class="pt-confirm-actions"><button type="button" class="pt-confirm-button pt-confirm-cancel">Cancel</button><button type="button" class="pt-confirm-button pt-confirm-action"></button></div></div>';
  document.body.appendChild(confirmBackdrop);
  const confirmTitle = confirmBackdrop.querySelector("#ptConfirmTitle");
  const confirmMessage = confirmBackdrop.querySelector("#ptConfirmMessage");
  const confirmCancel = confirmBackdrop.querySelector(".pt-confirm-cancel");
  const confirmAction = confirmBackdrop.querySelector(".pt-confirm-action");
  let finishConfirmation = null;
  function closeConfirmation(result) {
    confirmBackdrop.classList.remove("open");
    if (finishConfirmation) {
      const finish = finishConfirmation;
      finishConfirmation = null;
      finish(result);
    }
  }
  window.pisoTrackConfirm = ({ title, message, confirmText, danger = false }) => new Promise(resolve => {
    if (finishConfirmation) closeConfirmation(false);
    finishConfirmation = resolve;
    confirmTitle.textContent = title;
    confirmMessage.textContent = message;
    confirmAction.textContent = confirmText;
    confirmAction.classList.toggle("danger", danger);
    confirmBackdrop.classList.add("open");
    confirmCancel.focus();
  });
  confirmCancel.addEventListener("click", () => closeConfirmation(false));
  confirmAction.addEventListener("click", () => closeConfirmation(true));
  confirmBackdrop.addEventListener("click", event => { if (event.target === confirmBackdrop) closeConfirmation(false); });

  const sidebar = document.querySelector(".sidebar");
  const footer = sidebar?.querySelector(".sidebar-bottom");
  if (!sidebar || !footer || sidebar.querySelector(".sidebar-logout")) return;
  footer.textContent = "PisoTrack Website";

  const currentPage = location.pathname.split("/").pop().toLowerCase() || "index.html";
  const mobileNav = document.createElement("nav");
  mobileNav.className = "mobile-bottom-nav";
  mobileNav.setAttribute("aria-label", "Primary navigation");
  const mobilePages = [
    ["index.html", "homeicon.png", "Home"],
    ["dashboard.html", "purchaseicon.png", "Dashboard"],
    ["reports.html", "reporticon.png", "Reports"],
    ["settings.html", "settingicon.png", "Settings"]
  ];
  mobileNav.innerHTML = mobilePages.map(([href, icon, label]) => `<a href="${href}" class="${currentPage === href ? "active" : ""}"><img src="${icon}" alt=""><span>${label}</span></a>`).join("");
  document.body.appendChild(mobileNav);
  if (currentPage !== "settings.html") {
    const profileLink = document.querySelector(".user-box");
    const profileText = profileLink?.querySelector("span");
    if (profileText) profileText.hidden = true;
    if (profileLink) {
      profileLink.setAttribute("aria-label", "Open user profile");
      profileLink.title = "User profile";
    }
  }

  const button = document.createElement("button");
  button.type = "button";
  button.className = "nav-item sidebar-logout";
  button.innerHTML = '<img src="logout.png" alt=""><span>Logout</span>';
  Object.assign(button.style, {
    width: "100%",
    border: "0",
    background: "transparent",
    fontFamily: "inherit",
    fontSize: "inherit",
    textAlign: "left",
    cursor: "pointer",
    marginTop: "auto"
  });
  footer.style.marginTop = "0";
  button.addEventListener("mouseenter", () => { button.style.background = "rgba(255, 255, 255, .16)"; });
  button.addEventListener("mouseleave", () => { button.style.background = "transparent"; });
  button.addEventListener("focus", () => { button.style.background = "rgba(255, 255, 255, .16)"; });
  button.addEventListener("blur", () => { button.style.background = "transparent"; });
  sidebar.insertBefore(button, footer);

  button.addEventListener("click", async () => {
    if (!await window.pisoTrackConfirm({title:"Log Out?",message:"Are you sure you want to log out?",confirmText:"Log Out"})) return;
    button.disabled = true;
    button.querySelector("span").textContent = "Logging out...";
    try {
      const [{ getApps, getApp }, { getAuth, signOut }] = await Promise.all([
        import("https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js")
      ]);
      if (getApps().length) await signOut(getAuth(getApp()));
    } finally {
      location.href = "login.html";
    }
  });
});
