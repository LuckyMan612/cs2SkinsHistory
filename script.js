document.addEventListener('DOMContentLoaded', async function () {
    const skinsChartElem = document.getElementById('skinsChart').getContext('2d');
    const viewModeSelect = document.getElementById('viewMode');
    const dataTypeSelect = document.getElementById('dataType');
    const betaViewButton = document.getElementById('betaViewButton');

    let history = [];
    let isBetaView = false;
    let filteredData = [];
    let currentViewMode = 'daily';
    let currentDataType = 'total';

    // Pobieranie danych
    async function fetchData() {
        const historyResponse = await fetch('https://luckyman612.github.io/cs2SkinsHistory/api/history.json');
        const historyData = await historyResponse.json();

        if (!isBetaView) {
            return historyData;
        }

        const oldResponse = await fetch('https://luckyman612.github.io/cs2SkinsHistory/api/old.json');
        const oldData = await oldResponse.json();

        // Łącz dane - old.json do 2024-10-17, reszta z history.json
        const combinedData = oldData.concat(historyData.filter(entry => entry.date > '2024-10-17'));

        return combinedData;
    }

    // Funkcje pomocnicze do filtrowania dat
    function isNewDay(currentEntry, previousEntry) {
        return !previousEntry || currentEntry.date.split('T')[0] !== previousEntry.date.split('T')[0];
    }

    function isNewMonth(currentEntry, previousEntry) {
        return !previousEntry || currentEntry.date.slice(0, 7) !== previousEntry.date.slice(0, 7);
    }

    function isNewYear(currentEntry, previousEntry) {
        return !previousEntry || currentEntry.date.slice(0, 4) !== previousEntry.date.slice(0, 4);
    }

    // Filtrowanie danych na podstawie trybu widoku i typu danych
    function filterData(viewMode, dataType, data) {
        const filtered = [];
        let maxSkinsForDay = 0;
        let lastEntryForMonth = null;
        let lastEntryForYear = null;

        data.forEach((entry, index) => {
            const currentDate = entry.date.split('T')[0];

            if (viewMode === 'daily') {
                if (isNewDay(entry, data[index - 1])) {
                    maxSkinsForDay = entry.skins;
                    filtered.push({ date: currentDate, skins: maxSkinsForDay });
                } else if (entry.skins > maxSkinsForDay) {
                    maxSkinsForDay = entry.skins;
                    filtered[filtered.length - 1].skins = maxSkinsForDay;
                }
            } else if (viewMode === 'monthly') {
                if (isNewMonth(entry, data[index - 1])) {
                    if (lastEntryForMonth) {
                        filtered.push(lastEntryForMonth);
                    }
                    lastEntryForMonth = { date: entry.date.slice(0, 7), skins: entry.skins };
                } else {
                    lastEntryForMonth.skins = entry.skins;
                }
            } else if (viewMode === 'yearly') {
                if (isNewYear(entry, data[index - 1])) {
                    if (lastEntryForYear) {
                        filtered.push(lastEntryForYear);
                    }
                    lastEntryForYear = { date: entry.date.slice(0, 4), skins: entry.skins };
                } else {
                    lastEntryForYear.skins = entry.skins;
                }
            }
        });

        if (viewMode === 'monthly' && lastEntryForMonth) {
            filtered.push(lastEntryForMonth);
        }
        if (viewMode === 'yearly' && lastEntryForYear) {
            filtered.push(lastEntryForYear);
        }

        if (dataType === 'difference') {
            for (let i = filtered.length - 1; i > 0; i--) {
                filtered[i].skins = filtered[i].skins - filtered[i - 1].skins;
            }
            filtered.shift(); // Usuń pierwszy wpis
        }

        return filtered;
    }

    // Aktualizacja wykresu
    function updateChart() {
        const labels = filteredData.map(entry => entry.date);
        const data = filteredData.map(entry => entry.skins);

        skinsChart.data.labels = labels;
        skinsChart.data.datasets[0].data = data;
        skinsChart.update();
    }

    // Inicjalizacja wykresu
    const skinsChart = new Chart(skinsChartElem, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Skins',
                data: [],
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

    // Obsługa zmiany trybu widoku
    viewModeSelect.addEventListener('change', async () => {
        currentViewMode = viewModeSelect.value;
        filteredData = filterData(currentViewMode, currentDataType, history);
        updateChart();
    });

    // Obsługa zmiany typu danych
    dataTypeSelect.addEventListener('change', async () => {
        currentDataType = dataTypeSelect.value;
        filteredData = filterData(currentViewMode, currentDataType, history);
        updateChart();
    });

    // Obsługa przycisku Beta View
    betaViewButton.addEventListener('click', async () => {
        isBetaView = !isBetaView;
        betaViewButton.textContent = isBetaView ? "Beta View (ON)" : "Beta View";
        history = await fetchData();
        filteredData = filterData(currentViewMode, currentDataType, history);
        updateChart();
    });

    // Pobierz dane początkowe i załaduj wykres
    history = await fetchData();
    filteredData = filterData(currentViewMode, currentDataType, history);
    updateChart();
});
