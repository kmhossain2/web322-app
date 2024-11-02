const fs = require('fs');
const path = require('path');

let itemsArray = [];
let categoriesArray = [];
module.exports = {
    initialize,
    getAllItems,
    getPublishedItems,
    getCategories,
    getItemsByCategory,
    getItemsByMinDate,
    getItemsById,
    addItem
};


function initialize() {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/items.json', 'utf8', (err, fileData) => {
            if (err) {
                reject("Failed to initialize items");
                return;
            }
            try {
                itemsArray = JSON.parse(fileData);
            }
            catch (parseError) {
                reject('initialize process rejected: ' + parseError);
                return;
            }
            fs.readFile('./data/categories.json', 'utf8', (err, fileData) => {
                if (err) {
                    reject("Failed to initialize categories");
                    return;
                };
                try {
                    categoriesArray = JSON.parse(fileData);
                }
                catch (parseError) {
                    reject('initialize process rejected: ' + parseError);
                    return;
                }
                resolve('initialized');
            });
        });
    });
}

function getAllItems() {
    return new Promise((resolve, reject) => {
        if (itemsArray.length > 0) {
            resolve(itemsArray);
        }
        else {
            reject('No results returned');
        }
    });
}

function getItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        const categoryItems = itemsArray.filter((item) => item.category == category);
        if (categoryItems.length > 0) {
            resolve(categoryItems);
        }
        else {
            reject('No results returned');
        }
    });
}

function getItemsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
        const dateItems = [];
        for (const item in itemsArray) {
            if (new Date(item.postDate) >= new Date(minDateStr)) {
                dateItems.push(item);
            }
        }
        if (dateItems.length > 0) {
            resolve(categoryItems);
        }
        else {
            reject('No results returned');
        }
    });
}
function getItemsById(id) {
    return new Promise((resolve, reject) => {
        const idItems = itemsArray.filter((item) => item.id == id);
        if (idItems.length > 0) {
            resolve(idItems);
        }
        else {
            reject('No results returned');
        }
    });
}

function getPublishedItems() {
    return new Promise((resolve, reject) => {
        if (itemsArray.length > 0) {
            let publishedItems = itemsArray.filter((element) => element.published === true);
            resolve(publishedItems);
        }
        else {
            reject('No results returned');
        }
    })
}

function getCategories() {
    return new Promise((resolve, reject) => {
        if (categoriesArray.length > 0) {
            resolve(categoriesArray);
        }
        else {
            reject('No results returned');
        }
    });
}

function addItem(itemData) {
    return new Promise((resolve, reject) => {
        try {
            itemData.published = itemData.published !== undefined;
            itemData.id = itemsArray.length + 1;
            itemsArray.push(itemData);
            resolve(itemData);
        }
        catch {
            reject('Failed to add item');
        }
    });
}
