const express = require("express");
const router = express.Router();

// Article Model
let Article = require("../models/article");
// User Model
let User = require("../models/user");

//answers
let Answers = require("../models/answers");

// Add Route
router.get("/add", ensureAuthenticated, function(req, res) {
  res.render("add_article", {
    title: "Add Article",
    path: req.path
  });
});

// Add Submit POST Route
router.post("/add", function(req, res) {
  req.checkBody("title", "Title is required").notEmpty();
  //req.checkBody('author','Author is required').notEmpty();
  req.checkBody("body", "Body is required").notEmpty();

  // Get Errors
  let errors = req.validationErrors();

  if (errors) {
    res.render("add_article", {
      title: "Add Article",
      errors: errors
    });
  } else {
    let article = new Article();
    article.title = req.body.title;
    article.author_id = req.user._id;
    article.author_name = req.user.name;
    article.body = req.body.body;

    article.save(function(err) {
      if (err) {
        console.log(err);
        return;
      } else {
        req.flash("success", "Article Added");
        res.redirect("/");
      }
    });
  }
});

// Load Edit Form
router.get("/edit/:id", ensureAuthenticated, function(req, res) {
  Article.findById(req.params.id, function(err, article) {
    if (article.author_id != req.user._id) {
      req.flash("danger", "Not Authorized");
      res.redirect("/");
    }
    res.render("edit_article", {
      title: "Edit Article",
      article: article
    });
  });
});

// Update Submit POST Route
router.post("/edit/:id", function(req, res) {
  let article = {};
  article.title = req.body.title;
  // article.author = req.body.author;
  article.body = req.body.body;

  let query = { _id: req.params.id };

  Article.update(query, article, function(err) {
    if (err) {
      console.log(err);
      return;
    } else {
      req.flash("success", "Article Updated");
      res.redirect("/");
    }
  });
});

//GET answers

// Delete Article
router.delete("/:id", function(req, res) {
  if (!req.user._id) {
    res.status(500).send();
  }

  let query = { _id: req.params.id };

  Article.findById(req.params.id, function(err, article) {
    if (article.author != req.user._id) {
      res.status(500).send();
    } else {
      Article.deleteOne(query, function(err) {
        if (err) {
          console.log(err);
        }
        res.send("Success");
      });

      let query2 = { articleId: req.params.id };

      Answers.deleteMany(query2, function(err) {
        if (err) {
          console.log(err);
        }
      });
    }
  });
});

// Get Single Article
router.get("/:id", function(req, res) {
  Article.findById(req.params.id, function(err, article) {
    User.findById(article.author_id, function(err, user) {
      Answers.find({ articleId: req.params.id }, function(err, answers) {
        console.log(user);
        res.render("article", {
          article: article,
          author: user.name,
          answers: answers.reverse()
        });
      });
    });
  });
});

router.post("/answers/:id", function(req, res) {
  // res.redirect("/articles/" + req.params.id);

  let answers = new Answers({
    body: req.body.answer,
    articleId: req.params.id,
    author: req.user.name
  });
  answers.save(function(err) {
    if (err) {
      console.log(err);
      return;
    } else {
      req.flash("success", "Answer Added");
      res.redirect("/articles/" + req.params.id);
    }
  });
});

router.post("/likes/:id", ensureAuthenticated, (req, res) => {
  let likes = req.body.like_count;
  const id = req.params.id;

  Answers.updateOne(
    { _id: id },
    { $set: { likes_count: likes } },
    (err, data) => {}
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
