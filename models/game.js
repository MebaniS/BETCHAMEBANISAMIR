const mongoose = require("mongoose");
const PlayerSchema = new mongoose.Schema({
    mail: {
        type: String,
        required: true,
    },
    coin : {
        type: Number,
        required: true,
    }
})
const GameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  player: {
    type: PlayerSchema,
    required: true,
  },
  opponent: {
    type: PlayerSchema,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
});
const Game = mongoose.model("Game", GameSchema);

module.exports = Game;
