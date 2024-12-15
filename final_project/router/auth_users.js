const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
    return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if the username exists and is valid
    if (!isValid(username)) {
        return res.status(401).json({ message: "Invalid username" });
    }

    // Check if the username and password are authenticated
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate a JWT for the session
    const token = jwt.sign({ username }, "fingerprint_customer", { expiresIn: "1h" });

    // Save the token in the session
    req.session.token = token;

    return res.status(200).json({ message: "Login successful", token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    console.log("Request Headers: ", req.headers);

    // Extract token from Authorization header
    let token;
    if (req.headers.authorization) {
        const parts = req.headers.authorization.split(" ");
        if (parts.length === 2 && parts[0] === "Bearer") {
            token = parts[1]; // Extract the token
        }
    }

    console.log("Extracted Token: ", token);

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // Verify the token
    jwt.verify(token, "fingerprint_customer", (err, decoded) => {
        if (err) {
            console.error("JWT Verification Error: ", err.message);
            return res.status(403).json({ message: "Forbidden: Invalid or expired token" });
        }

        console.log("Decoded JWT: ", decoded);

        const username = decoded.username;
        const { isbn } = req.params;
        const { review } = req.query;

        const book = books[isbn];
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (!review) {
            return res.status(400).json({ message: "Review content is required" });
        }

        if (!book.reviews) {
            book.reviews = {};
        }
        book.reviews[username] = review;

        return res.status(200).json({
            message: "Review added/updated successfully",
            reviews: book.reviews,
        });
    });
});

//delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    console.log("Inside DELETE /auth/review/:isbn route");

    const { isbn } = req.params;

    // Retrieve the username from the decoded JWT token
    const username = req.user.username;

    // Find the book by ISBN
    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Check if the review exists for the user
    if (!book.reviews || !book.reviews[username]) {
        return res.status(404).json({ message: "Review not found for the user" });
    }

    // Delete the review
    delete book.reviews[username];

    return res.status(200).json({
        message: "Review deleted successfully",
        reviews: book.reviews,
    });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
