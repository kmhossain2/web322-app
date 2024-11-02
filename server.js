/*********************************************************************************

WEB322 – Assignment 03
I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Kazi Meherab hossain 
Student ID: 118640234 
Date: 01 Nov 2024
Cyclic Web App URL: https://web322-app-1lw8.onrender.com
GitHub Repository URL: https://github.com/Zi64/web322-app.git

********************************************************************************/

const express = require('express');
const storeService = require('./store-service');
const path = require('path');
const PORT = process.env.PORT || 8080;
const multer = require("multer");
const upload = multer(); // no { storage: storage } since we're not using disk storage

const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
    cloud_name: 'dac1wkphp',
    api_key: '329349396594184',
    api_secret: 'o2iQhBXuuOgARu8SHK66CmldwqA',
    secure: true
});

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => res.redirect('/about'));

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});
app.get('/shop', async (req, res) => {
    try {
        res.sendFile(path.join(__dirname, "/views/shop.html"));
        
        const data = await storeService.getPublishedItems();
        res.send(data);
    } catch (error) {
        console.error(error);
    }
});

app.get('/items', (req, res) => {
    res.sendFile(path.join(__dirname, "/views/items.html"));
    if (req.query.category) {
        storeService.getItemsByCategory(req.query.category)
            .then((data) => {
                res.send(data);
            })
            .catch((reason) => {
                console.log(reason);
            })
    }
    else if (req.query.minDate) {
        storeService.getItemsByMinDate(req.query.minDate)
            .then((data) => {
                res.send(data);
            })
            .catch((reason) => {
                console.log(reason);
            })
    }
    else {
        storeService.getAllItems()
            .then((data) => {
                res.send(data);
            })
            .catch((reason) => {
                console.log(reason);
            })
    }
});

app.get('/items/add', (req, res) => {
    res.sendFile(path.join(__dirname, "/views/addItem.html"));
});

app.get('/items/:id', (req, res) => {
    storeService.getItemsById(req.params.id)
        .then((data) => {
            res.send(data);
        })
        .catch((reason) => {
            console.log(reason);
        })
})

app.get('/categories', (req, res) => {
    res.sendFile(path.join(__dirname, "/views/categories.html"));
    storeService.getCategories()
        .then((data) => {
            res.send(data);
        })
        .catch((reason) => {
            console.log(response);
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
        app.listen(PORT, ()=> {
            console.log(`Express http server listening on ${PORT}`);
        });
    })
    .catch((reason) => {
        console.log(reason);
    });
