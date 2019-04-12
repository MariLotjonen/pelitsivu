var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var GameSchema = new Schema(
  {
    title: {type: String, required: true},
    gamestudio: {type: Schema.Types.ObjectId, ref: 'Gamestudio', required: true},
    summary: {type: String, required: true},
    players: {type: String, required: true},
    genre: [{type: Schema.Types.ObjectId, ref: 'Genre'}],
    platform: [{type: Schema.Types.ObjectId, ref: 'Platform'}],
  }
);

// Virtual for game's URL
GameSchema
.virtual('url')
.get(function () {
  return '/catalog/game/' + this._id;
});

//Export model
module.exports = mongoose.model('Game', GameSchema);