const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use((req, res, next) => {
    console.log("Request Headers: ", req.headers);
    next();
});

app.use("/customer/auth/*", function auth(req,res,next){
    let token = req.session?.token; // First check the session token
    console.log("Session Token: ", token);

    // If no session token, check the Authorization header
    if (!token && req.headers.authorization) {
        const parts = req.headers.authorization.split(" ");
        if (parts.length === 2 && parts[0] === "Bearer") {
            token = parts[1];
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

        req.user = decoded; // Attach decoded token payload to request
        next(); // Proceed to the next middleware or route
    });
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

// debugging write a review, token is reaching server
app.use("*", (req, res) => {
    console.log("Unhandled request:", req.method, req.originalUrl);
    res.status(404).json({ message: "Route not found" });
});

app.use((req, res, next) => {
    console.log("Incoming Request:");
    console.log("Method:", req.method);
    console.log("URL:", req.originalUrl);
    console.log("Headers:", req.headers);
    next();
});

app.listen(PORT,()=>console.log("Server is running"));
