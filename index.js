// Constants
var PORT = 80;
const express = require("express");
const app = express();
// explicitly enable CORS!
var cors = require("cors");
var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));
app.listen(PORT);
const router = (global.router = express.Router());

// used for health check
app.get("/", function (req, res) {
  res.send("");
});

// notifications
app.use("/notifications/push", require("./notifications/push"));
app.use("/notifications/poll", require("./notifications/poll"));
app.use("/notifications/delete", require("./notifications/delete"));
//app.use("/notifications/seen", require("./notifications/seen"));
app.use(router);

console.log("Running on http://localhost:" + PORT);
