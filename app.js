const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;
const path = require('path');
const Campground = require('./models/campground');

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

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
})

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})

app.post('/campgrounds', async (req, res) => {
    let camp = new Campground(req.body.campground);
    await camp.save();
    res.redirect(`/campgrounds/${camp._id}`);
})

app.get('/campgrounds/:id', async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    res.render('campgrounds/show', {camp})
})

//Test path
app.get('/makecampground', async (req, res) => {
    let camp = new Campground({title: "My Backyard"})
    await camp.save();
    res.send(camp);
})

app.listen(port, () => {
    console.log(`Listening on Port ${port}`);
});