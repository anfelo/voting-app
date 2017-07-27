var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AnswerSchema = new Schema({
		text: String,
		votes: {type: Number, default: 0}
});

AnswerSchema.method('vote', function(callback) {
	this.votes += 1;
	this.parent().save(callback);
});

var PollSchema = new Schema({
  text: {
    type: String,
    required: true,
    trim: true,
    unique: false,
  },
  answers: [AnswerSchema],
});

module.exports.PollSchema = PollSchema;

