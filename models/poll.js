var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AnswerSchema = new Schema({
		text: String,
		votes: {type: Number, default: 0}
});

AnswerSchema.method('vote', function(callback) {
	this.votes += 1;
	this.parent().parent().save(callback);
});

var PollSchema = new Schema({
  text: {
    type: String,
    required: true,
    trim: true,
  },
  answers: [AnswerSchema],
  ips:[],
});

PollSchema.method('addIp', function(ip, callback) {
  this.ips.push(ip);
  this.parent().save(callback);
});

PollSchema.method('update', function(reqUpdates, callback) {
  var updates = {
    text: reqUpdates.question,
    answers: [
      {text: reqUpdates.choice1, votes: this.answers[0].votes},
      {text: reqUpdates.choice2, votes: this.answers[1].votes},
      {text: reqUpdates.choice3, votes: this.answers[2].votes},
      {text: reqUpdates.choice4, votes: this.answers[3].votes},
    ],
  }
	Object.assign(this, updates);
	this.parent().save(callback);
});

module.exports.PollSchema = PollSchema;

