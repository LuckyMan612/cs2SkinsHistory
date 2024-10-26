document.addEventListener('DOMContentLoaded', async function() {
    const skinsChartElem = document.getElementById('skinsChart').getContext('2d');
    const viewModeSelect = document.getElementById('viewMode');
    const dataTypeSelect = document.getElementById('dataType');
    
    const response = await fetch('https://raw.githubusercontent.com/LuckyMan612/cs2SkinsHistory/refs/heads/main/api/history.json');
    const history = await response.json();
    
    let filteredData = [];
    let currentDataType = 'total';
    let currentViewMode = 'weekly';

    // Helper functions for date filtering
    function isNewDay(currentEntry, previousEntry) {
        return !previousEntry || currentEntry.date.split('T')[0] !== previousEntry.date.split('T')[0];
    }

    function isNewWeek(currentEntry, previousEntry) {
        const currentDate = new Date(currentEntry.date);
        const previousDate = previousEntry ? new Date(previousEntry.date) : null;
        return !previousDate || currentDate - previousDate >= 7 * 24 * 60 * 60 * 1000; // 7 days in ms
    }

    function isNewMonth(currentEntry, previousEntry) {
        return !previousEntry || currentEntry.date.slice(0, 7) !== previousEntry.date.slice(0, 7);
    }

    function isNewYear(currentEntry, previousEntry) {
        return !previousEntry || currentEntry.date.slice(0, 4) !== previousEntry.date.slice(0, 4);
    }

    // Filtering data based on view mode and data type
    function filterData(viewMode, dataType) {
        const filtered = [];
        let lastEntry = null;
        let maxSkinsForDay = 0;

        history.forEach((entry, index) => {
            const currentDate = entry.date.split('T')[0];
            const startDate = new Date("2024-10-18");

            if (viewMode === 'daily' && new Date(entry.date) >= startDate) {
                if (isNewDay(entry, lastEntry)) {
                    maxSkinsForDay = entry.skins;
                    filtered.push({ date: currentDate, skins: maxSkinsForDay });
                } else if (entry.skins > maxSkinsForDay) {
                    maxSkinsForDay = entry.skins;
                    filtered[filtered.length - 1].skins = maxSkinsForDay;
                }
                lastEntry = entry;
            } else if (viewMode === 'weekly' && new Date(entry.date) >= startDate) {
                if (isNewWeek(entry, lastEntry)) {
                    filtered.push({ date: currentDate, skins: entry.skins });
                } else {
                    filtered[filtered.length - 1].skins = entry.skins;
                }
                lastEntry = entry;
            } else if (viewMode === 'monthly') {
                if (isNewMonth(entry, lastEntry)) {
                    if (lastEntry) filtered.push(lastEntry);
                    lastEntry = { date: entry.date.slice(0, 7), skins: entry.skins };
                } else {
                    lastEntry.skins = entry.skins;
                }
            } else if (viewMode === 'yearly') {
                if (isNewYear(entry, lastEntry)) {
                    if (lastEntry) filtered.push(lastEntry);
                    lastEntry = { date: entry.date.slice(0, 4), skins: entry.skins };
                } else {
                    lastEntry.skins = entry.skins;
                }
            }
        });

        if ((viewMode === 'monthly' || viewMode === 'yearly') && lastEntry) {
            filtered.push(lastEntry);
        }

        // Adjust for dataType (total vs difference)
        if (dataType === 'difference') {
            for (let i = filtered.length - 1; i > 0; i--) {
                filtered[i].skins = filtered[i].skins - filtered[i - 1].skins;
            }
            filtered.shift(); // Remove the first entry for accurate difference
        }

        return filtered;
    }

    // Function to update the chart
    function updateChart() {
        const labels = filteredData.map(entry => entry.date);
        const data = filteredData.map(entry => entry.skins);
        
        skinsChart.data.labels = labels;
        skinsChart.data.datasets[0].data = data;
        skinsChart.update();
    }

    // Event listeners for viewMode and dataType changes
    viewModeSelect.addEventListener('change', () => {
        currentViewMode = viewModeSelect.value;
        filteredData = filterData(currentViewMode, currentDataType);
        updateChart();
    });

    dataTypeSelect.addEventListener('change', () => {
        currentDataType = dataTypeSelect.value;
        filteredData = filterData(currentViewMode, currentDataType);
        updateChart();
    });

    // Initialize the chart
    const skinsChart = new Chart(skinsChartElem, {
        type: 'line',
        data: {
            labels: filteredData.map(entry => entry.date),
            datasets: [{
                label: 'Skins',
                data: filteredData.map(entry => entry.skins),
                backgroundColor: 'rgba(97, 218, 251, 0.2)',
                borderColor: '#61dafb',
                borderWidth: 2,
                pointBackgroundColor: '#61dafb',
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Initial data filtering and chart update
    filteredData = filterData(currentViewMode, currentDataType);
    updateChart();
});
