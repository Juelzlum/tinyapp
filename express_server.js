const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')

app.set("view engine", "ejs");
app.use(cookieParser())// populates req.cookies
app.use(express.urlencoded({extended: false})) //populataes req.body

//data base 
const users = {
  abc: {
  id : 'jul',
  email : 'jul@com',
  password : '1234'
},
  edf: {
  id: 'Dar',
  email: "dar@com",
  password: "4321",
}
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
  // "1jo"

};

app.get("/", (req, res) => {
  res.send("Welcome To TinyApp")
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  
  res.render("urls_login", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });



app.get("/urls/new", (req, res) => { //creating new urls
  const templateVars = {
    // user: users[req.session["username"]],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    // user: users[req.session["username"]]
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_registration", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase , 
    user: users[req.cookies["user_id"]] }
// console.log(templateVars)
  res.render("urls_index", templateVars);
});


app.get("/urls/:id", (req, res) => { //edit 
  const id = req.params.id
  // console.log('id:', id)
  const longUrl = urlDatabase[id]
  // console.log('longUrl', longUrl)
  const templateVars = {id: id, longUrl: longUrl,
    user: users[req.cookies["user_id"]]}
  // res.redirect("/url");
  res.render("urls_show", templateVars);
});


const generateRandomString = () => {
  const alphaNumerical = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += alphaNumerical.charAt(Math.floor(Math.random() * alphaNumerical.length));
  }
  return result;
};

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req,res) => {
  const id = req.params.id
  //console.log('id2:', id)
  delete urlDatabase[id]
  //console.log(urlDatabase[req.params.id])
  res.redirect("/urls");
})

app.post("/urls/:id", (req, res) => { //edit 
console.log('req.body', req.body)
const longUrl = req.body
console.log('longUrl:', longUrl)
urlDatabase[id] = longUrl;
res.redirect('/url')

})
const findEmail = (email, db) => {
  for (let key in db) {
    if (email === db[key].email) {
      return email;
    }
  }
  return undefined;
};

//check to see if password exist
const findPassword = (email, db) => {
  for (let key in db) {
    if (email === db[key].email) {
      return db[key].password;
    }
  }
  return undefined;
};
const findUserId = (email, db) => {
  for (let key in db) {
    if (email === db[key].email) {
      return db[key].id;
    }
  }
  return undefined;
};

  app.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const userEmail = findEmail(email, users);
    const userPassword = findPassword(email, users);
    if (email === userEmail) {
      // if (bcrypt.compareSync(password, userPassword)) {
        const userID = findUserId(email, users);
        // set cookie with user id
        res.cookie("user_id", userID) 
        
        //res.cookies["user_id"]
        console.log('cookies:', res.cookie["user_id"]) ;
        res.redirect("/urls");
      } else {
        res.status(403).send("403 Forbidden: Wrong Password");
      }
      res.status(403).send("403 Forbidden : Please Register")
    })


app.post('/register' , (req,res) => {
  const id = Math.random().toString(36).substring(2,5)
  const newUserID = id;
  const email = req.body.email;
  const password = req.body.password;

  const newUser = {
    id: id, 
    email : email,
    password: password
  }
  if(!email || !password) {
    return res.status(400).send('please provide a email and a password ')
  }
  if (email=== "" || password === "") {
    return res.status(400).send("400 error ! Please Provide Information");
  }
  for(const user in users) {
    if(email === user) {
      return res.status(400).send("400 error ! Username taken, Please use another");
    } else if(email !== user) {
      users[newUserID] = newUser;
      req.cookies["user_id"] = newUserID;
      res.redirect("/urls");
    }
  }
 
})

app.post("/logout", (req, res) => {
  res.clearCookie("username") ;
  res.redirect("/urls");
});