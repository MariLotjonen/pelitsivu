var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var GamestudioSchema = new Schema(
  {
    country: {type: String, required: true, max: 100},
    studioname: {type: String, required: true, max: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date},
  }
);

// Virtual for gamestudio's full name
GamestudioSchema
.virtual('name')
.get(function () {
  return this.studioname + ', ' + this.country;
});

// Virtual for gamestudio's lifespan
GamestudioSchema
.virtual('lifespan')
.get(function () {
  var lifetime_string='';
  if (this.date_of_birth) {
      lifetime_string=moment(this.date_of_birth).format('MMMM Do, YYYY');
      }
  lifetime_string+=' - ';
  if (this.date_of_death) {
      lifetime_string+=moment(this.date_of_death).format('MMMM Do, YYYY');
      }
  return lifetime_string
});

// Virtual for gamestudio's URL
GamestudioSchema
.virtual('url')
.get(function () {
  return '/catalog/gamestudio/' + this._id;
});

//Export model
module.exports = mongoose.model('Gamestudio', GamestudioSchema);