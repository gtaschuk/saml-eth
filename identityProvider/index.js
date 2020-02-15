require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const routes = require("./routes");
const http = require("http");
const bodyParser = require("body-parser");

const allowedOrigins = ["http://localhost:3000", "http://localhost"];

const corsOptions = {
  origin: function(origin, callback) {
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg =
        "The CORS policy for this site does not " +
        "allow access from the specified Origin." +
        origin;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
};

app.use(cors(corsOptions));

app.options("*", cors(corsOptions));

app.use(express.static(path.join(__dirname, "build")));
//app.use(require("cookie-parser")());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//configureAuth(app);
app.use("/", routes);

const port = process.env.PORT || "8080";
app.set("port", port);

const server = http.createServer(app);
server.listen(port, () =>
  console.log("Express server listening on port " + server.address().port)
);
server.on("listening", () =>
  console.log(`Listening on port ${server.address()}`)
);
