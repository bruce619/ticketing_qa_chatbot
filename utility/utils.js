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


module.exports = {
    removePunctuations,
    getCurrentTime,
    getRandomAlphanumericString

}