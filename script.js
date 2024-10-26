    const response = await fetch('https://raw.githubusercontent.com/LuckyMan612/cs2SkinsHistory/refs/heads/main/api/history.json');
    const history = await response.json();
    
    let filteredData = [];
    let filteredData = history;
    let currentDataType = 'total';
    let currentViewMode = 'weekly';
    let currentViewMode = 'daily';

    // Helper functions for date filtering
    // Helper functions to filter by date
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
@@ -29,65 +23,63 @@ document.addEventListener('DOMContentLoaded', async function() {
        return !previousEntry || currentEntry.date.slice(0, 4) !== previousEntry.date.slice(0, 4);
    }

    // Filtering data based on view mode and data type
    // Function to filter data based on viewMode and dataType
    function filterData(viewMode, dataType) {
        const filtered = [];
        let lastEntry = null;
        let prevSkins = 0;
        let maxSkinsForDay = 0;
        const startDate = new Date("2024-10-18");
        let lastEntryForMonth = null;
        let lastEntryForYear = null;

        history.forEach((entry, index) => {
            const currentDate = entry.date.split('T')[0];
            const currentDate = entry.date.split('T')[0]; // Get only the date part (YYYY-MM-DD)

            if (viewMode === 'daily' && new Date(entry.date) >= startDate) {
                if (isNewDay(entry, lastEntry)) {
            if (viewMode === 'daily' && currentDate >= '2024-10-18') {
                if (isNewDay(entry, history[index - 1])) {
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
                if (isNewMonth(entry, history[index - 1])) {
                    if (lastEntryForMonth) {
                        filtered.push(lastEntryForMonth);
                    }
                    lastEntryForMonth = { date: entry.date.slice(0, 7), skins: entry.skins }; // YYYY-MM
                } else {
                    lastEntry.skins = entry.skins;
                    lastEntryForMonth.skins = entry.skins;
                }
            } else if (viewMode === 'yearly') {
                if (isNewYear(entry, lastEntry)) {
                    if (lastEntry) filtered.push(lastEntry);
                    lastEntry = { date: entry.date.slice(0, 4), skins: entry.skins };
                if (isNewYear(entry, history[index - 1])) {
                    if (lastEntryForYear) {
                        filtered.push(lastEntryForYear);
                    }
                    lastEntryForYear = { date: entry.date.slice(0, 4), skins: entry.skins }; // YYYY
                } else {
                    lastEntry.skins = entry.skins;
                    lastEntryForYear.skins = entry.skins;
                }
            }
        });

        if ((viewMode === 'monthly' || viewMode === 'yearly') && lastEntry) {
            filtered.push(lastEntry);
        if (viewMode === 'monthly' && lastEntryForMonth) {
            filtered.push(lastEntryForMonth);
        }
        if (viewMode === 'yearly' && lastEntryForYear) {
            filtered.push(lastEntryForYear);
        }

        // Adjust for dataType (total vs difference)
        if (dataType === 'difference') {
            for (let i = filtered.length - 1; i > 0; i--) {
                filtered[i].skins = filtered[i].skins - filtered[i - 1].skins;
            }
            if (viewMode !== 'yearly') filtered.shift(); // Remove first entry for accurate difference
            filtered.shift(); // Remove the first entry to hide the initial large difference
        }

        return filtered;
    }

    // Function to update the chart
    function updateChart() {
        const labels = filteredData.map(entry => entry.date);
        const data = filteredData.map(entry => entry.skins);
@@ -97,7 +89,6 @@ document.addEventListener('DOMContentLoaded', async function() {
        skinsChart.update();
    }

    // Event listeners for viewMode and dataType changes
    viewModeSelect.addEventListener('change', () => {
        currentViewMode = viewModeSelect.value;
        filteredData = filterData(currentViewMode, currentDataType);
@@ -110,7 +101,6 @@ document.addEventListener('DOMContentLoaded', async function() {
        updateChart();
    });

    // Initialize the chart
    const skinsChart = new Chart(skinsChartElem, {
        type: 'line',
        data: {
@@ -135,7 +125,6 @@ document.addEventListener('DOMContentLoaded', async function() {
        }
    });

    // Initial data filtering and chart update
    filteredData = filterData(currentViewMode, currentDataType);
    updateChart();
});
