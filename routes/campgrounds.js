const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const Review = require('../models/review');

const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');


//Campgrounds routes
router.get('/', catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}))

router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new')
})

router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError("Invalid Campground Data", "400");

    let camp = new Campground(req.body.campground);
    camp.author = req.user._id;
    await camp.save();
    req.flash('success', 'Successfully made a new campground!')
    res.redirect(`/campgrounds/${camp._id}`);
}))

router.get('/:id', catchAsync(async (req, res, next) => {
    const camp = await Campground.findById(req.params.id).populate('reviews').populate('author');
    if(!camp) {
        req.flash('error', 'Campground not found')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', {camp})
}))

router.get('/:id/edit', isLoggedIn,isAuthor, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    if(!camp) {
        req.flash('error', 'Campground not found');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {camp})
}))

router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    //This is campground because name on the form are campground[value]
    const camp = await Campground.findByIdAndUpdate(id, {...req.body.campground}, {new: true});
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${camp._id}`);
}))

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res, next) => {
    const { id } = req.params;

    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!')
    res.redirect('/campgrounds')
}))

module.exports = router;