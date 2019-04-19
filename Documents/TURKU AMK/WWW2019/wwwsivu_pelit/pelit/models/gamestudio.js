var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var GamestudioSchema = new Schema(
  {
    studioname: {type: String, required: true, max: 100},
    country: {type: String, required: true, max: 100},
    history: {type: String, required: true},
    year: {type: String},
  }
);

// Virtual for gamestudio's name and country
GamestudioSchema
.virtual('name')
.get(function () {
  return this.studioname + ', ' + this.country;
});

// Virtual for gamestudio's year
GamestudioSchema
.virtual('starting_year')
.get(function () {
  return this.year;
});

// Virtual for gamestudio's history
GamestudioSchema
.virtual('gamestudio_history')
.get(function () {
  return this.history;
});

// Virtual for gamestudio's URL
GamestudioSchema
.virtual('url')
.get(function () {
  return '/catalog/gamestudio/' + this._id;
});

//Export model
module.exports = mongoose.model('Gamestudio', GamestudioSchema);
