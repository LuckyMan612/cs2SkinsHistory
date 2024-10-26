document.addEventListener('DOMContentLoaded', async function () {
  const skinsChartElem = document.getElementById('skinsChart').getContext('2d');
  const viewModeSelect = document.getElementById('viewMode');
  const dataTypeSelect = document.getElementById('dataType');
  
  const response = await fetch('https://raw.githubusercontent.com/LuckyMan612/cs2SkinsHistory/refs/heads/main/api/history.json');
  const history = await response.json();

  let filteredData = history;
  let currentDataType = 'total';
  let currentViewMode = 'daily';

  function isNewDay(currentEntry, previousEntry) {
    return !previousEntry || currentEntry.date.split('T')[0] !== previousEntry.date.split('T')[0];
  }

  function isNewMonth(currentEntry, previousEntry) {
    return !previousEntry || currentEntry.date.slice(0, 7) !== previousEntry.date.slice(0, 7);
  }

  function isNewYear(currentEntry, previousEntry) {
    return !previousEntry || currentEntry.date.slice(0, 4) !== previousEntry.date.slice(0, 4);
  }

  function filterData(viewMode, dataType) {
    const filtered = [];
    let prevSkins = 0;
    let maxSkinsForDay = 0;
    let lastEntryForMonth = null;
    let lastEntryForYear = null;
    let startDate = new Date("2024-10-18");

    history.forEach((entry, index) => {
      const entryDate = new Date(entry.date);
      if (entryDate < startDate) return;

      const currentDate = entry.date.split('T')[0];
      
      if (viewMode === 'daily') {
        if (isNewDay(entry, history[index - 1])) {
          maxSkinsForDay = entry.skins;
          filtered.push({ date: currentDate, skins: maxSkinsForDay });
        } else if (entry.skins > maxSkinsForDay) {
          maxSkinsForDay = entry.skins;
          filtered[filtered.length - 1].skins = maxSkinsForDay;
        }
      } else if (viewMode === 'monthly') {
        if (isNewMonth(entry, history[index - 1])) {
          if (lastEntryForMonth) {
            filtered.push(lastEntryForMonth);
          }
          lastEntryForMonth = { date: entry.date.slice(0, 7), skins: entry.skins };
        } else {
          lastEntryForMonth.skins = entry.skins;
        }
      } else if (viewMode === 'yearly') {
        if (isNewYear(entry, history[index - 1])) {
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
      filtered.shift();
    }

    return filtered;
  }

  function updateChart() {
    const labels = filteredData.map(entry => entry.date);
    const data = filteredData.map(entry => entry.skins);
    
    skinsChart.data.labels = labels;
    skinsChart.data.datasets[0].data = data;
    skinsChart.update();
  }

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

  filteredData = filterData(currentViewMode, currentDataType);
  updateChart();
});
