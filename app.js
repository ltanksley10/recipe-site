require('dotenv').config();   
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');

const userRoutes = require('./routes/users');
const recipes = require('./routes/recipes');
const reviews = require('./routes/reviews');

const MongoStore = require('connect-mongo')(session);

const dbUrl = process.env.EXPRESS_APP_DATABASEURL;
const atlasUrl = process.env.DB_URL;

//connect to mongoose
mongoose.connect(atlasUrl || dbUrl, {
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

const secret = process.env.SECRET;

//cookies
const store = new MongoStore({
    url: atlasUrl,
    secret: secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function(e) {
    console.log("Session store error", e);
});

const sessionConfig = {
    store,
    name: 'sesh',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionConfig));

//sanitize
app.use(mongoSanitize());

//helmet
app.use(helmet());
const scriptSrcUrls = [
  "https://cdn.jsdelivr.net/",
  "https://stackpath.bootstrapcdn.com/",
  "https://kit.fontawesome.com/",
  "https://code.jquery.com/",
  "https://cdnjs.cloudflare.com/",
];
const styleSrcUrls = [
  "https://cdn.jsdelivr.net/",
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.cdn/",
];
const connectSrcUrls = [];
const fontSrcUrls = [];
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: [],
        connectSrc: ["'self'", ...connectSrcUrls],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", "blob:"],
        objectSrc: [],
        imgSrc: [
            "'self'",
            "blob:",
            "data:",
            "https://res.cloudinary.com/dogcjimu5/",
            "https://images.unsplash.com/"
        ],
        fontSrc: ["'self'", ...fontSrcUrls],
    },
}));


//passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//flash
app.use(flash());

// flash middleware
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});


//router paths
app.use('/', userRoutes);
app.use('/recipes', recipes);
app.use('/recipes/:id/reviews', reviews);

//root path
app.get('/', (req, res) => {
    res.render('home');
});


//Error paths
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh no, something went wrong!';
    res.status(statusCode).render('error', { err });
});

//connect to server
const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Serving on port ${port}`)
});