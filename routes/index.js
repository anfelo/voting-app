var express = require('express');
var router = express.Router();
var User = require('../models/user');
var mid = require('../middleware');

router.param('qID', function (req, res, next, id) {
	User.findById(req.session.userId, function(err, doc) {
		if(err) return next(err);
		if(!doc) {
			err = new Error('Not Found');
			err.status = 404;
			return next(err);
    }
    var filterPolls = doc.polls.filter(function(poll){
      return poll._id+'' === id;
    });
    req.user = doc;
		req.poll = filterPolls[0];
		return next();
	});
});

router.param('uID', function (req, res, next, id) {
	User.findById(id, function(err, doc) {
		if(err) return next(err);
		if(!doc) {
      console.log('Did not find user');
			err = new Error('Not Found');
			err.status = 404;
			return next(err);
    }
    req.user = doc;
		return next();
	});
});

router.param('pID', function (req, res, next, id) {
  req.poll = req.user.polls.id(id);
	if(!req.poll) {
    console.log('Did not find poll');
			err = new Error('Not Found');
			err.status = 404;
			return next(err);
		}
	next();
});

// GET /logout
router.get('/logout', function(req, res, next) {
  if(req.session){
    //delete session
    req.session.destroy(function(err){
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

// GET /profile
router.get('/profile', mid.requiresLogin, function(req,res, next){
  User.findById(req.session.userId)
      .exec(function (error, user) {
        if (error) {
          return next(error);
        } else {
          req.user = user;
          return res.render('profile', { title: 'Profile', name: user.name });
        }
      });
});

// POST /profile
// Create Poll
router.post('/profile', mid.requiresLogin, function(req,res, next){
  if(req.body.question &&
    req.body.choice1 &&
    req.body.choice2) {

    // create object with Poll info
    var poll = {
      text: req.body.question,
      answers: [
        {text:req.body.choice1},
        {text:req.body.choice2},
        {text:req.body.choice3 || null},
        {text:req.body.choice4 || null},
      ],
    };

    User.findById(req.session.userId)
      .exec(function (error, user) {
        if (error) {
          return next(error);
        } else {
          user.polls.push(poll);
          user.save(function(err, user) {
            if(err) return next(err);
            res.status(201);
            return res.redirect('/profile/mypolls/'+user.polls[user.polls.length-1]._id);
          });
        }
      });
  }
});

// GET /profile/mypolls
router.get('/profile/mypolls', mid.requiresLogin, function(req,res, next){
  User.findById(req.session.userId)
      .exec(function (error, user) {
        if (error) {
          return next(error);
        } else {
          res.render('mypolls', {polls: user.polls, name: user.name, title: 'Polls'});
        }
      });
});

// GET /profile/mypolls/:qID
router.get('/profile/mypolls/:qID', mid.requiresLogin, function(req,res, next){
  res.render('pollSummary', {poll:req.poll.text, pId:req.poll._id, name:req.user.name, uId:req.user._id, title: 'Poll Summary'});
});

// GET /:uID/polls/:pID
router.get('/:uID/polls/:pID', function(req,res, next){
  res.render('vote', {poll:req.poll.text, id:req.poll._id, answers: req.poll.answers, uId:req.user._id, title: 'Vote'});
});

// POST /:uID/polls/:qID
router.post('/:uID/polls/:pID', function(req,res, next){
  // Vote on answer
  req.poll.answers[req.body.choice].vote(function(err, poll) {
      if(err) return next(err);
			res.redirect('/'+req.user._id+'/polls/'+req.poll._id+'/results');
  });
});

// GET /:user/polls/:qID/results
router.get('/:uID/polls/:pID/results', function(req,res, next){
  if(req.query.format === 'json'){
   return res.json(req.poll.answers);
  }
  res.render('results', {poll:req.poll.text, uId:req.user._id, pId:req.poll._id, title: 'Results'});
});

// GET /login
router.get('/login', mid.loggedOut, function(req, res, next) {
  return res.render('login', { title: 'Log In' });
});

// POST /login
router.post('/login', function(req, res, next){
  if (req.body.email && req.body.password) {
    User.authenticate(req.body.email, req.body.password, function(error, user){
      if(error || !user){
        var err = new Error('Wrong email or password');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });
  } else {
    var err = new Error('Email and password are required!');
    error.status = 401;
    return next(err);
  }
});

// GET /register
router.get('/register', mid.loggedOut, function(req, res, next) {
  return res.render('register', { title: 'Sign Up' });
});

// POST /register
router.post('/register', function(req, res, next) {
  if(req.body.email &&
    req.body.name &&
    req.body.password &&
    req.body.confirmPassword) {

    // confirm that the user typed the same password twice
    if(req.body.password !== req.body.confirmPassword) {
      var err = new Error('Passwords do not match.');
      err.status = 400;
      return next(err);
    } 

    // create object with  form input
    var userData = {
      email: req.body.email,
      name: req.body.name,
      password: req.body.password
    };

    // use Schema's 'create' method to insert  document into mongo 
    User.create(userData, function(error, user){
      if(error){
        return next(error);
      } else {
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });
    
  } else {
    var err = new Error('All fields required');
    err.status = 400;
    return next(err);
  }
});

// GET /
router.get('/', function(req, res, next) {
  return res.render('index', { title: 'Home' });
});

module.exports = router;
