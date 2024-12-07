/*********************************************************************************

WEB322 – Assignment 05
I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Kazi Meherab hossain 
Student ID: 118640234 
Date: 06 Dec 2024
Cyclic Web App URL: https://auspicious-young-sodium.glitch.me
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

app.use(express.urlencoded({ extended: true }));

/* ROUTES */

// Redirect '/' to '/about'
app.get('/', (req, res) => res.redirect('/about'));

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
app.get('/items', (req, res) => {
    if (req.query.category) {
      storeService.getItemsByCategory(req.query.category)
            .then((data) => {
                if (data.length > 0) {
                    res.render('items', { 
                        items: data,
                        activeRoute: app.locals.activeRoute,
                        message: ""
                    });
                }
                else {
                    res.render('items', { message: "no results found" });
                }
            })
            .catch((reason) => {
                console.log(reason);
                res.render('items', { 
                    message: "Item not found"
                });
            })
    }
    else if (req.query.minDate) {
        storeService.getItemsByMinDate(req.query.minDate)
            .then((data) => {
                if (data.length > 0) {
                    res.render('items', { 
                        items: data,
                        activeRoute: app.locals.activeRoute,
                        message: ""
                    });
                }
                else {
                    res.render('items', { message: "no results found" });
                }
            })
            .catch((reason) => {
                console.log(reason);
                res.render('items', { 
                    message: "Item not found"
                });
            })
    }
    else {
        storeService.getAllItems()
            .then((data) => {
                if (data.length > 0) {
                    res.render('items', { 
                        items: data,
                        activeRoute: app.locals.activeRoute,
                        message: ""
                    });
                }
                else {
                    res.render('items', { message: "no results found" });
                }
            })
            .catch((reason) => {
                console.log(reason);
                res.render('items', { 
                    message: "Item not found"
                });
            })
    }
});


app.get('/items/add', (req, res) => {
    storeService.getCategories()
        .then((data) => {
            res.render('addItem', {
                categories: data,
                activeRoute: app.locals.activeRoute
            });
        })
        .catch((err) => {
            res.render('addItem', {
                categories: [],
                activeRoute: app.locals.activeRoute
            });
        });
});

app.get('/items/delete/:id', (req, res) => {
    storeService.deleteItemByID(req.params.id)
        .then((data) => {
            res.redirect('/items');
        })
        .catch((reason) => {
            res.status(500).send(reason);
        })
});

app.get('/items/:id', (req, res) => {
    storeService.getItemsById(req.params.id)
        .then((data) => {
            if (data.length > 0){
                res.render('items', { 
                    items: data,
                    activeRoute: app.locals.activeRoute,
                    message: ""
                });
            }
            else {
                res.render('items', { message: "no results found" });
            }
        })
        .catch((reason) => {
            console.log(reason);
            res.render('items', { 
                message: "Item not found"
            });
        })
})

app.get('/categories/add', (req, res) => {
    res.render('addCategory', {
        activeRoute: app.locals.activeRoute
    })
})

app.post('/categories/add', (req, res) => {
    storeService.addCategory(req.body)
        .then((data) => {
            res.redirect('/categories');
        })
        .catch((reason) => {
            res.status(500).send("Unable to read the item");
        });
});

app.get('/categories', (req, res) => {
    storeService.getCategories()
            .then((data) => {
                if (data.length > 0) {
                    res.render('categories', { 
                        categories: data,
                        activeRoute: app.locals.activeRoute,
                        message: ""
                    });
                }
                else {
                    res.render('categories', { message: "no results found" });
                }
            })
            .catch((reason) => {
                console.log(reason);
                res.render('categories', { 
                    message: "Category not found"
                });
            })
});

app.get('/categories/delete/:id', (req, res) => {
    storeService.deleteCategoryByID(req.params.id)
        .then((data) => {
            res.redirect('/categories');
        })
        .catch((reason) => {
                res.status(500).send(reason);
        })
});

app.post('/items/add', upload.single("featureImage"), (req, res) => {
    if(req.file){
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );

                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }

        upload(req).then((uploaded)=>{
            processItem(uploaded.url);
        });
    }
    else {
        processItem("");
    }
    
    function processItem(imageUrl){
        req.body.featureImage = imageUrl;

        // TODO: Process the req.body and add it as a new Item before redirecting to /items
        storeService.addItem(req.body)
            .then((data) => {
                res.redirect('/items');
            })
            .catch((reason) => {
                res.status(500).send("Unable to read the item");
            });
    }
});

app.use((req, res) => {
    res.status(404).send('404: Page Not Found');
});

storeService.initialize()
    .then((data) => {
        console.log(data);
        app.listen(HTTP_PORT, ()=> {
            console.log(`Express http server listening on ${HTTP_PORT}`);
        });
    })
    .catch((reason) => {
        console.log(reason);
    });
// Listen on this port