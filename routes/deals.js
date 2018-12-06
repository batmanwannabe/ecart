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

/*
 * GET all products
 */
router.get('/', function (req, res) {
//router.get('/', isUser, function (req, res) {

    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd
    }

    if (mm < 10) {
        mm = '0' + mm
    }

    today = mm + '/' + dd + '/' + yyyy;
    //var todaydealproducts= new Product
    Category.find({date: today}, function (err, deal) {
        console.log(err);
        Product.find({category: deal.categoryid}, function (err, products) {
            if (err)
                console.log(err);

            res.render('cat_products', {
                title: "deal.title",
                products: products
            });
        });
    });


});


/*
 * GET all deals
 */
router.get('/deals', function (req, res) {
//router.get('/', isUser, function (req, res) {

    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd
    }

    if (mm < 10) {
        mm = '0' + mm
    }

    today = '2018-12-01 00:00:00.000';
    //var todaydealproducts= new Product
    Deals.find({categoryid: "Books"}, function (err, deal) {
        console.log(deal.categoryid);
        Product.find({category: deal[0].categoryid}, function (err, products) {
            if (err)
                console.log(err);
            console.log(products);
            res.render('cat_products', {
                title: deal[0].title,
                products: products,
                deal: deal[0].title
            });
        });
    });

});

// Exports
module.exports = router;


