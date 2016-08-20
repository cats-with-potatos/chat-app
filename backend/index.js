const express = require("express")
, bodyParser = require("body-parser")
, routes = require("./routes.js")
, app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get("/getAllMessages", routes.getAllMessages);
app.get("/getChannelMessages", routes.getChannelMessages);
app.post("/signin", routes.signin);
app.post("/signup", routes.signup);

app.listen(8888);
