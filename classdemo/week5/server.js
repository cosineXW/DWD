const express = require("express");
const nedb = require("@seald-io/nedb"); // 放在开头更规范
const app = express(); // 统一用 app

let database = new nedb({ filename: "data.db", autoload: true });

app.use(express.static("assets"));
app.use(express.urlencoded({ extended: true }));

app.get("/create", (req, res) => {
    res.sendFile("/index.html", { root: __dirname + "/assets" }); 
});

app.post("/sign", (req, res) => {
    let newMessage = {
        guest: req.body.guestname,
        post: req.body.message,
        likes: 0,
        dislikes: 0
    };


app.listen(3000, function () {
    console.log("Server is running on port 3000");
});