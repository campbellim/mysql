var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,  
    user: "root",
    password: "Niana3132!2018",
    database: "bamazon"
  });

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected to database. ID: " + connection.threadId + "\n");
    itemsForSale();
});//<-- end connection.connect

function itemsForSale() {
    connection.query("SELECT * FROM products", function(err, queryResponse) {
        if (err) throw err;
        console.log("---------------------------------------");
        console.log("All Available Products for Purchase:");
        console.log("---------------------------------------");
        for (var i = 0; i < queryResponse.length; i++) {
            console.log("Item ID #: " + queryResponse[i].item_id + " \nItem Name: " + queryResponse[i].product_name + " \nDepartment: " + queryResponse[i].department_name + " \nPrice: $" + parseFloat(queryResponse[i].price).toFixed(2) + " \nNumber of Units Remaining: " + queryResponse[i].stock_Quantity);
            console.log("-----------------------------------");
        }
    });
    placeOrder();
} //<-- end itemsForSale()

function placeOrder() {

    connection.query("SELECT * FROM products", function(err, queryResponse) {

        inquirer.prompt([
            {
                type: "input",
                message: "Enter the Item ID # of the item you would like to purchase:",
                name: "customerItemID",
                validate:function(value) {
                    if (isNaN(value) === false) {
                        return true;
                    } else {
                        return false;
                    }
                } 
            },
            {
                type: "input",
                message: "How many units would you like to purchase?",
                name: "customerQuantity",
                validate:function(value) {
                    if (isNaN(value) === false) {
                        return true;
                    } else {
                        return false;
                    }
                } 
            }
            
        ]).then(function(response) {
            console.log("---------------------------------------");
            console.log("Checking Our Stock...");
            console.log("---------------------------------------");

            var itemFound = false;

            for(i = 0; i < queryResponse.length; i++) {
                if (parseInt(response.customerItemID) === queryResponse[i].item_id) {
                    itemFound = true;
                    console.log("Requested Item Located");
                    console.log("---------------------------------------");

                    var itemSelect = queryResponse[i];

                    if (parseInt(response.customerQuantity) < itemSelect.stock_Quantity) {

                        console.log("Placing Your Order...");
                        console.log("---------------------------------------");

                        var customerPrice = parseFloat(itemSelect.price) * parseInt(response.customerQuantity);

                        connection.query("UPDATE products SET ? WHERE ?",
                            [
                                {
                                stock_Quantity: parseFloat(itemSelect.stock_Quantity) - parseFloat(response.customerQuantity),
                                price: parseFloat(itemSelect.price) + customerPrice,
                                },
                                {
                                item_id: itemSelect.item_id
                                }
                            ],
                            function(err, res) {
                                if(err) throw err;
                            }
                        );

                        console.log("Your Order Has Been Succesfully Placed!");
                        console.log("---------------------------------------");
                        console.log("Your Total Price is: $" + parseFloat(customerPrice).toFixed(2));
                        console.log("---------------------------------------");
                        anotherOrder();

                    } else {
                        console.log("Sorry, there is insufficient stock to place your order.");
                        console.log("---------------------------------------");
                        anotherOrder();
                    }

                }//<--- end if statement

            }//<-- end queryResponse For Loop

            if (itemFound === false) {
                console.log("Sorry, Unable to Locate Requested Item.");
                console.log("---------------------------------------");
                anotherOrder();
            }//<-- if requested item doesn't match an item_id in the database

        });//<-- end inquirer .then()

    });//<-- end connection.query

}//<-- end placeOrder()

function anotherOrder() {
    inquirer.prompt([
        {
            type: "list",
            message: "Would you like to place another order?",
            name: "anotherOrder",
            choices: ["Yes", "No"]
        }
    ]).then(function(response) {
        switch (response.anotherOrder) {
            case "Yes":
            itemsForSale();
            break;
        
            case "No":
            console.log("---------------------------------------");
            console.log("Come Again Soon!");
            console.log("---------------------------------------");
            connection.end();
            break;
        }
    });
}