const express = require("express");
const router = express.Router();
const config = require("../config/database");
const { check, validationResult } = require("express-validator/check");

//postgres base
const { Client } = require("pg");

const client = new Client({
  connectionString: config.postgresUrl
});
client.connect();

// Add Route
router.get("/add", ensureAuthenticated, function(req, res) {
  res.render("add_article", {
    title: "Add Article",
    path: req.path
  });
});

// Add Submit POST Route
router.post(
  "/add",
  [
    check("title")
      .isLength({ min: 1 })
      .trim()
      .withMessage("Title is required"),
    check("body")
      .isLength({ min: 1 })
      .trim()
      .withMessage("Body is required")
  ],

  function(req, res) {
    // Get Errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("add_article", {
        title: "Add Article",
        errors: errors.mapped()
      });
    } else {
      client.query(
        "INSERT INTO articles (title,author_id,author_name,body) VALUES($1,$2,$3,$4)",
        [req.body.title, req.user._id, req.user.name, req.body.body],
        function(err) {
          if (err) {
            console.log(err);
            return;
          } else {
            req.flash("success", "Article Added");
            res.redirect("/");
          }
        }
      );
    }
  }
);

// Load Edit Form
router.get("/edit/:id", ensureAuthenticated, function(req, res) {
  client.query("SELECT * FROM articles WHERE _id=$1", [req.params.id], function(
    err,
    article
  ) {
    if (article.rows[0].author_id != req.user._id) {
      req.flash("danger", "Not Authorized");
      res.redirect("/");
    }
    res.render("edit_article", {
      title: "Edit Article",
      article: article.rows[0]
    });
  });
});

// Update Submit POST Route
router.post("/edit/:id", function(req, res) {
  client.query(
    "UPDATE articles SET title=$1, body=$2 WHERE _id=$3",
    [req.body.title, req.body.body, req.params.id],
    function(err) {
      if (err) {
        console.log(err);
        return;
      } else {
        req.flash("success", "Article Updated");
        res.redirect("/");
      }
    }
  );
});

//GET answers

// Delete Article
router.delete("/:id", function(req, res) {
  if (!req.user._id) {
    res.status(500).send("niste se ulogovali");
  }

  client.query("SELECT * FROM articles WHERE _id=$1", [req.params.id], function(
    err,
    article
  ) {
    if (article.rows[0].author_id != req.user._id) {
      res.status(500).send("user nije kreirao dati article");
    } else {
      client.query(
        "DELETE FROM articles WHERE _id=$1",
        [req.params.id],
        function(err) {
          if (err) {
            console.log(err);
          }
          res.send("Success");
        }
      );
    }
  });

  client.query(
    "DELETE FROM answers WHERE articleId=$1",
    [req.params.id],
    function(err) {
      if (err) {
        console.log(err);
      }
    }
  );
});

// Get Single Article
router.get("/:id", function(req, res) {
  const query = {
    text: "SELECT * FROM articles WHERE _id = $1",
    values: [req.params.id]
  };

  client.query(query, function(err, article) {
    client.query(
      "SELECT * FROM users WHERE _id=$1",
      [article.rows[0].author_id],
      function(err, user) {
        client.query(
          "SELECT * FROM answers WHERE articleId=$1",
          [req.params.id],
          function(err, answers) {
            res.render("article", {
              article: article.rows[0],
              author: user.rows[0].name,
              answers: answers.rows.reverse()
            });
          }
        );
      }
    );
  });

  router.post("/answers/:id", function(req, res) {
    client.query(
      "INSERT INTO answers (body,articleId,author) VALUES($1,$2,$3)",
      [req.body.answer, req.params.id, req.user.name],
      function(err) {
        if (err) {
          console.log(err);
          return;
        } else {
          req.flash("success", "Answer Added");
          res.redirect("/articles/" + req.params.id);
        }
      }
    );
  });
});

router.post("/likes/:id", ensureAuthenticated, (req, res) => {
  let likes = req.body.like_count;
  const id = req.params.id;
  console.log(likes, id);
  client.query(
    "UPDATE answers SET likes_count=$1 WHERE _id=$2",
    [likes, id],
    function(err) {
      if (err) {
        console.log(err);
      }
      g;
      req.flash("success", "Thank for the like");
    }
  );
});

// Access Control
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("danger", "Please login");
    res.redirect("/users/login");
  }
}

module.exports = router;
