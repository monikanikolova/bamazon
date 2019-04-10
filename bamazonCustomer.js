var inquirer = require("inquirer");
var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    displayItems();
    collectInfo();
});

function displayItems() {
    connection.query("SELECT item_id, product_name, department_name, price FROM products", function (err, res) {
        if (err) throw err;
        for (var key in res) {
            if (res.hasOwnProperty(key)) {
                var element = res[key];
                console.log(element);
            }
        }
    });
}

function collectInfo(params) {
    inquirer.
        prompt([
            {
                type: "input",
                message: "What is the id of the product you like to buy?",
                name: "productId"
            }, {
                type: "input",
                message: "How many units of the product would you like to buy?",
                name: "unitsDesired"
            },
        ]).then((inquirerResponse) => {
            updateItem(inquirerResponse);
        });
}

function updateItem(params) {
    var stockQuantity = connection.query(`UPDATE products SET stock_quantity = stock_quantity - ${params.unitsDesired} WHERE item_id = ${params.productId} and stock_quantity > ${params.unitsDesired}`, function (err, res) {
        if (err) throw err;
        if (res.changedRows === 0) {
            console.log("Insufficient quantity!");
            return;
        }
        console.log(`Success! Your shipment is on the way!`);
        calculateTotalPrice(params);
    });
}

function calculateTotalPrice(params) {
    var calculatedPrice = connection.query(`SELECT price FROM products WHERE item_id = ${params.productId}`, function (err, res) {
        if (err) throw err;
        var totalPrice = res[0].price * params.unitsDesired;
        console.log(`Your total amount is ${totalPrice}`);

    })
};
