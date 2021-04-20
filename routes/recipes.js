const express = require('express');
const router = express.Router();
const {recipeSchema} = require('../schemas.js');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Recipe = require('../models/recipe');
const Review = require('../models/review');

//all recipes path
router.get('/', catchAsync(async(req, res) => {
    const recipes = await Recipe.find({});
    res.render('recipes/index', {recipes});
}));

//new recipe path
router.get('/new', (req, res) => {
    res.render('recipes/new');
});

router.post('/', catchAsync(async (req, res, next) => {
    const recipe = new Recipe(req.body.recipe);
    await recipe.save();
    req.flash('success', 'Successfully made a new recipe!!');
    res.redirect(`/recipes/${recipe._id}`);
}));

//specific recipe path  
router.get('/:id', catchAsync(async (req, res) => {
    const recipe = await Recipe.findById(req.params.id).populate('reviews');
    if(!recipe) {
        req.flash('error', 'Cannot find that recipe');
        return res.redirect('/recipes');
    }
    res.render('recipes/show', { recipe }); 
}));

//edit path
router.get('/:id/edit', catchAsync(async (req, res) => {
    const recipe = await Recipe.findById(req.params.id);
    res.render('recipes/edit', { recipe }); 
}));

router.put('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const recipe = await Recipe.findByIdAndUpdate(id, {...req.body.recipe});
    req.flash('success', 'Successfully updated recipe!');
    res.redirect(`/recipes/${recipe._id}`);
}));

router.delete('/:id', catchAsync(async (req, res) => {
    const {id} = req.params;
    await Recipe.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted recipe');
    res.redirect('/recipes');
}));

module.exports = router;