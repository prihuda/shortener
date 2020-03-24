const express        = require("express");
const CONFIG         = require('./config/config');
const methodOverride = require('method-override')
const bodyParser     = require("body-parser");
const cookieSession  = require('cookie-session');
const flash          = require('express-flash');
const passport       = require('passport');

require('./middleware/passport')(passport)

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'))
app.use(passport.initialize());
app.use(cookieSession({
  name: 'session',
  keys: ["key 1"]
}));

app.use(flash());
const userRoutes = require("./routes/users");
const urlRoutes = require("./routes/urls");
const uRoutes = require("./routes/u");
app.use("/users", userRoutes);
app.use("/urls", urlRoutes);
app.use("/u", uRoutes);


const models = require("./models");

models.sequelize.authenticate().then(() => {
	console.log('Connected to SQL database:', CONFIG.db_name);
})
.catch(err => {
	console.error('Unable to connect to SQL database:',CONFIG.db_name, err);
});

if (CONFIG.app==='dev') {
  //creates table if they do not already exist
  //models.sequelize.sync();

  //deletes all tables then recreates them useful for testing and development purposes
  models.sequelize.sync({ force: true });
}



// Main page rendering
app.get("/", (req, res) => {
  var user_id = req.session.user_id;
  let templateVars = {
    //users,
    user_id
  };
  if (user_id) {
    res.redirect("/urls");
  } else {
    res.render("index", templateVars);
  }
});

// Rendering of registration page (re-directs those already logged in)
app.get("/register", (req, res) => {
  var user_id = req.session.user_id;
  let templateVars = {
    //users,
    user_id
  }; 
  if (user_id) {
    req.flash('warning', "You are already logged in!");
    res.redirect("/urls");
  } else {
    res.render("register", templateVars);
  }
});

// Rendering of login page
app.get("/login", (req, res) => {
  var user_id = req.session.user_id;
  let templateVars = {
    //users,
    user_id
  };
  if (user_id) {
    req.flash('warning', "You are already logged in!");
    res.redirect("/urls");
  } else {
    res.render("login", templateVars);
  }
});

app.listen(CONFIG.port, () => {
  console.log(`Server running on port ${CONFIG.port}.... is there anybody out there?`);
});
