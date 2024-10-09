/*********************************************************************************

WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Kazi Meherab hossain 
Student ID: 118640234 
Date: 9th Oct 2024
Cyclic Web App URL: _______________________________________________________
GitHub Repository URL: https://github.com/NotSujanSharma/web322-app

********************************************************************************/

const express = require('express');
const storeService = require('./store-service');
const path = require('path');
const PORT = process.env.PORT || 8080;

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => res.redirect('/about'));

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/items', async (req, res) => {
    try {
        const items = await storeService.getAllItems();
        res.send(items);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.get('/categories', async (req, res) => {
    try {
        const categories = await storeService.getCategories();
        res.send(categories);
    } catch (err) {
        res.status(500).send(err);
    }
});


app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

storeService.initialize()
    .then(message => {
        console.log(message);
        app.listen(PORT, () => {
            console.log(`Application listening on PORT ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to initialize the service:', err);
    });
