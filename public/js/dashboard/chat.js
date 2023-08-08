const messagesContainer = document.getElementById('messages');
const chatInput = document.querySelector('.chat__popup-bottom textarea');
const sendBtn = document.getElementById('send');
const attachInput = document.getElementById('attach')

// Create and append a chat item
const createChatItem = (data) => {
  const { message, image, timestamp, messageType } = data;

  const chatElement = document.createElement('div');
  const imageElement = document.createElement('img');
  const userImage = document.createElement('img');
  const chatparagraph = document.createElement('p');
  const timestampSpan = document.createElement('span');

  imageElement.src = image;
  userImage.src = '/img/circle-user-duotone.svg';

  chatparagraph.textContent = message;
  timestampSpan.textContent = timestamp;

  if (image) {
    chatparagraph.insertBefore(imageElement, chatparagraph.firstChild);
  }

  if (messageType === 'sender') {
    chatElement.classList.add('chat__message', 'chat__message-sender');
    chatElement.appendChild(chatparagraph);
    chatElement.appendChild(timestampSpan);
  } else if (messageType === 'receiver') {
    chatElement.classList.add('chat__message', 'chat__message-receiver');
    chatElement.innerHTML = `${userImage.outerHTML}${chatparagraph.outerHTML}${timestampSpan.outerHTML}`;
  }

  return chatElement; // Return the created chat item
};


// Handle sending a message
const handleSendMessage = async () => {
  const userMessage = chatInput.value.trim();
  if (!userMessage) return;

  const messageData = {
    message: userMessage,
    ticketId: currentTicketId,
  };

  if (attachInput.files.length > 0) {
    const imageFile = attachInput.files[0];
    const imageBase64 = await getBase64Image(imageFile);
    messageData.image = imageBase64;
  }

  // Create the first client message using the description
  firstClientMessage({ ticketDescription, ticketDescriptionTimeStamp });

  try {
    const response = await fetch('/api/send-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify(messageData),
    });

    if (response.ok) {
      // Message sent successfully, update UI
      const timestamp = getMessageTime();
      const messageType = 'sender';

      const data = {
        message: userMessage,
        image: '', // No image for sender message
        timestamp: timestamp,
        messageType: messageType,
      };

      // Assuming the response is the updated conversation data
      const updatedConversation = await response.json();

      // Clear the messages container before updating
      messagesContainer.innerHTML = '';

      // Loop through the updated conversation data and create chat items
      updatedConversation.forEach(convo => {
        const chatItem = createChatItem({
          message: convo.message,
          image: convo.image,
          timestamp: convo.sent_at, // Update this based on your response data
          messageType: convo.user_role === 'client' ? 'sender' : 'receiver',
        });

        if (chatItem) {
          messagesContainer.appendChild(chatItem);
        }
      });
    } else {
      console.error('Failed to send message.');
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }

  chatInput.value = '';
  attachInput.value = ''; // Reset file input
};


// Get timestam of new Messages
const getMessageTime = () => {
  const time = new Date();

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const AmOrPm = hours < 12 ? 'AM' : 'PM';

  const formattedHours = hours % 12 === 0 ? '12' : hours % 12 < 10 ? `0${hours % 12}` : `${hours % 12}`;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;

  return `${formattedHours}:${formattedMinutes} ${AmOrPm}`;
};


// Get Date of new Conversation
const getConversationDate = () => {
  const date = new Date()

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  const curr = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()

  return `${curr} ${month}, ${year}`
}

sendBtn.addEventListener('click', handleSendMessage)
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    handleSendMessage()
  }
})

// Client first message
const firstClientMessage = (client) => {
  const message = client.ticketDescription;
  const timestamp = client.ticketDescriptionTimeStamp; // Get the current timestamp
  const messageType = 'sender'; // Always sender for the first client message

  const data = {
    message: message,
    image: '', // No image for the first client message
    timestamp: timestamp,
    messageType: messageType,
  };

  const dateBox = document.createElement('p');
  dateBox.innerHTML = `${getConversationDate()}`;
  dateBox.className = 'date';

  messagesContainer.insertBefore(dateBox, messagesContainer.children[0]);

  const chatItem = createChatItem(data);
  if (chatItem) {
    messagesContainer.appendChild(chatItem);
  } else {
    console.error('Error creating chat item:', data);
  }
};

// reset Chat
const resetChat = () => {
  messagesContainer.innerHTML = ''
}
