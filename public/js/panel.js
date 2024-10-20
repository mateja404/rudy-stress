// sidebar

const menuButton = document.querySelector(".menu-btn");
const sidebar = document.querySelector(".sidebar");

menuButton.addEventListener("click", function() {
    sidebar.classList.toggle("active-sidebar");
});

// tabs

const tabs = document.querySelectorAll('[data-tab-target]');
const tabContents = document.querySelectorAll('[data-tab-content]');
const tabButtons = document.querySelectorAll('.tabButton');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabContents.forEach(tabContent => {
            tabContent.classList.remove('actives');
        });

        const target = document.querySelector(tab.dataset.tabTarget);
        if (target) {
            target.classList.add('actives');
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tabButton');

    tabButtons.forEach(tabButton => {
        tabButton.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('selected'));

            tabButton.classList.add('selected');
        });
    });
});

// conc display

let concValue = document.querySelector(".concRange");
let displayValue = document.querySelector(".display-conc");

concValue.addEventListener('input', function() {
    displayValue.textContent = concValue.value;
});

function firstConcValue() {
    displayValue.textContent = concValue.value;
}
firstConcValue();