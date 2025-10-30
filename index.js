require("dotenv").config();
const express = require("express");
const dbConnection = require("./db/Connection");
const routes = require("./routes/api/v1");
const fs = require("fs");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;
const https = require("https");

app.use(morgan("tiny"));
app.use(cors("*"));

app.use(
  express.json({ limit: "100mb", extended: true, parameterLimit: 100000 })
);
app.use(
  express.urlencoded({ limit: "100mb", extended: true, parameterLimit: 100000 })
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const { ocicallback } = require("./controllers/api/v1/auth");

app.get("/", (req, res) => {
  res.send("Server is working");
});

// OCI Callback route at root level
app.get("/callback", ocicallback);

app.use("/api/v1", routes);

dbConnection()
  .then((result) => {
    if (result) {
      https
        .createServer(
          {
            key: fs.readFileSync("./cert/key.pem"),
            cert: fs.readFileSync("./cert/cert.pem"),
          },
          app
        )
        .listen(port, () => {
          console.log(`Server running at https://localhost:${port}`);
        });
      // app.listen(port, () => {
      //   console.log(`Server is running on PORT ${port}`);
      // });
    }
  })
  .catch((error) => {
    console.log(error);
    console.error("Failed to connect with database");
    process.exit(1);
  });

// https
//   .createServer(
//     {
//       key: fs.readFileSync("./cert/key.pem"),
//       cert: fs.readFileSync("./cert/cert.pem"),
//     },
//     app
//   )
//   .listen(PORT, () => {
//     console.log(`Server running at https://localhost:${PORT}`);
//   });
