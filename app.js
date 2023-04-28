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

app.get("/term-of-service", function (req, res) {
    res.sendFile(__dirname + "/public/index.html");
});
app.get("/privacy-policy", function (req, res) {
    res.sendFile(__dirname + "/public/index.html");
});

app.get("/login", (req, res) => {
    const csrfState = Math.random().toString(36).substring(2);
    res.cookie("csrfState", csrfState, { maxAge: 60000 });

    let url = "https://www.tiktok.com/auth/authorize/";

    url += `?client_key=${CLIENT_KEY}`;
    url += "&scope=user.info.basic";
    url += "&response_type=code";
    url += `&redirect_uri=${encodeURIComponent(SERVER_ENDPOINT_REDIRECT)}`;
    url += "&state=" + csrfState;
    await res = res.redirect(url);
    const axios = require('axios');
    const res = await axios.get('http://localhost:3000/show')
});

app.get('/show', (req, res) => {
    const { code, state } = req.query;
    const { csrfState } = req.cookies;

    if (state !== csrfState) {
        res.status(422).send('Invalid state');
        return;
    }
    CLIENT_KEY = 'awahrdz5tzywmmd2'
    CLIENT_SECRET = 'b6709fd6a9d6a7abfb08659d0e1c267c'
    let url_access_token = 'https://open-api.tiktok.com/oauth/access_token/';
    url_access_token += '?client_key=' + CLIENT_KEY;
    url_access_token += '&client_secret=' + CLIENT_SECRET;
    url_access_token += '&code=' + code;
    url_access_token += '&grant_type=authorization_code';

    fetch(url_access_token, { method: 'post' })
        .then(res => res.json())
        .then(json => {
            res.send(json);
        });

})

app.get('/refresh_token/', (req, res) => {
    const refresh_token = req.query.refresh_token;

    let url_refresh_token = 'https://open-api.tiktok.com/oauth/refresh_token/';
    url_refresh_token += '?client_key=' + CLIENT_KEY;
    url_refresh_token += '&grant_type=refresh_token';
    url_refresh_token += '&refresh_token=' + refresh_token;

    fetch(url_refresh_token, { method: 'post' })
        .then(res => res.json())
        .then(json => {
            res.send(json);
        });
})

app.get('/logout', (req, res) => {
    const { open_id, access_token } = req.query;

    let url_revoke = 'https://open-api.tiktok.com/oauth/revoke/';
    url_revoke += '?open_id=' + open_id;
    url_revoke += '&access_token=' + access_token;

    fetch(url_revoke, { method: 'post' })
        .then(res => res.json())
        .then(json => {
            res.send(json);
        });
})