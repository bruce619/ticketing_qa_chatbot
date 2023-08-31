function removePunctuations(text) {
    return text.toLowerCase().replace(/[^\w\s]/g, '');
  }

function getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
  
    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // Handle midnight (0 hours)
  
    // Add leading zeros if needed
    hours = String(hours).padStart(2, '0');
    minutes = String(minutes).padStart(2, '0');
  
    const currentTime = `${hours}:${minutes} ${ampm}`;
    return currentTime;
  }


  function generateOTP(){
    return Math.random().toString().substr(2, 6)
  }

  function otpTimestamp() {
  
    // Add 15 min to current date-time
    const expiry_date_time = new Date(getCurrentTimestamp().getTime() + 15 * 60000);
    // convert to timestamp
    return expiry_date_time;
  
  }

  function getDateTimestamp() {
    const current_date_time = new Date();
  
    const day = current_date_time.getDate();
    const month = current_date_time.getMonth() + 1; // Months are zero-based
    const year = current_date_time.getFullYear();
    const hours = current_date_time.getHours();
    const minutes = current_date_time.getMinutes();
  
    // Format day, month, and year to two digits if needed
    const formattedDay = day < 10 ? `0${day}` : day;
    const formattedMonth = month < 10 ? `0${month}` : month;
    const formattedYear = year;
  
    // Format hours and minutes to two digits if needed
    const formattedHours = hours < 10 ? `0${hours}` : hours;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  
    // Combine the formatted components into the desired format
    const formattedTimestamp = `${formattedDay}-${formattedMonth}-${formattedYear} ${formattedHours}:${formattedMinutes}`;
  
    return formattedTimestamp;
  }
  
  function getCurrentTimestamp(){
    current_date_time = new Date();
    return current_date_time
  }


// function to generate alphanumeric string
function getRandomAlphanumericString(length){
  let str = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const string_length = characters.length;
  
  for (let i = 0; i < length; i++) {
    str += characters.charAt(Math.floor(Math.random() * string_length));
  }
  
  // return random alphanumeric string
  return str;
}


// Function to generate alphanumeric string with prefix "CBI"
function generateStaffID() {
  const prefix = 'CBI';
  let str = prefix;
  const characters = '0123456789';
  const string_length = characters.length;
  
  // Append 7 random numeric characters to the prefix
  for (let i = 0; i < 7; i++) {
    str += characters.charAt(Math.floor(Math.random() * string_length));
  }
  
  // Return the generated staff ID
  return str;
}

function generateRandomTicketId() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const idLength = 10; // You can adjust the length of the ticket ID

  let randomTicketId = '';
  for (let i = 0; i < idLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomTicketId += characters[randomIndex];
  }

  return randomTicketId;
}


const genPassword = () => {
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const specialChars = '!@#$%^&*()';
  const numberChars = '0123456789';

  const passwordLength = 12;
  let password = '';
  let hasUppercase = false;
  let hasNumber = false;
  let hasSpecialChar = false;

  while (password.length < passwordLength) {
    const charSetIndex = Math.floor(Math.random() * 4); // Generate a random index between 0 and 3
    switch (charSetIndex) {
      case 0:
        // Use lowercase characters
        password += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length));
        break;
      case 1:
        // Use uppercase characters
        password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length));
        hasUppercase = true;
        break;
      case 2:
        // Use special characters
        password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
        hasSpecialChar = true;
        break;
      case 3:
        // Use numbers
        password += numberChars.charAt(Math.floor(Math.random() * numberChars.length));
        hasNumber = true;
        break;
    }
  }

  // Ensure the password meets the requirements
  if (password.length < 8 || !(hasUppercase && hasNumber && hasSpecialChar)) {
    return genPassword(); // Retry generating the password
  }

  return password

};


module.exports = {
    removePunctuations,
    getCurrentTime,
    getRandomAlphanumericString,
    generateOTP,
    getCurrentTimestamp,
    getDateTimestamp,
    otpTimestamp,
    generateStaffID,
    generateRandomTicketId,
    genPassword
}