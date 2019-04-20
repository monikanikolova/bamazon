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
    collectInfo();
});

function collectInfo(params) {
    inquirer.
        prompt([
            {
                type: "list",
                message: "Choose an action",
                choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"],
                name: "actions"
            }
        ]).then((user) => {
            switch (user.actions) {
                case "View Products for Sale":
                    viewProduct();
                    break;
                case "View Low Inventory":
                    lowInventory();
                    break;
                case "Add to Inventory":
                    addInventory();
                    break;
                case "Add New Product":
                    newProduct();
                    break;
                case "Exit":
                    endConnection();
                default:
            }

        });
}

function viewProduct() {
    connection.query(`SELECT item_id, product_name, price, stock_quantity FROM products`, function (err, res) {
        if (err) throw err;
        res.forEach((item) => {
            console.log(`
  ID: ${item.item_id}
  Product: ${item.product_name}
  Price:   ${item.price}
  Stock: ${item.stock_quantity}

  `)
        });
        collectInfo();
    });
};

function lowInventory() {
    connection.query(`SELECT item_id, product_name, price, stock_quantity FROM products WHERE stock_quantity < 5`, (err, res) => {
        if (err) throw err;
        res.forEach((item) => {
            console.log(`
  ID:       ${item.item_id}
  Name:     ${item.product_name}
  Price:    ${item.price}
  Quantity: ${item.stock_quantity}

  `)
            collectInfo();
        });
    });
};

function addInventory() {
    connection.query(`SELECT * FROM products`, (err, res) => {
        res.forEach((item) => {
            console.log(`
  ID:      ${item.item_id}
  Name:    ${item.product_name}
  Price:   ${item.price}
  Quantity ${item.stock_quantity}
  
  `)
        });
        if (err) throw err;
        inquirer.prompt([
            {
                name: "add",
                type: "input",
                message: "What item would you like to change?",
                validate: (value) => {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            },
            {
                name: "quantity",
                type: "input",
                message: "How much would you like to add?",
                validate: (value) => {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            }
        ])
            .then((inquirerResponse) => {
                connection.query(`UPDATE products SET ? WHERE item_id = ${inquirerResponse.add}`,
                    [
                        {
                            stock_quantity: parseInt(res[inquirerResponse.add - 1].stock_quantity) + parseInt(inquirerResponse.quantity)
                        },
                    ]);
                console.log("Inventory Added Successfully!")
                collectInfo();
            });
    })
};

function newProduct() {
    inquirer.prompt([
        {
            name: "name",
            type: "input",
            message: "Input new name"
        },
        {
            name: "deptartment",
            type: "input",
            message: "Input department"
        },
        {
            name: "price",
            type: "input",
            message: "Input price for new product",
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        },
        {
            name: "quantity",
            input: "input",
            message: "Input initial stock quantity",
            validate: (value) => {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }
    ])
        .then((inquirerResponse) => {
            connection.query(`INSERT INTO products (product_name, department_name, price, stock_quantity)
  VALUES("${inquirerResponse.name}", "${inquirerResponse.department}", ${inquirerResponse.price}, ${inquirerResponse.quantity})`,(err, res) => {
                    if (err) throw err;
                    console.log(`Yay! You've added ${inquirerResponse.quantity} units of ${inquirerResponse.name} with price $${inquirerResponse.price}!`)
                    collectInfo();
                });
        });
};

function endConnection() {
    connection.end();
};