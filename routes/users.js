const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const { check, validationResult } = require("express-validator/check");
const client = require("../config/postgres");
// const { Client } = require("pg");
// const config = require("../config/database");
// const client = new Client({
//   connectionString: config.postgresUrl
// });

// client.connect().then(() => console.log("conektovan user"));

// Register Form
router.get("/register", function(req, res) {
  res.render("register", {
    path: req.path
  });
});

// Register Proccess
router.post(
  "/register",
  [
    check("email")
      .isLength({ min: 1 })
      .trim()
      .withMessage("Email is required"),
    check("email")
      .isLength({ min: 1 })
      .trim()
      .isEmail()
      .withMessage("Email is not valid")
      .custom(value => {
        return client
          .query("SELECT email FROM users WHERE email=$1", [value])
          .then(data => {
            if (data.rows.length > 0) {
              return Promise.reject("E-mail already in use");
            }
          });
      }),
    check("name")
      .isLength({ min: 1 })
      .trim()
      .withMessage("Name is required")
      .custom(value => {
        return client
          .query("SELECT name FROM users WHERE name=$1", [value])
          .then(data => {
            if (data.rows.length > 0) {
              return Promise.reject("Name is  already in use");
            }
          });
      }),
    check("password2")
      .isLength({ min: 3 })
      .trim()
      .withMessage("password must be at least 3 characters")
      .custom((value, { req }) => {
        console.log(value, req.body.password2);
        if (value !== req.body.password) {
          return Promise.reject(
            "Password confirmation does not match password"
          );
        } else {
          return value;
        }
      })
  ],
  function(req, res) {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("register", { errors: errors.mapped() });
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
                res.redirect("/");
              }
            }
          );
        });
      });
    }
  }
);

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
    //ovde aktiviramo poruke
    failureFlash: true,
    successFlash: true
  })(req, res, next);
});

// logout
router.get("/logout", function(req, res) {
  req.logout();
  req.flash("success", "You are logged out");
  res.redirect("/users/login");
});

module.exports = router;
