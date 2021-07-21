const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressErrors');
const session = require('express-session');
//Required Routes
const campgrounds = require('./routes/campgrounds')
const reviews = require('./routes/reviews')
//Learning middleware
const morgan = require('morgan');

mongoose.connect('mongodb://localhost:/yelpCamp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database Connected");
});


app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(morgan('tiny'));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

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

app.use(session(sessionConfig))

app.use((req, res, next) => {
    req.requestTime = Date.now();
    next();
});

//Using Express Router
app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);


app.get('/', (req, res) => {
    res.render('home')
})

app.all('*', (req, res, next) => {
    next(new ExpressError("Page not found", '404'))
})

app.use((err, req, res, next) => {
    const { statusCode=500 } = err;
    if (!err.message) err.message = "Oh No, Something Went Wrong!"
    res.status(statusCode).render('error', {err})
})

app.listen(port, () => {
    console.log(`Listening on Port ${port}`);
});

//You can pass a callback function in a get request before (res, req) provided that the callback contains next (req, res, next), and calls next();