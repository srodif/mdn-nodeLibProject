const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { DateTime } = require("luxon");

let BookInstanceSchema = new Schema(
  {
    book: {type: Schema.Types.ObjectId, ref: "Book", required: true},
    imprint: {type: String, required: true},
    copyStatus: {type: String, required: true, enum: ["Available", "Maintenance", "Loaned", "Reserved"], default: "Maintenance"},
    dueBack: {type: Date, default: Date.now}
  }
);

BookInstanceSchema.virtual('due_back_formatted')
  .get( function() {
    return DateTime.fromJSDate(this.dueBack).toLocaleString(DateTime.DATE_MED);
  });

BookInstanceSchema.virtual("url").get(function() {return "/catalog/bookinstance/" + this._id;});

module.exports = mongoose.model("BookInstance",BookInstanceSchema);