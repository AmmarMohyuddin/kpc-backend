require("dotenv").config();
const express = require("express");
const dbConnection = require("./db/Connection");
const routes = require("./routes/api/v1");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;

app.use(morgan("tiny"));
app.use(cors("*"));

app.use(
  express.json({ limit: "100mb", extended: true, parameterLimit: 100000 })
);
app.use(
  express.urlencoded({ limit: "100mb", extended: true, parameterLimit: 100000 })
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Server is working");
});

app.use("/api/v1", routes);

dbConnection()
  .then((result) => {
    if (result) {
      app.listen(port, () => {
        console.log(`Server is running on PORT ${port}`);
      });
    }
  })
  .catch(() => {
    console.error("Failed to connect with database");
    process.exit(1);
  });
