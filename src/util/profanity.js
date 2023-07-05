import * as Moderator from 'bad-words';

const Filter = new Moderator();
const Dictionary = Filter.list;

/**
 * Checks a string for profane words
 * @param {String} text : Text to be sanitized from profanity 
 * @return {String} : Replaces profane words with asterixes (*)
 */
function SafeGuard(text) {
  if (typeof text !== 'string') return '';

  // Word matcher
  let output = Filter.clean(text);
  if (output.indexOf('*') > -1) return output;

  // Substring matcher
  for (let i = 0; i < Dictionary.length; i++) {
    let word = Dictionary[i].toLowerCase().replace(/[^a-z0-9-]/g,'');
    if (text.includes(word)) {
      let textArray = text.split('');
      for (let j = 0; j < textArray.length; j++) {
        textArray[j] = '*';
        if (j == (textArray.length - 1)) {
          output = textArray.join('');
          return output;
        };
      }
    }
  }

  return output;
}

export {
  SafeGuard
}