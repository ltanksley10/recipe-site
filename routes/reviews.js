const express = require('express');
const router = express.Router({mergeParams: true});
const {reviewSchema} = require('../schemas.js');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Recipe = require('../models/recipe');
const Review = require('../models/review');

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

router.post('/', validateReview, catchAsync(async (req, res) => {
   const recipe = await Recipe.findById(req.params.id);
   const review = new Review(req.body.review);
   recipe.reviews.push(review);
   await review.save();
   await recipe.save();
   req.flash('success', 'Created new review!');
   res.redirect(`/recipes/${recipe._id}`);
}));

router.delete('/:reviewId', catchAsync(async(req, res) => {
    const { id, reviewId } = req.params;
    await Recipe.findByIdAndUpdate(id, {$pull: {reviews: reviewId} });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review');
    res.redirect(`/recipes/${id}`);
}));

module.exports = router;