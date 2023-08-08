const addModal = document.querySelector('#addModal')
const addTicketButton = document.querySelector('#addButton')
const closeModalButtons = document.querySelectorAll('.close')
const cancelButton = document.querySelector('#close_button')


let currentTicketId = null; // Initialize the variable to store the ticket ID
let ticketDescription = '' // Initialize the variable to store the ticket ID
let ticketDescriptionTimeStamp = null // Initialize the variable to store the ticket ID


const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

// Function to format a timestamp from a Date object
const getTimestampFromDate = (date) => {
  const timestamp = new Date(date);

  const hours = timestamp.getHours();
  const minutes = timestamp.getMinutes();
  const AmOrPm = hours < 12 ? 'AM' : 'PM';

  const formattedHours = hours % 12 === 0 ? '12' : hours % 12 < 10 ? `0${hours % 12}` : `${hours % 12}`;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;

  return `${formattedHours}:${formattedMinutes} ${AmOrPm}`;
};


// Function to open the chat modal
function openChatModal(ticketId, description, description_time) {
  const chatModal = document.querySelector('#chatModal');
  const chatTitle = document.querySelector('#chatTitle');
  const messagesContainer = document.getElementById('messages');
  
  resetChat();

  currentTicketId =  ticketId

  ticketDescription = description;

  
  // Set chat title and other data based on ticketId
  chatTitle.textContent = `CBI - Ticket ID: ${currentTicketId}`;

  const desc_timestamp = getTimestampFromDate(description_time);

  ticketDescriptionTimeStamp = desc_timestamp

  // Create the first client message using the description
  firstClientMessage({ ticketDescription, ticketDescriptionTimeStamp });

  // Fetch conversation data from the server
  // Retrieve previous conversation for the ticket using an API request
  // Assuming you have a function to fetch conversation data from the API
  fetch(`/api/conversations/${currentTicketId}`)
    .then(response => response.json())
    .then(conversation => {
      conversation.forEach(convo => {
        const messageType = convo.user_role === 'client' ? 'sender' : 'receiver';
        const timestamp = getTimestampFromDate(convo.sent_at); // Assuming convo.sent_at is the timestamp
        const data = { message: convo.message, image: convo.image, timestamp, messageType };
        
        // Use the createChatItem function to create the chat item element
        const chatItem = createChatItem(data);
        
        if (chatItem) {
          messagesContainer.appendChild(chatItem);
        } else {
          console.error('Error creating chat item:', data);
        }
      });
    })
    .catch(error => {
      console.error('Error retrieving conversation:', error);
    });

  chatModal.classList.add('open');
}


// Function to open the edit modal
const openTicketEditModal = async (ticketId, tag, priority, status, agent_email) => {
  const editModal = document.querySelector('#editModal');
  const agentEmailSelect = document.querySelector('#edit_agent_emails');
  const editPriorityInput = document.querySelector('#edit_priority')
  const editStatusInput = document.querySelector('#edit_status')

  // Reset the agent email options
  agentEmailSelect.innerHTML = '<option selected>Select an agent</option>';

  // Construct the URL with query parameters

  // Fetch the list of agent emails from the server using the fetch API
  try {
    const response = await fetch(`/api/agent-emails/${tag}`);
    const text = await response.text(); // Get the response text
    const data = JSON.parse(text);

    // Populate the select options with agent emails
    data.agentEmails.forEach(agentEmail => {
      const option = document.createElement('option');
      option.value = agentEmail;
      option.textContent = agentEmail;
      agentEmailSelect.appendChild(option);
    });

    // Set the ticket ID and tag in the modal
    document.querySelector('#edit_ticketId').value = ticketId;
    editPriorityInput.value = priority
    editStatusInput.value = status
    agentEmailSelect.value = agent_email

    // Open the edit modal
    editModal.classList.add('open');
  } catch (error) {
    console.error('Error fetching agent emails:', error);
  }
};


closeModalButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    btn.parentElement.parentElement.parentElement.classList.remove('open')
  })
})

// Add an event listener to the "Cancel" button
cancelButton.addEventListener('click', () => {
  // Hide the modal by adding the "hidden" class
  addModal.classList.add('hidden');
});


// Function to open the modal
const openModal = () => {
  addModal.classList.remove('hidden');
};

const showAddModal = () => {
  addModal.classList.add('open')
}

// Add click event listener to the button
addTicketButton.addEventListener('click', openModal);
addTicketButton.addEventListener('click', showAddModal)
