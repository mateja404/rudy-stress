// chart.js

let chartInstance;

function fetchAndUpdateChart() {
    // Staticki podaci
    const labels = ['DNS', 'CLOUDFLARE', 'COOKIES', 'TCP-BYPASS', 'TCP-SYN'];
    const counts = [12, 19, 3, 5, 2]; // Primer brojeva

    const backgroundColors = [
        'rgb(255, 99, 132)',
        'rgb(54, 162, 235)',
        'rgb(255, 206, 86)',
        'rgb(75, 192, 192)',
        'rgb(153, 102, 255)'
    ];

    const chartData = {
        labels: labels,
        datasets: [{
            label: 'Attacks',
            data: counts,
            backgroundColor: backgroundColors,
            hoverOffset: 4
        }]
    };

    if (chartInstance) {
        chartInstance.data = chartData;
        chartInstance.update();
    } else {
        const config = {
            type: 'doughnut',
            data: chartData,
            options: {
                plugins: {
                    legend: {
                        display: true,
                    }
                }
            }
        };

        const ctx = document.getElementById("noviChart").getContext("2d");
        chartInstance = new Chart(ctx, config);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    fetchAndUpdateChart();
    setInterval(fetchAndUpdateChart, 5 * 60 * 1000); // Refresh every 5 minutes
});

// sidebar

const menuButton = document.querySelector(".menu-btn");
const sidebar = document.querySelector(".sidebar");

menuButton.addEventListener("click", function() {
    sidebar.classList.toggle("active-sidebar");
});