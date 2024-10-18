const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const cors = require("cors");
const User = require("./models/User");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const jwt = require("jsonwebtoken"); // Import jsonwebtoken
const app = express();

dotenv.config();

const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || "_jwt_secret";

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

// CORS configuration
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Passport Local Strategy for login
passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username })
      .then((user) => {
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }
        bcrypt
          .compare(password, user.password)
          .then((res) => {
            if (res) {
              return done(null, user);
            } else {
              return done(null, false, { message: "Incorrect password." });
            }
          })
          .catch((err) => done(err));
      })
      .catch((err) => done(err));
  })
);

// Passport JWT Strategy
const opts = {
  jwtFromRequest: ExtractJwt.fromExtractors([(req) => req.cookies.jwt]),
  secretOrKey: JWT_SECRET,
};

passport.use(
  new JwtStrategy(opts, (jwt_payload, done) => {
    User.findById(jwt_payload.id)
      .then((user) => {
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      })
      .catch((err) => done(err, false));
  })
);

// Generate JWT
const generateToken = (user) => {
  return jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, {
    expiresIn: "1h",
  });
};

// Routes
// Register a new user
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  User.create({ username, password })
    .then((user) => {
      res.status(201).json({ message: "User created", user });
    })
    .catch((err) => {
      res.status(400).json({
        message: "User already exists or other error",
        error: err.message,
      });
    });
});

// Login a user
app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user)
      return res.status(401).json({ message: "Invalid username or password" });

    const token = generateToken(user);
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    console.log("JWT Token:", token); // Debugging: Log the token
    return res.status(200).json({ message: "Login successful", user });
  })(req, res, next);
});

// Get a user
app.get(
  "/dashboard",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // Log the cookies to the terminal
    console.log("Cookies:", req.cookies);

    // Log the specific JWT cookie
    console.log("JWT Cookie:", req.cookies.jwt);

    // Log user information to the terminal
    if (req.user) {
      console.log("User logged in:", req.user);
      res.json({ message: "User is logged in", user: req.user });
    } else {
      console.log("No user found in request");
      res.status(401).json({ message: "Unauthorized" });
    }
  }
);

// Check for authorized user
app.get(
  "/auth/check",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    if (req.user) {
      res.sendStatus(200);
    } else {
      res.sendStatus(401);
    }
  }
);

// Logout a user
app.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.json({ message: "Logout successful" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
