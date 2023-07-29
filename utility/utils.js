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
  
  function getCurrentTimestamp(){
    current_date_time = new Date();
    return current_date_time
  }
  
  function otpTimestamp() {
  
    // Add 15 min to current date-time
    const expiry_date_time = new Date(getCurrentTimestamp().getTime() + 15 * 60000);
    // convert to timestamp
    return expiry_date_time;
  
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


// function to generate alphanumeric string
function generateStaffID(){
  let str = '';
  const characters = '0123456789';
  const string_length = characters.length;
  
  for (let i = 0; i < 10; i++) {
    str += characters.charAt(Math.floor(Math.random() * string_length));
  }
  
  // return random numeric string
  return str;
}


module.exports = {
    removePunctuations,
    getCurrentTime,
    getRandomAlphanumericString,
    generateOTP,
    getCurrentTimestamp,
    otpTimestamp,
    generateStaffID
}