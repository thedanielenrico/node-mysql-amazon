var inquirer = require("inquirer");
var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazonDB"
});

connection.connect(function (err) {
    if (err) throw err;
    // console.log("connected as id " + connection.threadId);
    connection.query("SELECT * FROM products", function (err, data) {
        if (err) throw err;
        // console.log(data)
    });
});


connection.query("SELECT * FROM products", function (err, data) {
    if (err) throw err;
    // console.log(data)
    inquirer.prompt([
        {
            type: "list",
            message: "Which product you would like to purchase?",
            choices: function () {
                var choicesArray = [];
                for (var i = 0; i < data.length; i++) {
                    choicesArray.push(data[i].product_name);
                }
                return choicesArray;
            },
            name: "selectedItem",
        },
        {
            type: "input",
            message: "How many units would you like to buy?",
            name: "quantity"
        }
    ]).then(answers => {
        var chosenItem;
        var stock_quantity;
        var purchaseAmount = answers.quantity;
        for (var i = 0; i < data.length; i++) {
            if (data[i].product_name == answers.selectedItem) {
                chosenItem = data[i];
                stock_quantity = data[i].stock_quantity;
            }
        }
        if (stock_quantity <= 0) {
            console.log("Insufficient quantity!")
            connection.end();
        } else {
            updateStock(purchaseAmount, stock_quantity, chosenItem);
        }
    })
})

function updateStock(purchaseAmount, stock_quantity, chosenItem) {
    var newAmount = Number(stock_quantity) - Number(purchaseAmount);
    connection.query("UPDATE products SET ? WHERE ?",
        [{ stock_quantity: newAmount }, { id: chosenItem.id }],
        function (err) {
            if (err) throw err;
            console.log("You just update an item");
            console.log(stock_quantity)
        })
    connection.end();
}