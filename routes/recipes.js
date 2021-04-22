const express = require('express');
const router = express.Router();
const recipes = require('../controllers/recipes');
const {isLoggedIn, isCreator} = require('../middleware');
const catchAsync = require('../utils/catchAsync');

//all recipes and create new recipe route
router.route('/')
    .get(catchAsync(recipes.index))
    .post(isLoggedIn, catchAsync(recipes.createRecipe));
    
//new recipe path - new route must go before show route
router.get('/new', isLoggedIn, recipes.renderNewForm);
    
// show recipe, update recipe, and delete recipe routes
router.route('/:id')
    .get(catchAsync(recipes.showRecipe))
    .put(isLoggedIn, isCreator, catchAsync(recipes.updateRecipe))
    .delete(isLoggedIn, isCreator, catchAsync(recipes.deleteRecipe));

//edit path
router.get('/:id/edit', isLoggedIn, isCreator, catchAsync(recipes.renderEditForm));

module.exports = router;