const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");

const bcrypt = require("bcryptjs");
const password = "1234"; // found in the req.body object
const hashedPassword = bcrypt.hashSync(password, 10);

const { generateRandomString, findEmail, findUserId, urlsForUser, emailHasUser} = require("./function");

app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']

}));
app.use(express.urlencoded({ extended: false })); //populates req.body

//data base 
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.lighthouselabs.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

// user database
const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "jul@com",
    password: hashedPassword
  },
};
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/", (req, res) => {
  if(req.session.user_id){
    res.redirect("/urls")
  }
    res.redirect("/login")
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_login", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  // console.log('retvars', templateVars);
  res.render("urls_registration", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    user: users[req.session["userID"]]
  };
  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    if (longURL === undefined) {
      res.status(302);
    } else {
      res.redirect(longURL);
    }
  } else {
    res.status(404).send("The short URL you are accessing does not match with a long URL at this time.");
  }
});

app.get("/urls/new", (req, res) => { //creating new urls 
  const templateVars = {
    user: users[req.session.user_id]
  };
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: users[req.session.user_id]
    };
    console.log(templateVars)
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("Your short URL does not match with a long URL");
  }
});


//post
app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: users[req.session.user_id],
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(401).send("You must be logged in to create short URLs.");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(urlDatabase[req.params.shortURL].userID);
  if (urlDatabase[req.params.shortURL].userID === req.session["user_id"]) {
    console.log(req.session["user_id"])
     console.log(urlDatabase[req.params.shortURL])
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(403).send("Not permitted");
  }
});

app.post("/urls/:id", (req, res) => { //for editing
  const userID = req.session.user_id;
  if (userID) { 
    const shortURL = req.params.id
    const updateNew =req.body.longURL
    urlDatabase[shortURL].longURL= updateNew
    res.redirect('/urls');
 
  } else {
    res.status(401).send("You are authorize to edit this short URL ");
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!findEmail(email, users)) {
    res.status(403).send("There is no account associated with this email address,Please register!");
  } else {
    const userID = findUserId(email, users);
    if (!bcrypt.compareSync(password, users[userID].password)) {
      res.status(403).send("The password you entered does not match the one associated with the provided email address");
    } else {
      req.session.user_id = userID;
      res.redirect("/urls");
    }
  }
});

app.post("/register", (req, res) => {
  const submittedEmail = req.body.email;
  const submittedPassword = req.body.password;
  if (!submittedEmail || !submittedPassword) {
    res.status(400).send("Please include both a valid email and password");
  } else if (emailHasUser(submittedEmail, users)) {
    res.status(400).send("An account already exists for this email address");
  } else {
    const newUserID = generateRandomString();
    users[newUserID] = {
      id: newUserID,
      email: submittedEmail,
      password: bcrypt.hashSync(submittedPassword, 10),
    };
    req.session.user_id = newUserID;
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});
