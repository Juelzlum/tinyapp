//finding whether email exisit 
const findEmail = (email, db) => {
  for (let key in db) {
    if (email === db[key].email) {
      return email;
    }
  }
  return undefined;
};

//finding user via id thru login email
const findUserId = (email, db) => {
  for (const user in db) {
    if (db[user].email === email) {
      return db[user].id;
    }
  }
};

//generates a random string
const generateRandomString = () => {
  const alphaNumerical = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += alphaNumerical.charAt(Math.floor(Math.random() * alphaNumerical.length));
  }
  return result;
};

//collectiong of urls for the users
const urlsForUser = function(id, urlDatabase) {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
};

//to see if the email has been registered
const emailHasUser = function(email, userDatabase) {
  for (const user in userDatabase) {
    if (userDatabase[user].email === email) {
      return true;
    }
  }
  return false;
};


module.exports = {
  generateRandomString,
  findEmail,
  findUserId,
  urlsForUser,
  emailHasUser
};