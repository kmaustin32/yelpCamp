const mongoose = require('mongoose');
const cities = require('./cities');
const Campground = require('../models/campground');

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

// THE FOLLOWING FUNCTION DELETES THE DATABASE!!


const seedDb = async () => {
    await Campground.deleteMany({});
    for(let i = 0; i < 50; i++) {
        let random1000 = Math.floor(Math.random() * 1000);
        let camp = new Campground({
            title: `testLocation${i}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`
        })
        await camp.save();
    }
}

seedDb().then(() => {
    mongoose.connection.close();
});
