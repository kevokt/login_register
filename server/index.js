const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const EmployeeModel = require("./models/Employee")

const jwt = require("jsonwebtoken");
const SECRET_KEY = "your_secret_key";

const app = express()
app.use(express.json())
app.use(cors())

mongoose.connect("mongodb://localhost:27017/userAuthTest")

app.post("/login", (req, res) => {
    const { email, password } = req.body
    EmployeeModel.findOne({ email: email })
        .then(user => {
            if (!user) return res.status(400).json("Data not found");
            if (user.password !== password) return res.status(400).json("Incorrect password");

            // Buat JWT token, kadaluarsa dalam 1 jam
            const token = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: "1h" });
            return res.json({ status: "Success", token });
        })
        .catch(err => res.status(500).json("Login error"))
})

function verifyToken(req, res, next) {
    const token = req.headers["authorization"];
    if (!token) return res.status(403).json("Token missing");

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json("Invalid or expired token");
        req.user = decoded;
        next();
    });
}

// Contoh proteksi route
app.get("/protected", verifyToken, (req, res) => {
    res.json("You are authenticated");
});

app.post("/register", (req, res) => {
    EmployeeModel.create(req.body)
        .then(employees => res.json(employees))
        .catch(err => res.json(err))
})

app.listen(3001, () => {
    console.log("Server is running on port http://localhost:3001/")
})