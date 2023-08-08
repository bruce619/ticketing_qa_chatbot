const ticketsChartContainer = document.getElementById('ticket-stats')
const usersChartContainer = document.getElementById('users-stats')
const ticketsList = document.querySelector('.tickets_list')

const tickets = [
  {
    id: '123456',
    name: 'John Doe',
    email: 'j.doe@email.com',
    title: 'Data tickets',
    priority: 'HIGH',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    status: 'Open',
  },
  {
    id: '12345678',
    name: 'John Doe',
    email: 'j.doe@email.com',
    title: 'Data tickets',
    priority: 'MEDIUM',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    status: 'Open',
  },
  {
    id: '1234569102',
    name: 'John Doe',
    email: 'j.doe@email.com',
    title: 'Data tickets',
    priority: 'LOW',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    status: 'Closed',
  },
]

const ticketsData = {
  'Micheal Edwards': 185,
  'John Doe': 305,
  'Jane Doe': 225,
  'Jordan Smith': 112,
}

const usersData = {
  Clients: 12,
  Agents: 19,
}

let ticketsChart = new Chart(ticketsChartContainer, {
  type: 'bar',
  data: {
    labels: Object.keys(ticketsData),
    datasets: [
      {
        label: 'Agents Tickets',
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
})

let usersChart = new Chart(usersChartContainer, {
  type: 'bar',
  data: {
    labels: Object.keys(usersData),
    datasets: [
      {
        label: 'Total Users',
        data: Object.values(usersData),
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
})

const updateChart = (chart, newData, oldData) => {
  // Replace default dataset with new dataset
  Object.assign(oldData, newData)

  // Fetch data from the database and replace old data
  chart.data.labels = Object.keys(data)
  chart.data.datasets.forEach((dataset) => {
    dataset.data = Object.values(data)
  })

  chart.update()
}

// Add new Data to Ticket List
const addTicketData = (data) => {
  const { title, name, status } = data

  const ticketListItem = document.createElement('li')
  ticketListItem.className = 'tickets_list-item'

  ticketListItem.innerHTML = `
  
  <div class="tickets_list-item-details">
   <p>${title}</p>
   <small>Created by: <span>${name}</span></small>
  </div>
  <div class="tickets_list-item-status">
    <span class="status ${status.toLowerCase()}">${status}</span>
    <span class="date">13/07/2023</span>
  </div>
  
  `

  ticketsList.appendChild(ticketListItem)
}

//create chat item
const createChatItem = (message, type) => {
  const chatElement = document.createElement('div')

  type === 'reciever'
    ? chatElement.classList.add('chat__message', 'chat__message-reciever')
    : chatElement.classList.add('chat__message', 'chat__message-sender')

  const chatContent =
    type === 'reciever'
      ? `<img src='../images/logo purple.png' /> <p>${message}<span>${getMessageTime()}</span></p>`
      : `<p>${message} <span>${getMessageTime()}</span></p>`

  chatElement.innerHTML = chatContent

  return chatElement
}

tickets.forEach((item) => {
  addTicketData(item)
})
