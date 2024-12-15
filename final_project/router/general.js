const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const userExists = users.some((user) => user.username === username);

    if (userExists) {
        return res.status(409).json({ message: "Username already exists" });
    }

    // Add new user
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
   res.status(200).send(JSON.stringify(books, null, 2));
});

// Get the list of books using Axios
public_users.get('/books-async', async (req, res) => {
    try {
        const bookList = await new Promise((resolve) => resolve(books));
        const formattedBooks = JSON.stringify(bookList, null, 2); 
        res.setHeader('Content-Type', 'application/json'); 
        res.status(200).send(formattedBooks);
    } catch (err) {
        res.status(500).json({ message: "Error retrieving books", error: err.message });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
   const { isbn } = req.params;

    const book = books[isbn];
    if (!book) {
        return res.status(404).send(JSON.stringify({ message: "Book not found" }, null, 2));
    }

    res.status(200).send(JSON.stringify(book, null, 2));
 });

 // Get book details based on ISBN using async-await
public_users.get('/isbn-async/:isbn', async (req, res) => {
    const { isbn } = req.params;

    try {
       
        const bookDetails = await new Promise((resolve, reject) => {
            const book = books[isbn];
            if (book) {
                resolve(book);
            } else {
                reject("Book not found");
            }
        });

        res.status(200).json(bookDetails); 
    } catch (err) {
        res.status(404).json({ message: err });
    }
});

  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const { author } = req.params;

    const booksByAuthor = Object.values(books).filter((book) => book.author === author);

    if (booksByAuthor.length === 0) {
        return res.status(404).send(JSON.stringify({ message: "No books found by this author" }, null, 2));
    }

    res.status(200).send(JSON.stringify(booksByAuthor, null, 2));
});

// Get book details based on author using async-await
public_users.get('/author-async/:author', async (req, res) => {
    const { author } = req.params;

    try {
        const booksByAuthor = await new Promise((resolve, reject) => {
            const filteredBooks = Object.values(books).filter((book) => book.author === author);
            if (filteredBooks.length > 0) {
                resolve(filteredBooks);
            } else {
                reject("No books found by this author");
            }
        });

        res.status(200).json(booksByAuthor); 
    } catch (err) {
        res.status(404).json({ message: err });
    }
});


// Get all books based on title
public_users.get('/title/:title',function (req, res) {
   const { title } = req.params;

    const booksByTitle = Object.values(books).filter((book) => book.title === title);

    if (booksByTitle.length === 0) {
        return res.status(404).send(JSON.stringify({ message: "No books found with this title" }, null, 2));
    }

    res.status(200).send(JSON.stringify(booksByTitle, null, 2));
});

// Get book details based on title using async-await
public_users.get('/title-async/:title', async (req, res) => {
    const { title } = req.params;

    try {
        const booksByTitle = await new Promise((resolve, reject) => {
            const filteredBooks = Object.values(books).filter((book) => book.title === title);
            if (filteredBooks.length > 0) {
                resolve(filteredBooks);
            } else {
                reject("No books found by this title");
            }
        });

        res.status(200).json(booksByTitle); 
    } catch (err) {
        res.status(404).json({ message: err });
    }
});


//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const { isbn } = req.params;

    const book = books[isbn];
    if (!book) {
        return res.status(404).send(JSON.stringify({ message: "Book not found" }, null, 2));
    }

    res.status(200).send(JSON.stringify(book.reviews || [], null, 2));
});

module.exports.general = public_users;
