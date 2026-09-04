(function () {
  const controls = document.querySelector(".report-controls"),
    previous = document.getElementById("prev"),
    label = document.getElementById("monthLabel"),
    nextButton = document.getElementById("next");
  if (!controls || !previous || !label || !nextButton) return;
  const monthNav = document.createElement("div");
  monthNav.className = "month-nav";
  controls.insertBefore(monthNav, previous);
  monthNav.append(previous, label, nextButton);
})();
