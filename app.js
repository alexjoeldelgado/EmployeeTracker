const functions = require("./functions");
const connection = require("./connection");

connection.connect( err => {
    if (err) {
      console.error("Could not connect due to: " + err.stack);
      return;
    }
    console.log("Connected at ID: " + connection.threadId);
    functions.start();
});