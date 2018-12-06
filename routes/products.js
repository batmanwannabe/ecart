var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
var auth = require('../config/auth');
var isUser = auth.isUser;

// Get Product model
var Product = require('../models/product');

// Get Category model
var Category = require('../models/category');

//Get Deals model
var Deals = require('../models/deals');

var Order = require('../models/cart');

/*
 * GET all products
 */
router.get('/', function (req, res) {
//router.get('/', isUser, function (req, res) {

    if (req.isAuthenticated()) {
        if (typeof req.session.cart === "undefined") {
            console.log(req.session.cart);
            Order.findOne({username: res.locals.user.username, isordered: false}, function (err, cart) {
                if (cart !== null)
                {
                    req.session.cart = [];
                    console.log(req.session.cart);
                    cart.cartItems.forEach(function (element) {
                        req.session.cart.push({
                            title: element.title,
                            qty: element.quantity,
                            price: parseFloat(element.price / element.quantity).toFixed(2),
                            image: element.image
                        });
                        console.log(req.session.cart);
                    });
                }
            });
        }
    }
    setTimeout(function () {
        Product.find(function (err, products) {
            if (err)
                console.log(err);

            res.render('all_products', {
                title: 'All products',
                products: products
            });
        });
    }, 2000);


});

/*
 * GET products by category
 */
router.get('/recommendation', function (req, res) {

    //var username = res.locals.user.username;

    Order.find({username: res.locals.user.username, isordered: true}, function (err, orders) {
        if (err)
            console.log(err);
        //console.log(orders);
        var prod = [];
        var catt = new Array();
        var actProds = [];
        //catt.push("testttt");
        if (orders.length != 0) {
            orders.forEach(function (element) {
                //console.log(element);
                element.cartItems.forEach(function (i) {
                    prod.push(i.title);
                    //catt.push(i.title);
                    console.log(i.title);
                    Product.findOne({slug: i.title}, function (err, product) {
                        if (err)
                            console.log(err);
                        //console.log(product);
                        if (product !== null && !catt.includes(product.category)) {
                            catt.push(product.category);
                            console.log(catt);
                            Product.find({category: product.category}, function (err, prodd) {
                                prodd.forEach(function (e) {
                                    actProds.push(e);

                                });

                            });
                        }
                    });
                });
            });


        }
        //console.log(prod);

        setTimeout(function () {
            console.log(actProds);
            res.render('cat_products', {
                title: "Recommendations",
                products: actProds
            });
        }, 2000);
        //if(cat.count)

    });

});
/*
 * GET products by category
 */
router.get('/:category', function (req, res) {

    var categorySlug = req.params.category;

    Category.findOne({slug: categorySlug}, function (err, c) {
        Product.find({category: categorySlug}, function (err, products) {
            if (err)
                console.log(err);

            res.render('cat_products', {
                title: c.title,
                products: products
            });
        });
    });

});

/*
 * GET product details
 */
router.get('/:category/:product', function (req, res) {

    var galleryImages = null;
    var loggedIn = (req.isAuthenticated()) ? true : false;

    Product.findOne({slug: req.params.product}, function (err, product) {
        if (err) {
            console.log(err);
        } else {
            var galleryDir = 'public/product_images/' + product._id + '/gallery';

            fs.readdir(galleryDir, function (err, files) {
                if (err) {
                    console.log(err);
                } else {
                    galleryImages = files;
                    Category.findOne({slug: product.category}, function (err, cat) {
                        res.render('product', {
                            title: product.title,
                            p: product,
                            galleryImages: galleryImages,
                            loggedIn: loggedIn,
                            category: cat
                        });
                    });
                }
            });
        }
    });

});


// Exports
module.exports = router;


