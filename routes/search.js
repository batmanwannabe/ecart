var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
var auth = require('../config/auth');
var isUser = auth.isUser;

// Get Product model
var Product = require('../models/product');

// Get Category model
var Category = require('../models/category');

/*
 * GET all products
 */
router.get('/query', function (req, res) {
//router.get('/', isUser, function (req, res) {

    var keyWord = req.query.q;
    
    Product.find({slug: new RegExp(keyWord, 'i')}, function(err,products){
        if(err)
            console.log(err);
        res.render('cat_products',{
            title: keyWord,
            products: products
        });
    });

});

// Exports
module.exports = router;


