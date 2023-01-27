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
  username : 'jul@com',
  password : '1234'
},
  edf: {
  id: 'Dar',
  username: "dar@com",
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

app.get("/login", (req, res) => {
  const templateVars = {
    user: username[req.cookies["username"]]
  };
  res.render("urls_index", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    // user: users[req.session["username"]],
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    // user: users[req.session["username"]]
  };
  res.render("urls_registration", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase , 
    username: req.cookies["username"] }
// console.log(templateVars)
  res.render("urls_index", templateVars);
});


app.get("/urls/:id", (req, res) => { //edit 
  const id = req.params.id
  // console.log('id:', id)
  const longUrl = urlDatabase[id]
  // console.log('longUrl', longUrl)
  const templateVars = {id: id, longUrl: longUrl,
    username: req.cookies["username"]}
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
app.post('/login' ,(req,res) => { 
  // console.log('body', req.body)
  const username = req.body.username
  const password = req.body.password
  res.cookie("username", username) 
  res.redirect("/urls");
})

app.post('/register' , (req,res) => {
  const username = req.body.username
  const password = req.body.password
  
  if(!username || !password) {
    return res.status(400).send('please provide a username and a password ')
  }
  if (username === "" || password === "") {
    return res.status(400).send("400 error ! Please Provide Information");
  }
  for(const user in users) {
    if(username === user) {
      return res.status(400).send("400 error ! Username taken, Please user another");
    }
  }
  const id = Math.random().toString(36).substring(2,5)
  const newUser = {
    id: id, 
    username : username,
    password: password
  }
  user[id] = newUser
  res.redirect('/urls')
})

app.post("/logout", (req, res) => {
  res.clearCookie("username") ;
  res.redirect("/urls");
});