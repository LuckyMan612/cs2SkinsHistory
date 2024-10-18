document.addEventListener('DOMContentLoaded', async function() {
    const skinsChartElem = document.getElementById('skinsChart').getContext('2d');
    const viewModeSelect = document.getElementById('viewMode');
    const dataTypeSelect = document.getElementById('dataType');
    
    const response = await fetch('https://raw.githubusercontent.com/LuckyMan612/cs2SkinsHistory/refs/heads/main/api/history.json');
    const history = await response.json();
  
    let filteredData = history;
    let currentDataType = 'total';
    let currentViewMode = 'daily';
  
    // Helper functions to filter by date
    function isNewDay(currentEntry, previousEntry) {
      return !previousEntry || currentEntry.date.split('T')[0] !== previousEntry.date.split('T')[0];
    }
  
    function isNewWeek(currentEntry, previousEntry) {
      const currentDate = new Date(currentEntry.date);
      const previousDate = previousEntry ? new Date(previousEntry.date) : null;
      return !previousDate || (currentDate - previousDate) >= (7 * 24 * 60 * 60 * 1000); // 7 days in ms
    }
  
    function isNewMonth(currentEntry, previousEntry) {
      return !previousEntry || currentEntry.date.slice(0, 7) !== previousEntry.date.slice(0, 7);
    }
  
    function isNewYear(currentEntry, previousEntry) {
      return !previousEntry || currentEntry.date.slice(0, 4) !== previousEntry.date.slice(0, 4);
    }
  
    // Function to filter data based on viewMode and dataType
    function filterData(viewMode, dataType) {
      const filtered = [];
      let maxSkinsForDay = 0;
      let lastEntryForMonth = null;
      let lastEntryForYear = null;
      let lastEntryForWeek = null;
  
      history.forEach((entry, index) => {
        const currentDate = entry.date.split('T')[0]; // Get only the date part (YYYY-MM-DD)
  
        if (viewMode === 'daily') {
          if (isNewDay(entry, history[index - 1])) {
            maxSkinsForDay = entry.skins;
            filtered.push({ date: currentDate, skins: maxSkinsForDay });
          } else if (entry.skins > maxSkinsForDay) {
            maxSkinsForDay = entry.skins;
            filtered[filtered.length - 1].skins = maxSkinsForDay; // Update the max skin count for this day
          }
        } else if (viewMode === 'weekly') {
          if (isNewWeek(entry, history[index - 1])) {
            lastEntryForWeek = { date: currentDate, skins: entry.skins };
            filtered.push(lastEntryForWeek);
          } else {
            lastEntryForWeek.skins = entry.skins; // Update latest weekly data
          }
        } else if (viewMode === 'monthly') {
          if (isNewMonth(entry, history[index - 1])) {
            if (lastEntryForMonth) {
              filtered.push(lastEntryForMonth);
            }
            lastEntryForMonth = { date: entry.date.slice(0, 7), skins: entry.skins }; // YYYY-MM
          } else {
            lastEntryForMonth.skins = entry.skins; // Take the latest entry in the month
          }
        } else if (viewMode === 'yearly') {
          if (isNewYear(entry, history[index - 1])) {
            if (lastEntryForYear) {
              filtered.push(lastEntryForYear);
            }
            lastEntryForYear = { date: entry.date.slice(0, 4), skins: entry.skins }; // YYYY
          } else {
            lastEntryForYear.skins = entry.skins; // Take the latest entry in the year
          }
        }
      });
  
      // Push the last entry for month or year if needed
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
        filtered.shift(); // Remove the first entry to hide the initial large difference
      }
  
      return filtered;
    }
  
    // Function to update chart
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
  
    // Initialize chart
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
  
    // Initial filtering of data and chart update
    filteredData = filterData(currentViewMode, currentDataType);
    updateChart();
  });
  
