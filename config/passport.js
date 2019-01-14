const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const { Client } = require("pg");
const config = require("./database");

const client = new Client({
  connectionString: config.postgresUrl
});

client.connect();

module.exports = function(passport) {
  // Local Strategy
  passport.use(
    new LocalStrategy(function(name, password, done) {
      // Match Username

      const query = {
        // give the query a unique name
        text: "SELECT * FROM users WHERE name = $1",
        values: [name]
      };
      client.query(query, function(err, user) {
        if (err) throw err;
        if (!user.rows[0]) {
          return done(null, false, { message: "No user found" });
        }

        // Match Password

        // ako u bazi definisem polja sa char ova funkcija nece raditi
        bcrypt.compare(password, user.rows[0].password, function(err, isMatch) {
          if (err) throw err;
          if (isMatch) {
            return done(null, user.rows[0], {
              message: `Welcome ${user.rows[0].name}`
            });
          } else {
            //message je alert-error class koju sam definisao u css- u
            //ovo poruku prikazujemo u pug na mestu  != messages('message', locals)
            return done(null, false, { message: "Wrong password" });
          }
        });
      });
    })
  );

  passport.serializeUser(function(user, done) {
    //vraca user koji je prosao login i prosledjuje ga u sledecu funkciju "passport.deserializeUser"
    done(null, user._id);
  });

  passport.deserializeUser(function(_id, done) {
    client.query("SELECT * FROM users WHERE _id = $1", [_id], function(
      err,
      user
    ) {
      // ovo se smesta u session i onda mozemo koristi req.user
      done(err, user.rows[0]);
    });
  });
};
