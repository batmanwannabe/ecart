var mongoose = require('mongoose');

// Wishlist Schema
var WishlistSchema = mongoose.Schema({

    username: {
        type: String
    },
    items: [{
            type: String
        }]
});

var Wishlist = module.exports = mongoose.model('Wishlist', WishlistSchema);

