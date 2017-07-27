var express = require('express');
var router = express.Router();
var User = require('../models/user');
var mid = require('../middleware');

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
          res.json( user.polls);
        }
      });
});

// GET /profile/mypolls/:qID
router.get('/profile/mypolls/:qID', mid.requiresLogin, function(req,res, next){
  res.send('A particular polls results and the link');
});

// GET /:user/:qID
router.get('/:user/:qID', function(req,res, next){
  res.send('Display Poll question here');
});

// GET /:user/:qID/results
router.get('/:user/:qID/results', function(req,res, next){
  res.send('A particular polls results and the link');
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
