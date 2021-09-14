const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary/index')

module.exports.index = async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
};

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
};

module.exports.createCampground = async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError("Invalid Campground Data", "400");
    
    const camp = new Campground(req.body.campground);
    camp.images = req.files.map(f => ({url: f.path, filename: f.filename}));
    camp.author = req.user._id;
    await camp.save();
    req.flash('success', 'Successfully made a new campground!')
    res.redirect(`/campgrounds/${camp._id}`);
};

module.exports.showCampground = async (req, res, next) => {
    const camp = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if(!camp) {
        req.flash('error', 'Campground not found')
        return res.redirect('/campgrounds')
    }
    console.log(camp.images);
    req.session.returnTo = req.originalUrl;
    res.render('campgrounds/show', {camp})
};

module.exports.renderEditForm = async (req, res, next) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    if(!camp) {
        req.flash('error', 'Campground not found');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {camp})
};

module.exports.updateCampground = async (req, res, next) => {
    const { id } = req.params;
    console.log(req.body)
    //This is campground because name on the form are campground[value]
    const camp = await Campground.findByIdAndUpdate(id, {...req.body.campground}, {new: true});
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));
    camp.images.push(...imgs);
    camp.save()
    if(req.body.deleteImages) {
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await camp.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});
    }
    console.log(camp)
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${camp._id}`);
};

module.exports.destroyCampground = async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!')
    res.redirect('/campgrounds')
};