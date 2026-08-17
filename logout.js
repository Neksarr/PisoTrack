document.addEventListener("DOMContentLoaded", () => {
  if (!document.querySelector('link[href^="mobile.css"]')) {
    const mobileStyles = document.createElement("link");
    mobileStyles.rel = "stylesheet";
    mobileStyles.href = "mobile.css?v=20260818-4";
    document.head.appendChild(mobileStyles);
  }
  const sharedStyle = document.createElement("style");
  sharedStyle.textContent = ".topbar{position:relative}.topbar h2{position:absolute;left:50%;transform:translateX(-50%);text-align:center;white-space:nowrap}.user-box img{transition:transform .18s ease,filter .18s ease}.user-box:hover img,.user-box:focus-visible img{transform:scale(1.16);filter:brightness(1.08)}html.dark body .user-box img,html.dark body .user-box:hover img,html.dark body .user-box:focus-visible img,body.dark .user-box img,body.dark .user-box:hover img,body.dark .user-box:focus-visible img{filter:brightness(0) invert(1)}.dashboard-actions .btn,.actions .btn,.overview-row.balance+div .btn{transition:transform .18s ease,filter .18s ease,box-shadow .18s ease}.dashboard-actions .btn:hover,.dashboard-actions .btn:focus-visible,.actions .btn:hover,.actions .btn:focus-visible,.overview-row.balance+div .btn:hover,.overview-row.balance+div .btn:focus-visible{transform:scale(1.07);filter:brightness(1.08);box-shadow:0 5px 14px rgba(0,0,0,.18)}";
  sharedStyle.textContent += ".topbar>.user-box{margin-left:auto}.profile-page-actions{margin-left:auto;display:flex;align-items:center;gap:16px}.profile-page-icon{width:40px;height:40px;object-fit:contain;transition:transform .18s ease,filter .18s ease}.profile-page-icon:hover{transform:scale(1.16)}html.dark body .profile-page-icon,body.dark .profile-page-icon{filter:brightness(0) invert(1)}";
  sharedStyle.textContent += ".pt-confirm-backdrop{position:fixed;inset:0;z-index:1000;display:none;align-items:center;justify-content:center;padding:24px;background:rgba(0,0,0,.58)}.pt-confirm-backdrop.open{display:flex}.pt-confirm-card{width:min(440px,100%);background:var(--card);color:var(--text);border-radius:20px;padding:24px;box-shadow:0 16px 45px rgba(0,0,0,.28)}.pt-confirm-card h3{margin:0 0 12px;font-size:24px}.pt-confirm-card p{margin:0;color:var(--muted);font-size:15px;line-height:1.5}.pt-confirm-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:22px}.pt-confirm-button{border:0;border-radius:12px;padding:12px 18px;font:inherit;font-weight:bold;cursor:pointer}.pt-confirm-cancel{background:transparent;color:var(--blue);border:1px solid var(--blue)}.pt-confirm-action{background:var(--blue);color:#fff}.pt-confirm-action.danger{background:#a64040}@media(max-width:520px){.pt-confirm-backdrop{padding:16px}.pt-confirm-card{padding:22px}.pt-confirm-actions{display:grid;grid-template-columns:1fr 1fr}.pt-confirm-button{width:100%}}";
  document.head.appendChild(sharedStyle);

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
    ["transactions.html", "purchaseicon.png", "Transactions"],
    ["reports.html", "reporticon.png", "Reports"],
    ["settings.html", "settingicon.png", "Settings"]
  ];
  mobileNav.innerHTML = mobilePages.map(([href, icon, label]) => `<a href="${href}" class="${currentPage === href ? "active" : ""}"><img src="${icon}" alt=""><span>${label}</span></a>`).join("");
  document.body.appendChild(mobileNav);
  const userLink = document.createElement("a");
  userLink.className = "nav-item" + (currentPage === "users.html" ? " active" : "");
  userLink.href = "users.html";
  userLink.innerHTML = '<img src="profileicon.png" alt=""><span>User</span>';
  sidebar.insertBefore(userLink, footer);

  if (currentPage !== "users.html") {
    const profileLink = document.querySelector(".user-box");
    const profileText = profileLink?.querySelector("span");
    if (profileText) profileText.hidden = true;
    if (profileLink) {
      profileLink.setAttribute("aria-label", "Open user profile");
      profileLink.title = "User profile";
    }
  } else {
    const topbar = document.querySelector(".topbar");
    const backHome = topbar?.querySelector(".user-box");
    if (topbar && backHome) {
      backHome.style.marginLeft = "0";
      backHome.style.marginRight = "auto";
      topbar.prepend(backHome);
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
