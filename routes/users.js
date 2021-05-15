const express = require('express');
const router = express.Router();
const users = require('../controllers/users');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const User = require('../models/user');
const Recipe = require('../models/recipe');

//render register form and register route
router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

//render login form and login route    
router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.login);
    
//logout route
router.get('/logout', users.logout);

router.get("/users/:id", users.renderProfile);

// forgot password 
router.route('/forgot')
    .get(users.renderForgot)
    .post(users.forgot);

router.route('/reset/:token')
    .get(users.resetError)
    .post(users.resetProcess);

// USER PROFILE
router.get('/users/:id', users.loginUser);

module.exports = router;