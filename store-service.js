const fs = require('fs').promises; 
let items = [];
let categories = [];

async function initialize() {
    try {
        const itemsData = await fs.readFile('./data/items.json', 'utf8');
        items = JSON.parse(itemsData);
    } catch (err) {
        throw new Error("Unable to read or parse items.json");
    }

    try {
        const categoriesData = await fs.readFile('./data/categories.json', 'utf8');
        categories = JSON.parse(categoriesData);
    } catch (err) {
        throw new Error("Unable to read or parse categories.json");
    }

    return "Data initialized successfully";
}

function getAllItems() {
    return new Promise((resolve, reject) => {
        items.length === 0 ? reject("No results returned") : resolve(items);
    });
}

function getPublishedItems() {
    return new Promise((resolve, reject) => {
        const publishedItems = items.filter(item => item.published);
        publishedItems.length === 0 ? reject("No results returned") : resolve(publishedItems);
    });
}

function getCategories() {
    return new Promise((resolve, reject) => {
        categories.length === 0 ? reject("No results returned") : resolve(categories);
    });
}

module.exports = {
    initialize,
    getAllItems,
    getPublishedItems,
    getCategories
};
