const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let GenreSchema = new Schema(
  {
    name: {type: String}
  }
);

GenreSchema.virtual("url").get( function() { return "/catalog/genre/" + this._id;});

module.exports = mongoose.model("Genre", GenreSchema);