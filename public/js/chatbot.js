const firstMessage = document.getElementById('firstMessage')
const messagesContainer = document.getElementById('messages')
const chatInput = document.querySelector('.chatbot__popup-bottom textarea')
const sendBtn = document.getElementById('send')

//create chat item
const createChatItem = (message, type) => {
    console.log(`na here be the issue ${message}`)

  const chatElement = document.createElement('div')

  type === 'bot'
    ? chatElement.classList.add('chatbot__message', 'chatbot__message-bot')
    : chatElement.classList.add('chatbot__message', 'chatbot__message-user')

  const chatContent =
    type === 'bot'
      ? `<img src='/img/logo purple.png' /> <p>${message}<span>${getMessageTime()}</span></p>`
      : `<p>${message} <span>${getMessageTime()}</span></p>`

  chatElement.innerHTML = chatContent

  return chatElement
}

const handleSendMessage = async () => {
    const userMessage = chatInput.value.trim()
  
    if (!userMessage) return
  
    messagesContainer.appendChild(createChatItem(userMessage, 'user'))
    chatInput.value = ''
  
    try {
      const botResponseMessage = await chatBotResponse(userMessage);
      messagesContainer.appendChild(createChatItem(botResponseMessage, 'bot'));
    } catch (error) {
      console.error('Error while processing bot response:', error);
      messagesContainer.appendChild(createChatItem('Sorry, something went wrong while processing your request.', 'bot'));
    }
  }

// Bot first message
const firstBotMessage = () => {
  const message = "Hi, how may I assist you today?"
  const dateBox = document.createElement('p')

  dateBox.innerHTML = `${getConversationDate()}`
  dateBox.className = 'date'

  messagesContainer.insertBefore(dateBox, messagesContainer.children[0])

  firstMessage.innerHTML = `${message} <span>${getMessageTime()}</span>`
}

// Get timestam of new Messages
const getMessageTime = () => {
  const time = new Date()

  const hrs = time.getHours()
  const mins = time.getMinutes()
  const AmOrPm = hrs < 12 ? 'AM' : 'PM'

  const hours = hrs === 0 ? '12' : hrs % 12 < 10 ? `0${hrs % 12}` : hrs % 12
  const minutes = mins < 10 ? `0${mins}` : mins

  return `${hours}:${minutes} ${AmOrPm}`
}

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
    handleSendMessage()
  }
})

firstBotMessage()