/*********************************************************************************

WEB322 – Assignment 04
I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Kazi Meherab hossain 
Student ID: 118640234 
Date: 23 Nov 2024
Cyclic Web App URL: https://web322-app-1lw8.onrender.com
GitHub Repository URL: https://github.com/Zi64/web322-app.git

********************************************************************************/

const storeService = require('./store-service.js');

// Importing express module
const express = require('express');
const path = require('path');

// Importing Multer, Cloudinary, and Streamifier
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Cloudinary Config
cloudinary.config({
    cloud_name: 'ddeb7udt0',
    api_key: '895362541847285',
    api_secret: 'lLrGt5kEw0smtjYtxrhZ8MIQAD8',
    secure: true
});

const upload = multer(); // Multer without disk storage

// Creating express application
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// Set view engine to EJS
app.set('view engine', 'ejs');

// Static middleware
app.use(express.static('public'));

// Middleware to set activeRoute and category
app.use((req, res, next) => {
    const route = req.path.substring(1);
    app.locals.activeRoute = "/" + route.split('/')[0];
    app.locals.viewingCategory = req.query.category || null;
    next();
});

/* ROUTES */

// Redirect '/' to '/shop'
app.get('/', (req, res) => res.redirect('/shop'));

// About Page
app.get('/about', (req, res) => {
    res.render('about', { activeRoute: app.locals.activeRoute });
});

// Shop Page
app.get('/shop', async (req, res) => {
    const viewData = {};
    try {
        let items = req.query.category
            ? await storeService.getPublishedItemsByCategory(req.query.category)
            : await storeService.getPublishedItems();

        items.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate));
        viewData.items = items;
        viewData.item = items[0] || null;
    } catch {
        viewData.message = "no results";
    }

    try {
        viewData.categories = await storeService.getCategories();
    } catch {
        viewData.categoriesMessage = "no results";
    }

    res.render('shop', { data: viewData });
});

// Shop with ID
app.get('/shop/:id', async (req, res) => {
    const viewData = {};
    try {
        const items = req.query.category
            ? await storeService.getPublishedItemsByCategory(req.query.category)
            : await storeService.getPublishedItems();

        items.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate));
        viewData.items = items;
    } catch {
        viewData.message = "no results";
    }

    try {
        viewData.item = await storeService.getItemsById(req.params.id);
    } catch {
        viewData.message = "no results";
    }

    try {
        viewData.categories = await storeService.getCategories();
    } catch {
        viewData.categoriesMessage = "no results";
    }

    res.render('shop', { data: viewData });
});

// Items Page
app.get('/items', async (req, res) => {
    try {
        const items = req.query.category
            ? await storeService.getItemsByCategory(req.query.category)
            : req.query.minDate
            ? await storeService.getItemsByMinDate(req.query.minDate)
            : await storeService.getAllItems();

        res.render('items', { items, activeRoute: app.locals.activeRoute, message: "" });
    } catch {
        res.render('items', { message: "Item not found" });
    }
});

// Add Item Page
app.get('/items/add', (req, res) => res.sendFile(path.join(__dirname, "/views/addItem.html")));

// Item by ID
app.get('/items/:id', async (req, res) => {
    try {
        const items = await storeService.getItemsById(req.params.id);
        res.render('items', { items, activeRoute: app.locals.activeRoute, message: "" });
    } catch {
        res.render('items', { message: "Item not found" });
    }
});

// Categories Page
app.get('/categories', async (req, res) => {
    try {
        const categories = await storeService.getCategories();
        res.render('categories', { categories, activeRoute: app.locals.activeRoute, message: "" });
    } catch {
        res.render('categories', { message: "Category not found" });
    }
});

// Add Item Form Submission
app.post('/items/add', upload.single("featureImage"), async (req, res) => {
    try {
        if (req.file) {
            const uploaded = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream((error, result) => {
                    error ? reject(error) : resolve(result);
                });
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
            req.body.featureImage = uploaded.url;
        }

        await storeService.addItem(req.body);
        res.redirect('/items');
    } catch {
        res.status(500).send("Unable to process the item");
    }
});

// 404 Handler
app.use((req, res) => res.status(404).send('404: Page Not Found'));

// Initialize Service and Start Server
storeService.initialize()
    .then(() => app.listen(HTTP_PORT, () => console.log(`Server listening on port ${HTTP_PORT}`)))
    .catch(console.error);
