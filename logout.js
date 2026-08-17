document.addEventListener("DOMContentLoaded", () => {
  if (!document.querySelector('link[href="mobile.css"]')) {
    const mobileStyles = document.createElement("link");
    mobileStyles.rel = "stylesheet";
    mobileStyles.href = "mobile.css";
    document.head.appendChild(mobileStyles);
  }
  const sharedStyle = document.createElement("style");
  sharedStyle.textContent = ".topbar{position:relative}.topbar h2{position:absolute;left:50%;transform:translateX(-50%);text-align:center;white-space:nowrap}.user-box img{transition:transform .18s ease,filter .18s ease}.user-box:hover img,.user-box:focus-visible img{transform:scale(1.16);filter:brightness(1.08)}body.dark .user-box img,body.dark .user-box:hover img,body.dark .user-box:focus-visible img{filter:brightness(0) invert(1)}.dashboard-actions .btn,.actions .btn,.overview-row.balance+div .btn{transition:transform .18s ease,filter .18s ease,box-shadow .18s ease}.dashboard-actions .btn:hover,.dashboard-actions .btn:focus-visible,.actions .btn:hover,.actions .btn:focus-visible,.overview-row.balance+div .btn:hover,.overview-row.balance+div .btn:focus-visible{transform:scale(1.07);filter:brightness(1.08);box-shadow:0 5px 14px rgba(0,0,0,.18)}";
  sharedStyle.textContent += ".topbar>.user-box{margin-left:auto}.profile-page-actions{margin-left:auto;display:flex;align-items:center;gap:16px}.profile-page-icon{width:40px;height:40px;object-fit:contain;transition:transform .18s ease,filter .18s ease}.profile-page-icon:hover{transform:scale(1.16)}body.dark .profile-page-icon{filter:brightness(0) invert(1)}";
  document.head.appendChild(sharedStyle);

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
