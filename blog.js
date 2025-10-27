const currentPage = window.location.pathname;

document.querySelectorAll("nav a").forEach(link => {
  if (link.getAttribute("href") === currentPage) {
    link.classList.add("active");
    link.style.pointerEvents = "none";
  }
});
