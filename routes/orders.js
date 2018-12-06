var express = require('express');
var router = express.Router();

// Get Product model
var Product = require('../models/product');
var Cart = require('../models/cart');


/*
 * GET orders page
 */
router.get('/myorders', function (req, res) {

    Cart.find({username: res.locals.user.username, isordered: true}, function (err, orders) {
        if (err)
            console.log(err);
        console.log(orders);
        res.render('all_orders', {
            title: 'All orders',
            orders: orders
        });
    });
});
/*
 * GET cancel product
 */
router.get('/cancel/:order/:product', function (req, res) {

    Cart.findOne({_id: req.params.order}, function (err, order) {
        order.cartItems.forEach(function (item) {
            if (item.title == req.params.product) {
                item.status = "cancelled";
                order.save();
                req.flash('success', 'Order cancelled!');
                res.redirect('back');
                return;
            }
        });
    });
    

});

/*
 * GET return product
 */
router.get('/return/:order/:product', function (req, res) {

    Cart.findOne({_id: req.params.order}, function (err, order) {
        order.cartItems.forEach(function (item) {
            if (item.title == req.params.product) {
                item.status = "returned";
                order.save();
                req.flash('success', 'Order returned!');
                res.redirect('back');
                return;
            }
        })
    });;
    

});

/*
 * GET add review
 */
router.get('/addreview/:product', function (req, res) {

    var slug = req.params.product;

    Product.findOne({slug: slug}, function (err, p) {
        if (err)
            console.log(err);

        res.render('add_review', {
            title: 'Add Review',
            slug: slug
        });


    });

});

/*
 * Post add review
 */
router.post('/add-review', function (req, res) {

    var slug = req.body.slug;
    console.log(slug);

    req.checkBody('rating', 'Rating is required').notEmpty();
    //req.checkBody('rating', 'Rating is required').isNumber();

    req.checkBody('content', 'Review is required!').notEmpty();


    var errors = req.validationErrors();

    if (errors) {
        console.log(errors);
        req.flash('error', 'inputs does not meet requirements!');
        res.redirect('back');
    } else {
        var rating = req.body.rating;
        var content = req.body.content;

        Product.findOne({slug: slug}, function (err, p) {
            console.log(p);
            if (err)
                console.log(err);
            var review = [];
            review = p.review;
            review.push({
                rating: Number(rating),
                content: content,
                username: req.user.username
            });
            p.review = review;
            var sum = 0;
            review.forEach(function (e) {
                sum += e.rating;
            });
            if (sum != 0) {
                p.avgrating = sum / review.length;
            } else
                p.avgrating = 0;
            p.save();

            req.flash('success', 'review saved');
            res.redirect('myorders/');


        });
    }
});
/*
 * GET add product to cart
 */
router.get('/add/:product', function (req, res) {

    var slug = req.params.product;

    Product.findOne({slug: slug}, function (err, p) {
        if (err)
            console.log(err);

        if (typeof req.session.cart == "undefined") {
            req.session.cart = [];
            req.session.cart.push({
                title: slug,
                qty: 1,
                price: parseFloat(p.price).toFixed(2),
                image: '/product_images/' + p._id + '/' + p.image
            });
        } else {
            var cart = req.session.cart;
            var newItem = true;

            for (var i = 0; i < cart.length; i++) {
                if (cart[i].title == slug) {
                    cart[i].qty++;
                    newItem = false;
                    break;
                }
            }

            if (newItem) {
                cart.push({
                    title: slug,
                    qty: 1,
                    price: parseFloat(p.price).toFixed(2),
                    image: '/product_images/' + p._id + '/' + p.image
                });
            }
        }

//        console.log(req.session.cart);
        req.flash('success', 'Product added!');
        res.redirect('back');
    });

});

/*
 * GET checkout page
 */
router.get('/checkout', function (req, res) {

    var isLoggedIn = req.isAuthenticated() ? true : false;
    if (req.session.cart && req.session.cart.length == 0) {
        delete req.session.cart;
        res.redirect('/cart/checkout');
    } else {
        res.render('checkout', {
            title: 'Checkout',
            cart: req.session.cart,
            isLoggedIn: isLoggedIn
        });
    }

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
    console.log(res.locals.user.username);
    if (req.isAuthenticated()) {
        username = res.locals.user.username;
        var cart = new Cart({
            username: username,
            isordered: true
        });

        req.session.cart.forEach(function (element) {
            console.log(element.title);
            productname = element.title;
            quantity = element.qty;
            price = element.price;
            image = element.image;

            cart.cartItems.push(
                    {
                        title: productname,
                        quantity: quantity,
                        price: price,
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


