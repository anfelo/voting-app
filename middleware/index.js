var User = require('../models/user');

function loggedOut (req, res, next) {
    if(req.session && req.session.userId){
        return res.redirect('/profile');
    }
    return next();
}

function requiresLogin (req, res, next) {
    if(req.session && req.session.userId){
        return next();
    } else {
        var err = new Error('You must be logged in to view this page.');
        err.status = 401;
        return next(err);
    }
}

function getConnectedUser (req, res, next) {
  if(req.session && req.session.userId){
    User.findById(req.session.userId)
      .exec(function (error, user) {
        if (error) {
          return next(error);
        } else {
          req.currentUserName = user.name;
          return next();
        }
    });
  } else {
    req.currentUserName = null;
    return next();
  }
}

module.exports.loggedOut = loggedOut;
module.exports.requiresLogin = requiresLogin;
module.exports.getConnectedUser = getConnectedUser;
                