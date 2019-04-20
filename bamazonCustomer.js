var inquirer = require("inquirer");
var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "localhost",

    port: 3306,

    user: "root",

    password: "",

    database: "bamazon"
});

connection.connect((err) => {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    displayItems();
    collectInfo();
});



function collectInfo() {
    inquirer.
        prompt([
            {
                type: "input",
                message: "What is the id of the product you like to buy?",
                name: "productId",
                validate: (value) => {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            }, {
                type: "input",
                message: "How many units of the product would you like to buy?",
                name: "unitsDesired",
                validate: (value) => {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            },
        ]).then((inquirerResponse) => {
            updateItem(inquirerResponse);
        });
};
function displayItems() {
    connection.query("SELECT item_id, product_name, department_name, price FROM products", (err, res) => {
        if (err) throw err;
        res.forEach((item) => {
            console.log(`
  ID: ${item.item_id}
  Product: ${item.product_name}
  Department: ${item.department_name}
  Price:   ${item.price}

  `)
        });
    });
};

function updateItem(params) {
    var stockQuantity = connection.query(`UPDATE products SET stock_quantity = stock_quantity - ${params.unitsDesired} WHERE item_id = ${params.productId} and stock_quantity > ${params.unitsDesired}`, (err, res) => {
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
    var calculatedPrice = connection.query(`SELECT price FROM products WHERE item_id = ${params.productId}`, (err, res) => {
        if (err) throw err;
        var totalPrice = res[0].price * params.unitsDesired;
        console.log(`Your total amount is $${totalPrice}!`);
    })
};
