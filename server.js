require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const responseHandler = require("./src/middlewares/responseHandler");
const errorHandler = require("./src/middlewares/errorHandler");
const routes = require("./src/routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(responseHandler);

connectDB();

app.get("/", (req, res) => {
  res.json({ message: "Backend API" });
});

app.use(routes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});