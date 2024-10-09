const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const cors = require("cors");
const User = require("./models/User");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = express();

const PORT = process.env.PORT || 8080;

// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/auth", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });

// configure dotenv
dotenv.config();

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Session setup
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
  })
);

// Initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());

// Passport Local Strategy for login
passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username })
      .then(user => {
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        bcrypt.compare(password, user.password)
          .then(res => {
            if (res) {
              return done(null, user);
            } else {
              return done(null, false, { message: 'Incorrect password.' });
            }
          })
          .catch(err => done(err));
      })
      .catch(err => done(err));
  })
);

// Serialize user to session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => {
      done(null, user);
    })
    .catch(err => {
      done(err, null);
    });
});

// Routes
// Register a new user
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  return User.create({ username, password }).then((user) => {
    res.status(201).json({ message: "User created", user });
  });
});

// Login a user
app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: "Invalid username or password" });

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.status(200).json({ message: "Login successful", user });
    });
  })(req, res, next);
});

// Get a user
app.get("/dashboard", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  console.log("User logged in:", req.user); // Log user information to the terminal
  res.json({ message: "User is logged in", user: req.user }); // Send JSON response
});

// Logout a user
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log("Server is running on http://localhost:8080");
});
