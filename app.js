require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const {recipeSchema, reviewSchema} = require('./schemas.js');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Recipe = require('./models/recipe');
const Review = require('./models/review');

const dbUrl = process.env.EXPRESS_APP_DATABASEURL;

//connect to mongoose
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const path = require('path');

//using ejs
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//parse body of recipe input
app.use(express.urlencoded({extended: true}));

//method override to make express think a put request is a post request
app.use(methodOverride('_method'));

//middleware
const validateRecipe = (req, res, next) => {
    const { error } = recipeSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

//root path
app.get('/', (req, res) => {
    res.render('home');
});

//all recipes path
app.get('/recipes', catchAsync(async(req, res) => {
    const recipes = await Recipe.find({});
    res.render('recipes/index', {recipes});
}));

//new recipe path
app.get('/recipes/new', (req, res) => {
    res.render('recipes/new');
});

app.post('/recipes', validateRecipe, catchAsync(async (req, res, next) => {
    const recipe = new Recipe(req.body.recipe);
    await recipe.save();
    res.redirect(`/recipes/${recipe._id}`);
}));

//specific recipe path
app.get('/recipes/:id', catchAsync(async (req, res) => {
    const recipe = await Recipe.findById(req.params.id).populate('reviews');
    res.render('recipes/show', { recipe }); 
}));

//edit path
app.get('/recipes/:id/edit', catchAsync(async (req, res) => {
    const recipe = await Recipe.findById(req.params.id);
    res.render('recipes/edit', { recipe }); 
}));

app.put('/recipes/:id', validateRecipe, catchAsync(async (req, res) => {
    const { id } = req.params;
    const recipe = await Recipe.findByIdAndUpdate(id, {...req.body.recipe});
    res.redirect(`/recipes/${recipe._id}`);
}));

app.delete('/recipes/:id', catchAsync(async (req, res) => {
    const {id} = req.params;
    await Recipe.findByIdAndDelete(id);
    res.redirect('/recipes');
}));

app.post('/recipes/:id/reviews', validateReview, catchAsync(async (req, res) => {
   const recipe = await Recipe.findById(req.params.id);
   const review = new Review(req.body.review);
   recipe.reviews.push(review);
   await review.save();
   await recipe.save();
   res.redirect(`/recipes/${recipe._id}`);
}));

app.delete('/recipes/:id/reviews/:reviewId', catchAsync(async(req, res) => {
    const { id, reviewId } = req.params;
    await Recipe.findByIdAndUpdate(id, {$pull: {reviews: reviewId} });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/recipes/${id}`);
}));

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh no, something went wrong!';
    res.status(statusCode).render('error', { err });
});

app.listen(8080, () => {
    console.log('Serving on port 8080')
});