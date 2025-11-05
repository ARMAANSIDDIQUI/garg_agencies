const mongoose = require("mongoose")

const BeatsSchema = new mongoose.Schema({
    beatName: {
        type: String,
        required: true,
        unique: true,
      }
})

const Beats = mongoose.model("Beats",BeatsSchema);
module.exports = Beats;