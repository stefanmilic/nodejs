const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const config = require("../config/database");

//postgres base
const { Client } = require("pg");

const client = new Client({
  connectionString: config.postgresUrl
});

client.connect();

// Register Form
router.get("/register", function(req, res) {
  res.render("register", {
    path: req.path
  });
});

// Register Proccess
router.post("/register", function(req, res) {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const password2 = req.body.password2;

  req.checkBody("name", "Name is required").notEmpty();
  req.checkBody("email", "Email is required").notEmpty();
  req.checkBody("email", "Email is not valid").isEmail();
  req.checkBody("password", "Password is required").notEmpty();
  req
    .checkBody("password2", "Passwords do not match")
    .equals(req.body.password);

  let errors = req.validationErrors();

  if (errors) {
    res.render("register", {
      errors: errors
    });
  } else {
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(password, salt, function(err, hash) {
        if (err) {
          console.log(err);
        }

        //insert into postgress
        client.query(
          "INSERT INTO users (name,email,password) VALUES($1,$2,$3)",
          [name, email, hash],
          function(err) {
            if (err) {
              console.log(err);
              return;
            } else {
              req.flash("success", "You are now registered");
              res.redirect("/users/login");
            }
          }
        );
      });
    });
  }
});

// Login Form
router.get("/login", function(req, res) {
  res.render("login", {
    path: req.path
  });
});

// Login Process
router.post("/login", function(req, res, next) {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true
  })(req, res, next);
});

// logout
router.get("/logout", function(req, res) {
  req.logout();
  req.flash("success", "You are logged out");
  res.redirect("/users/login");
});

module.exports = router;
