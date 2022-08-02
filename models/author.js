const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { DateTime } = require('luxon');

let AuthorSchema = new Schema(
  {
    first_name: {type: String, required: true, maxLength: 100},
    family_name: {type: String, required: true, maxLength: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date}
  }
);


//virtual full name
AuthorSchema.virtual('name').get(function() {
    let fullName = "default";
    //fullName = toString(this.date_of_birth);
    if (this.family_name && this.first_name) {
      fullName = this.family_name + " " + this.first_name;
    }

    return fullName;
  });


AuthorSchema.virtual("lifespan").get(function() {
  let lifeString = "";
  if (this.date_of_birth) {
    //lifeString = this.date_of_birth.getYear().toString();
    lifeString = DateTime.fromJSDate(this.date_of_birth)
                        .toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY);
  }
  lifeString += " - ";
  if (this.date_of_death) {
    //lifeString += this.date_of_death.getYear().toString();
    lifeString += DateTime.fromJSDate(this.date_of_death)
                          .toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY);
  }
  return lifeString;
})


AuthorSchema.virtual("url").get(function() {return "/catalog/author/" + this._id;});

module.exports = mongoose.model("Author", AuthorSchema);