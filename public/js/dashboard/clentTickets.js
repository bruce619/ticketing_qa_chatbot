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


// Function to open the rating modal and set the form action
const openRatingModal = (ticketId) => {
  const ratingModal = document.querySelector('#ratingModal');
  const ratingForm = document.querySelector('#rating-form');
  
  // Update the form action with the ticket ID
  ratingForm.action = `/dashboard/rate/ticket/${ticketId}`;

  // Open the rating modal
  ratingModal.classList.add('open');
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
