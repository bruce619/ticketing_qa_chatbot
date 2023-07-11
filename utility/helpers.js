function replaceNewLineWithHTML(text) {
    if (text.includes('\n')) {
      return text.replace(/\n/g, '<br />');
    }
    return text;
  }


module.exports = {
    replaceNewLineWithHTML
}