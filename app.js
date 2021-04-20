require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');

const recipes = require('./routes/recipes');
const reviews = require('./routes/reviews');

const dbUrl = process.env.EXPRESS_APP_DATABASEURL;

//connect to mongoose
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
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
app.use(express.static(path.join(__dirname, 'public')));

//cookies
const sessionConfig = {
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));

//flash
app.use(flash());

// flash middleware
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

//router paths
app.use('/recipes', recipes);
app.use('/recipes/:id/reviews', reviews);

//root path
app.get('/', (req, res) => {
    res.render('home');
});

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