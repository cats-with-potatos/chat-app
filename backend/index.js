const express = require("express")
, app = express()
, routes = require("./routes.js");


app.get("/getAllMessages", routes.getAllMessages);
app.get("/getChannelMessages", routes.getChannelMessages);
app.post("/login", routes.login);

app.listen(8888);
