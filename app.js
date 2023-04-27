const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const server = http.createServer(app);
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");

app.use(express.static(path.join(__dirname, "public")));


const port = process.env.port || 3000;
server.listen(port, () => {
    console.log(`server started on port ${port}`);
});
const SERVER_ENDPOINT_REDIRECT = process.env.SERVER_ENDPOINT_REDIRECT || "localhost:3000";
const CLIENT_KEY = "awahrdz5tzywmmd2";
app.get("/login", (req, res) => {
    const csrfState = Math.random().toString(36).substring(2);
    res.cookie("csrfState", csrfState, { maxAge: 60000 });

    let url = "https://www.tiktok.com/auth/authorize/";

    url += `?client_key=${CLIENT_KEY}`;
    url += "&scope=user.info.basic";
    url += "&response_type=code";
    url += `&redirect_uri=${encodeURIComponent(SERVER_ENDPOINT_REDIRECT)}`;
    url += "&state=" + csrfState;

    res.redirect(url);
});
