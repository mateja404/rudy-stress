// sidebar

const menuButton = document.querySelector(".menu-btn");
const sidebar = document.querySelector(".sidebar");

menuButton.addEventListener("click", function() {
    sidebar.classList.toggle("active-sidebar");
});