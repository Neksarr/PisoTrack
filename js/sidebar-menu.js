(function () {
  function init() {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;

    let button = document.querySelector(".menu-toggle");
    let overlay = document.querySelector(".menu-overlay");

    if (!button) {
      button = document.createElement("button");
      button.className = "menu-toggle";
      button.type = "button";
      button.innerHTML = '<img src="3lines.png" alt="">';
      document.body.prepend(button);
    }
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "menu-overlay";
      document.body.prepend(overlay);
    }

    button.setAttribute("aria-label", "Open navigation menu");
    button.setAttribute("aria-expanded", "false");

    function setMenu(open) {
      sidebar.classList.toggle("menu-open", open);
      overlay.classList.toggle("open", open);
      document.body.classList.toggle("nav-open", open);
      button.setAttribute("aria-expanded", String(open));
      button.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    }

    button.addEventListener("click", () => setMenu(!sidebar.classList.contains("menu-open")));
    overlay.addEventListener("click", () => setMenu(false));
    sidebar.querySelectorAll("a").forEach(link => link.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") setMenu(false);
    });
  }

  init();
})();
