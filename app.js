const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;
const path = require('path');
const Campground = require('./models/campground');
const Review = require('./models/review')
const {campgroundSchema, reviewSchema} = require('./schemas');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressErrors');
//Learning middleware
const morgan = require('morgan');

mongoose.connect('mongodb://localhost:/yelpCamp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database Connected");
});

//Joi Validators

const validateCampground = (req, res, next) => {
    let { error } = campgroundSchema.validate(req.body);

    if(error) {
        let message = error.details.map(el => el.message).join(',');
        throw new ExpressError(message, '400');
    } else {
        next();
    }
}

const validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);

    if(error) {
        let message = error.details.map(el => el.message).join(',');
        throw new ExpressError(message, '400');
    } else {
        next();
    }
}

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(morgan('tiny'));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

app.use((req, res, next) => {
    req.requestTime = Date.now();
    next();
});

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/campgrounds', catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}))

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})

app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError("Invalid Campground Data", "400");

    let camp = new Campground(req.body.campground);
    await camp.save();
    res.redirect(`/campgrounds/${camp._id}`);
}))

app.get('/campgrounds/:id', catchAsync(async (req, res, next) => {
    const camp = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', {camp})
}))

app.get('/campgrounds/:id/edit', catchAsync(async (req, res, next) => {
    const camp = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {camp})
}))

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    //This is campground because name on the form are campground[value]
    const camp = await Campground.findByIdAndUpdate(id, {...req.body.campground}, {new: true});
    res.redirect(`/campgrounds/${camp._id}`);
}))

app.delete('/campgrounds/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds')
}))

app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async(req, res, next) => {
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`)
}))

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