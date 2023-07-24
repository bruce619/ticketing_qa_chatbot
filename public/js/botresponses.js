function replaceNewLineWithHTML(text) {
    if (text.includes('\n')) {
        return text.replace(/\n/g, '<br />');
    }
    return text;
    }

const chatBotResponse = async (userInput) => {
    let response;
  
    return await fetch('/bot/response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userInput }),
    })
      .then((data) => {
        if (data.ok) {
          return data.json().then((json) => {
            response = replaceNewLineWithHTML(json.botResponse);
            return response;
          });
        } else {
          response = 'Sorry, something went wrong while processing your request.';
          return response;
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };