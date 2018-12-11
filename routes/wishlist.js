var express = require('express');
var router = express.Router();
// Get Product model
var Product = require('../models/product');
var Wishlist = require('../models/wishlist');
/*
 * GET add product to wishlist
 */
router.get('/add/:product', function (req, res) {

    var title = req.params.product;
//    if (typeof req.session.wishlist == "undefined") {
//        req.session.wishlist = [];
//        var prod = [];
//        prod.push(title);
//        req.session.wishlist.push({
//            username: res.locals.user.username,
//            items: prod
//        });
//    } else {
//
//        var ifExists = req.session.wishlist.items.indexOf(title);
//        if (ifExists === -1) {
//            req.session.wishlist.items.push(title);
//        }
//
//    }
    Wishlist.findOne({username: res.locals.user.username}, function (err, list) {
        if (err)
            console.log(err);
        console.log(list);
        if (list === null)
        {
            var prod = [];
            prod.push(title);
            var wlist = new Wishlist({
                username: res.locals.user.username,
                items: prod
            });
            wlist.save();
            req.flash('success', 'Product added to wishlist');
            res.redirect('back');
            return;
        } else {
            var ifExists = list.items.indexOf(title);
            if (ifExists === -1) {
                Wishlist.findById(list._id, function (err, wlist) {
                    var prod = [];
                    wlist.items.forEach(function (e) {
                        prod.push(e);
                    });
                    prod.push(title);

                    wlist.items = prod
                    wlist.save(function (err) {
                        if (err)
                            console.log(err);
                    });
                    console.log(wlist);
                });
                req.flash('success', 'Product added to wishlist');
                res.redirect('back');
                return;

            } else {
                req.flash('error', 'Product already in wishlist');
                res.redirect('back');
                return;
            }


        }
    });
});

router.get('/remove/:product', function (req, res) {

    var title = req.params.product;
//    if (typeof req.session.wishlist == "undefined") {
//        req.session.wishlist = [];
//        var prod = [];
//        prod.push(title);
//        req.session.wishlist.push({
//            username: res.locals.user.username,
//            items: prod
//        });
//    } else {
//
//        var ifExists = req.session.wishlist.items.indexOf(title);
//        if (ifExists === -1) {
//            req.session.wishlist.items.push(title);
//        }
//
//    }
    Wishlist.findOne({username: res.locals.user.username}, function (err, list) {
        if (err)
            console.log(err);
        console.log(list);
        if (list === null)
        {
            req.flash('error', 'Product not in wishlist');
            res.redirect('back');
            return;
        } else {
            var ifExists = list.items.indexOf(title);
            if (ifExists === -1) {
                req.flash('error', 'Product not in wishlist');
                res.redirect('back');
                return;


            } else {
                Wishlist.findById(list._id, function (err, wlist) {
                    var prod = [];
                    wlist.items.forEach(function (e) {
                        prod.push(e);
                    });

                    prod.splice(ifExists, 1);

                    wlist.items = prod;
                    wlist.save(function (err) {
                        if (err)
                            console.log(err);
                    });
                    console.log(wlist);
                });
                req.flash('success', 'Product removed from wishlist');
                res.redirect('back');
                return;
            }


        }
    });
});



/*
 * GET wishlist page
 */
router.get('/products', function (req, res) {

    Wishlist.findOne({username: res.locals.user.username}, function (err, list) {

        if (list === null) {
            res.render('cat_products', {
                title: "wishlists",
                products: null
            });

        } else {
            Product.find({title: {$in: list.items}}, function (err, products) {
                if (err)
                    console.log(err);

                res.render('cat_products', {
                    title: "wishlists",
                    products: products
                });
            });
        }



    });

});
/*
 * GET update product
 */
router.get('/update/:product', function (req, res) {

    var slug = req.params.product;
    var cart = req.session.cart;
    var action = req.query.action;
    for (var i = 0; i < cart.length; i++) {
        if (cart[i].title == slug) {
            switch (action) {
                case "add":
                    if (cart[i].qty == 4) {
                        req.flash('error', 'Product quantity maximum is 4!');
                        res.redirect('back');
                        return;
                    }
                    cart[i].qty++;
                    break;
                case "remove":
                    cart[i].qty--;
                    if (cart[i].qty < 1)
                        cart.splice(i, 1);
                    break;
                case "clear":
                    cart.splice(i, 1);
                    if (cart.length == 0)
                        delete req.session.cart;
                    break;
                default:
                    console.log('update problem');
                    break;
            }
            break;
        }
    }

    req.flash('success', 'Cart updated!');
    res.redirect('/cart/checkout');
});
/*
 * GET clear cart
 */
router.get('/clear', function (req, res) {

    delete req.session.cart;
    req.flash('success', 'Cart cleared!');
    res.redirect('/cart/checkout');
});
/*
 * GET buy now
 */
router.get('/buynow', function (req, res) {
    var username = "";
    var productname = "";
    var quantity = 0;
    var price = 0;
    var image = "";
    var sub = 0;
    var total = 0;
    console.log(res.locals.user.username);
    if (req.isAuthenticated()) {
        username = res.locals.user.username;
        var cart = new Cart({
            username: username,
            isordered: true,
            status: "open"
        });
        req.session.cart.forEach(function (element) {
            console.log(element.title);
            productname = element.title;
            quantity = element.qty;
            price = element.price;
            image = element.image;
            total = 0;
            sub = parseFloat(quantity * price).toFixed(2)
            total += sub;
            cart.cartItems.push(
                    {
                        title: productname,
                        quantity: quantity,
                        price: total,
                        image: image
                    });
        });
    }
    cart.save();
    delete req.session.cart;
    req.flash('success', 'Order Placed!');
    res.redirect('/cart/checkout');
    //res.sendStatus(200);

});
// Exports
module.exports = router;


