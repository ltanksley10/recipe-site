const User = require('../models/user');
const Recipe = require('../models/recipe');
const async = require('async');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
};

module.exports.register = async(req, res, next) => {
    try{
        const {email, username, password, firstName, lastName} = req.body;
        const user = new User({email, username, firstName, lastName});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if(err) return next(err);
            req.flash('success', 'Welcome to Foodiegram!');
            res.redirect('/recipes');
        });
    } catch(e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
};

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
};

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back!');
    //when login return user to page they were on/trying to view
    const redirectUrl = req.session.returnTo || '/recipes';
    //clear session info
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Goodbye!');
    res.redirect('/recipes');
};

module.exports.renderProfile = (req, res) => {
    User.findById(req.params.id, function(err, foundUser) {
        if(err) {
            req.flash('error', 'Something went wrong.');
            res.redirect('/');
        }
        Recipe.find().where('creator').equals(foundUser._id).exec(function(err, recipes){
            if(err) {
                req.flash('error', 'Something went wrong.');
                res.redirect('/');
            }
            res.render('users/profile', { user:foundUser, recipes: recipes });
        });
    });
};

module.exports.renderForgot = (req, res) => {
    res.render('forgot');
};

module.exports.forgot = (req, res, next) => {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            User.findOne({ email: req.body.email }, function(err, user) {
                if (!user || err) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/forgot');
                }
                
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                
                user.save(function(err) {
                    done(err, token, user);
                });
            });
        }, 
        function(token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'foodiegramreset@gmail.com',
                    pass: process.env.GMAILPW
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'foodiegramreset@gmail.com',
                subject: 'Foodiegram Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the link below, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                console.log('mail sent');
                req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function(err) {
        if (err) return next(err);
        res.redirect('/forgot');
    });
};

module.exports.resetError = (req, res) => {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user || err) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
};

module.exports.resetProcess = (req, res) => {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user || err) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            if (err) {
              req.flash('error', 'Something went wrong.');
            }
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
                if (err) {
                    req.flash('error', 'Something went wrong.');
                }
                req.logIn(user, function(err) {
                  done(err, user);
                });
            });
          });
        } else {
            req.flash('error', 'Passwords do not match.');
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'foodiegramreset@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'foodiegramreset@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
        if (err) {
            req.flash('error', 'Something went wrong.');
        }
        res.redirect('/recipes');
    });
};

module.exports.loginUser = (req, res) => {
  User.findById(req.params.id, function(err, foundUser) {
    if(err) {
      req.flash('error', 'Something went wrong.');
      res.redirect('/');
    }
    Recipe.find().where('creator.id').equals(foundUser._id).exec(function(err, recipes) {
      if(err) {
        req.flash('error', 'Something went wrong.');
        res.redirect('/');
      }
      res.render('users/show', {user: foundUser, recipes: recipes});
    });
  });
};