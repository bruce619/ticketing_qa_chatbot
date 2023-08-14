const ticketsChartContainer = document.getElementById('ticket-stats')


let ticketsChart;


// Function to update the tickets chart with new data
const updateTicketsChart = (ticketsData) => {
  if (ticketsChart) {
    ticketsChart.data.labels = Object.keys(ticketsData);
    ticketsChart.data.datasets[0].data = Object.values(ticketsData);
    ticketsChart.update();
  } else {
    ticketsChart = new Chart(ticketsChartContainer, {
      type: 'bar',
      data: {
        labels: Object.keys(ticketsData),
        datasets: [
          {
            label: 'Agents',
            data: Object.values(ticketsData),
            borderWidth: 0,
            borderRadius: 5,
            backgroundColor: 'rgb(6, 54, 104)',
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }
};


// Add an event listener to the ticketStatus select element
const ticketStatusSelect = document.getElementById('ticketStatus');
ticketStatusSelect.addEventListener('change', async () => {
  const selectedStatus = ticketStatusSelect.value;
  const responseData = await fetchTicketData(selectedStatus);
  updateTicketsChart(responseData);
});

// Function to fetch ticket data from the server
async function fetchTicketData(ticketStatus) {
  try {
    const response = await fetch(`/api/tickets/status/${ticketStatus}`);
    if (!response.ok) {
      throw new Error('Failed to fetch ticket data');
    }
    const data = await response.json();
    return data.ticketsData;
  } catch (error) {
    console.error('Error fetching ticket data:', error);
    return {};
  }
}