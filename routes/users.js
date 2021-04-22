const express = require('express');
const router = express.Router();
const users = require('../controllers/users');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');

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

module.exports = router;