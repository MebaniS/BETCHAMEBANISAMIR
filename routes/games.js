const express = require("express");
const router = express.Router();
const Game = require("../models/game");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const passport = require("passport");

//routeur
router.get("/games", (req, res) => {
  Game.find({
    $or: [
      { "player.mail": req.user.email },
      { "opponent.mail": req.user.email },
    ],
  }).exec((err, games) => {
    console.log(games);
  });
  res.render("login");
});

//supprimer partie
router.get("/delete/:gameName", (req, res) => {
  let errors = [];
  let success = [];
  console.log(req.params.gameName + req.user.email);
  Game.findOne({
    name: req.params.gameName,
    "player.mail": req.user.email,
  }).exec((err, game) => {
    if (game) {
      Game.deleteOne({
        name: req.params.gameName,
        "player.mail": req.user.email,
      }).exec((err, success) => {
        res.redirect("/dashboard");
      });
    } else {
      errors.push({ msg: "Vous n'etes pas le créateur" });
      res.redirect("/dashboard");
    }
  });
});

//rejoindre game
router.get("/join/:gameName", (req, res) => {
  let errors = [];
  let success = [];
  console.log(req.params.gameName);
  Game.findOne({ name: req.params.gameName }).exec((err, game) => {
    if (game) {
      Game.findOne({
        name: req.params.gameName,
        $or: [
          { "player.mail": req.user.email },
          { "opponent.mail": req.user.email },
        ],
      }).exec((err, game) => {
        if (game) {
            res.render("game", { errors, game });
        } else {
          Game.findOne({ name: req.params.gameName }).exec((err, game) => {
            res.render("spec-game", { errors, game });
          })
        }
      });
    } else {
      errors.push({ msg: "Vous n'etes pas le créateur" });
      res.render("game", { errors, game });
    }
  });
});


router.post("/create", (req, res) => {
  const { gameName, opponentMail } = req.body;
  let errors = [];
  console.log(" gameName " + gameName + " opponentName :" + opponentMail);

  if (!gameName || !opponentMail) {
    errors.push({ msg: "Remplir tout les champs" });
  }

  User.findOne({ email: opponentMail }).exec((err, user) => {
    if (user) {
      Game.findOne({ name: gameName }).exec((err, game) => {
        console.log(game);
        if (game) {
          errors.push({ msg: "Partie existante" });
          res.render("dashboard", { errors, gameName, opponentMail });
        } else {
          const newGame = new Game({
            name: gameName,
            player: { mail: req.user.email, coin: 100 },
            opponent: { mail: opponentMail, coin: 100 },
            status: "Start",
          });

          newGame
            .save()
            .then((value) => {
              console.log(value);
              res.redirect("/dashboard");
            })
            .catch((value) => console.log(value));
          req.flash("success_msg", "Partie créer !");
        }
      });
    } else {
      errors.push({ msg: "compte non enregistré" });
      res.render("dashboard", { errors, gameName, opponentMail });
    }
  });
});

module.exports = router;
