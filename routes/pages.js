var express = require('express');
var router = express.Router();

// Get Page model
var Page = require('../models/page');

var Cart = require('../models/cart');

/*
 * GET /
 */
router.get('/', function (req, res) {


//    if (req.isAuthenticated()) {
//        if (typeof req.session.cart == "undefined") {
//
//            Cart.findOne({username: res.locals.user.username, isordered: false}, function (err, cart) {
//                if (cart !== null)
//                {
//                    req.session.cart = [];
//                    cart.cartItems.forEach(function (element) {
//                        req.session.cart.push({
//                            title: element.title,
//                            qty: element.quantity,
//                            price: parseFloat(element.price / element.quantity).toFixed(2),
//                            image: element.image
//                        });
//                    });
//                }
//            });
//        }
//    }
    Page.findOne({slug: 'home'}, function (err, page) {
        if (err)
            console.log(err);
        if (req.isAuthenticated()) {
            if (typeof req.session.cart === "undefined") {

                Cart.findOne({username: res.locals.user.username, isordered: false}, function (err, cart) {
                    console.log(cart);
                    if (cart !== null)
                    {
                        req.session.cart = [];
                        cart.cartItems.forEach(function (element) {
                            req.session.cart.push({
                                title: element.title,
                                qty: element.quantity,
                                price: parseFloat(element.price / element.quantity).toFixed(2),
                                image: element.image
                            });
                        });
                        console.log(req.session.cart);
                        res.render('index', {
                            title: page.title,
                            content: page.content
                        });
                    } else {
                        res.render('index', {
                            title: page.title,
                            content: page.content
                        });
                    }
                });
            } else {
                res.render('index', {
                    title: page.title,
                    content: page.content
                });
            }
        } else {
            res.render('index', {
                title: page.title,
                content: page.content
            });
        }


    });

});

/*
 * GET a page
 */
router.get('/:slug', function (req, res) {

    var slug = req.params.slug;

    Page.findOne({slug: slug}, function (err, page) {
        if (err)
            console.log(err);

        if (!page) {
            res.redirect('/');
        } else {
            res.render('index', {
                title: page.title,
                content: page.content
            });
        }
    });


});

// Exports
module.exports = router;


