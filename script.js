document.addEventListener('DOMContentLoaded', async function() {
    const betaViewButton = document.getElementById('betaViewButton');
    let isBetaView = false;

    async function fetchData() {
        const historyResponse = await fetch('https://luckyman612.github.io/cs2SkinsHistory/api/history.json');
        const historyData = await historyResponse.json();

        if (!isBetaView) return historyData;

        const oldResponse = await fetch('https://luckyman612.github.io/cs2SkinsHistory/api/old.json');
        const oldData = await oldResponse.json();

        return oldData.concat(historyData.filter(entry => entry.date >= '2024-10-17'));
    }

    betaViewButton.addEventListener('click', async () => {
        isBetaView = !isBetaView; // Toggle Beta View
        betaViewButton.textContent = isBetaView ? "Beta View (ON)" : "Beta View";

        const data = await fetchData();
        filteredData = filterData(currentViewMode, currentDataType, data);
        updateChart();
    });

    function filterData(viewMode, dataType, data) {
        // Przeniesiona funkcja filterData powinna obsługiwać dynamicznie dane.
        // ...
    }

    // Inicjalizacja wykresu i jego odświeżanie pozostają bez zmian.
});
