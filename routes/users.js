const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const passport = require("passport");


router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

//register post handle
router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];
  console.log(" Name " + name + " email :" + email + " pass:" + password);
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Remplir les champs" });
  }
  //check if match
  if (password !== password2) {
    errors.push({ msg: "Mdp non valide" });
  }

  //check if password is more than 6 characters
  if (password.length < 6) {
    errors.push({ msg: "Il faut un mdp d'au moins 6 caractères" });
  }
  if (errors.length > 0) {
    res.render("register", {
      errors: errors,
      name: name,
      email: email,
      password: password,
      password2: password2,
    });
  } else {
    //validation passed
    User.findOne({ email: email }).exec((err, user) => {
      console.log(user);
      if (user) {
        errors.push({ msg: "Mail déja utilisé" });
        res.render("register", { errors, name, email, password, password2 });
      } else {
        const newUser = new User({
          name: name,
          email: email,
          password: password,
        });

        //hash password
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            //save pass to hash
            newUser.password = hash;
            //save user
            newUser
              .save()
              .then((value) => {
                console.log(value);
                res.redirect("/users/login");
              })
              .catch((value) => console.log(value));
            req.flash("success_msg", "Connecté");
          })
        );
      }
    });
  }
});

//logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "Déconnecté avec succes");
  res.redirect("/users/login");
});
module.exports = router;
