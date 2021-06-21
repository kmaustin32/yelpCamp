const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;
const path = require('path');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
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

app.get('/campgrounds/:id/edit', async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {camp})
})

app.put('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    //This is campground because name on the form are campground[value]
    const camp = await Campground.findByIdAndUpdate(id, {...req.body.campground}, {new: true});
    res.redirect(`/campgrounds/${camp._id}`);
})

app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds')
})

//Test path
app.get('/makecampground', async (req, res) => {
    let camp = new Campground({title: "My Backyard"})
    await camp.save();
    res.send(camp);
})

app.use((req, res) => {
    res.status(404).send("Error: Page Not Found");
});

app.listen(port, () => {
    console.log(`Listening on Port ${port}`);
});

//You can pass a callback function in a get request before (res, req) provided that the callback contains next (req, res, next), and calls next();