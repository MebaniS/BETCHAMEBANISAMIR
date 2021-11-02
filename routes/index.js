const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth.js");
const Game = require("../models/game");

router.get("/", (req, res) => {
  res.render("welcome");
});

router.get("/register", (req, res) => {
  res.render("register");
});

router.get("/dashboard", ensureAuthenticated, (req, res) => {
  Game.find({
    $or: [
      { "player.mail": req.user.email },
      { "opponent.mail": req.user.email },
    ],
  }).exec((err, games) => {
    res.render("dashboard", {
      user: req.user,
      games: games
    });
  });
});

module.exports = router;
