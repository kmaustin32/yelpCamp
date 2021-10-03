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
    for(let i = 0; i < 200; i++) {
        let random1000 = Math.floor(Math.random() * 1000);
        let price = Math.floor(Math.random() * 20) + 10;
        let camp = new Campground({
            title: `testLocation${i + 1}`,
            images: [
                {
                  url: 'https://res.cloudinary.com/kmezreaper/image/upload/v1630576412/yelpCamp/nzz4hhapshzbmt1vdqwy.jpg',
                  filename: 'yelpCamp/nzz4hhapshzbmt1vdqwy'
                },
                {
                  url: 'https://res.cloudinary.com/kmezreaper/image/upload/v1630576419/yelpCamp/ksho0xyrsg7lhsvjacnj.jpg',
                  filename: 'yelpCamp/ksho0xyrsg7lhsvjacnj'
                }
              ],
            price: price,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude, 
                    cities[random1000].latitude
                ]
            },
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            //Taken from a user in database, change on different machine
            author: '6151776634f9691da847160d'
        })
        await camp.save();
    }
}

seedDb().then(() => {
    mongoose.connection.close();
});
