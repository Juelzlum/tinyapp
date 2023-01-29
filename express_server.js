const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session')
const bodyParser = require("body-parser");

const bcrypt = require("bcryptjs");
const password = "1234"; // found in the req.body object
const hashedPassword = bcrypt.hashSync(password, 10);

const { generateRandomString, findEmail, findUserId, findPassword, urlsForUser} = require("./function")

app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']

}))
app.use(express.urlencoded({extended: false})) //populates req.body

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
  res.send("Welcome To TinyApp")
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/login", (req, res) => {
    const templateVars = {
      user: users[req.session.user_id]
    };
    console.log('logvars', templateVars)
    res.render("urls_login", templateVars);
  });

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  console.log('retvars', templateVars)
  res.render("urls_registration", templateVars);
});



// const urlsForUser = function(id, urlDatabase) {
//   const userUrls = {};
//   for (const shortURL in urlDatabase) {
//     if (urlDatabase[shortURL].userID === id) {
//       userUrls[shortURL] = urlDatabase[shortURL];
//     }
//   }
//   return userUrls;
// };

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

app.get("/urls/new", (req, res) => {
  // user should not see this page if not logged in
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
      urlUserID: urlDatabase[req.params.shortURL].userID,
      user: users[req.session.user_id],
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("Your short URL does not match with a long URL");
  }
});



// const generateRandomString = () => {
//   const alphaNumerical = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
//   let result = '';
//   for (let i = 0; i < 6; i++) {
//     result += alphaNumerical.charAt(Math.floor(Math.random() * alphaNumerical.length));
//   }
//   return result;
// };


//post
app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id,
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(401).send("You must be logged in to create short URLs.");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(urlDatabase[req.params.shortURL].userID);
  if (urlDatabase[req.params.shortURL].userID === req.session["userID"]) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(403).send("Not permitted");
  }
});

app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const userUrls = urlsForUser(userID, urlDatabase);
  if (Object.keys(userUrls).includes(req.params.id)) {
    const shortURL = req.params.id;
    urlDatabase[shortURL].longURL = req.body.newURL;
    res.redirect('/urls');
  } else {
    res.status(401).send("You do not have authorization to edit this short URL.");
  }
});
  
// const findEmail = function(email, userDatabase) {
//   for (const user in users) {
//     if (users[user].email === email) {
//       return true;
//     }
//   }
//   return false;
// };

// const findUserId = (email, db) => {
//   for (const user in db) {
//     if (db[user].email === email) {
//       return db[user].id;
//     }
//   }
// };

app.post("/login", (req, res) => {
  const email = req.body.email;
  console.log('email:',email)
  const password = req.body.password;
  console.log('pw:' , password)
  const find = findEmail(email, users)
  console.log(find)
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

  const emailHasUser = function(email, userDatabase) {
    for (const user in userDatabase) {
      if (userDatabase[user].email === email) {
        return true;
      }
    }
    return false;
  };
  
  app.post("/register", (req, res) => {
    const submittedEmail = req.body.email;
    console.log('submittedEmail:', submittedEmail)
    const submittedPassword = req.body.password;
    console.log('submittedpW:', submittedPassword)
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
