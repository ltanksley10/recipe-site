const Recipe = require('../models/recipe');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
   const recipe = await Recipe.findById(req.params.id);
   const review = new Review(req.body.review);
   review.creator = req.user._id;
   recipe.reviews.push(review);
   await review.save();
   await recipe.save();
   req.flash('success', 'Created new review!');
   res.redirect(`/recipes/${recipe._id}`);
};

module.exports.deleteReview = async(req, res) => {
    const { id, reviewId } = req.params;
    await Recipe.findByIdAndUpdate(id, {$pull: {reviews: reviewId} });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review');
    res.redirect(`/recipes/${id}`);
};