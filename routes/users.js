const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const config = require("../config/database");
const { check, validationResult } = require("express-validator/check");

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
    check("password")
      .isLength({ min: 3 })
      .trim()
      .withMessage("password must be at least 3 characters")
      .equals("password2")
      .withMessage("password do not match")
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

    // const name = req.body.name;
    // const email = req.body.email;
    // const password = req.body.password;
    // const password2 = req.body.password2;

    // req.checkBody("name", "Name is required").notEmpty();
    // req.checkBody("email", "Email is required").notEmpty();
    // req.checkBody("email", "Email is not valid").isEmail();
    // req.checkBody("password", "Password is required").notEmpty();
    // req
    //   .checkBody("password2", "Passwords do not match")
    //   .equals(req.body.password);

    // let errors = req.validationErrors();

    // if (errors) {
    //   res.render("register", {
    //     errors: errors
    //   });
    //  } else {
    //   bcrypt.genSalt(10, function(err, salt) {
    //     bcrypt.hash(password, salt, function(err, hash) {
    //       if (err) {
    //         console.log(err);
    //       }

    //       //insert into postgress
    //       client.query(
    //         "INSERT INTO users (name,email,password) VALUES($1,$2,$3)",
    //         [name, email, hash],
    //         function(err) {
    //           if (err) {
    //             console.log(err);
    //             return;
    //           } else {
    //             req.flash("success", "You are now registered");
    //             res.redirect("/users/login");
    //           }
    //         }
    //       );
    //     });
    //   });
    // }
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
