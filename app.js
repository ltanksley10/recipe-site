require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const Recipe = require('./models/recipe');

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

//root path
app.get('/', (req, res) => {
    res.render('home');
});

//all recipes path
app.get('/recipes', async (req, res) => {
    const recipes = await Recipe.find({});
    res.render('recipes/index', {recipes});
});

//new recipe path
app.get('/recipes/new', (req, res) => {
    res.render('recipes/new');
});

app.post('/recipes', async (req, res) => {
    const recipe = new Recipe(req.body.recipe);
    await recipe.save();
    res.redirect(`/recipes/${recipe._id}`);
});

//specific recipe path
app.get('/recipes/:id', async (req, res) => {
    const recipe = await Recipe.findById(req.params.id);
    res.render('recipes/show', { recipe }); 
});

//edit path
app.get('/recipes/:id/edit', async (req, res) => {
    const recipe = await Recipe.findById(req.params.id);
    res.render('recipes/edit', { recipe }); 
});

app.put('/recipes/:id', async (req, res) => {
    const { id } = req.params;
    const recipe = await Recipe.findByIdAndUpdate(id, {...req.body.recipe});
    res.redirect(`/recipes/${recipe._id}`);
});

app.delete('/recipes/:id', async (req, res) => {
    const {id} = req.params;
    await Recipe.findByIdAndDelete(id);
    res.redirect('/recipes');
});

app.listen(8080, () => {
    console.log('Serving on port 8080')
});