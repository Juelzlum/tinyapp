const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')

app.set("view engine", "ejs");
app.use(cookieParser())// populates req.cookies
app.use(express.urlencoded({extended: false})) //populataes req.body

//data base 
const user = {
  abc: {
  'id' : 'jul',
  'email' : 'jul@com',
  'password' : '1234'}
}
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
  // "1jo"

};

app.get("/", (req, res) => {
  res.send("Welcome To TinyApp");
});

app.get("/login", (req, res) => {
  // const templateVars = {
  //   user: user[req.session["userID"]]
  // };
  // res.render("urls_login", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


app.get("/urls/:id", (req, res) => {
  const id = req.params.id
  // console.log('id:', id)
  const longUrl = urlDatabase[id]
  // console.log('longUrl', longUrl)
  const templateVars = {id: id, longUrl: longUrl}
  // res.redirect("/url");
  res.render("urls_show", templateVars);
});



function generateRandomString() { }

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const userID = req.session["userID"];
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL, userID };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req,res) => {
  console.log(urlDatabase[req.params.shortURL])
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls");
})

app.post('/login' ,(req,res) => {
  const username = req.body.username
  const password = req.body.password
  res.cookie(username,password)
  res.redirect("/urls");
})


