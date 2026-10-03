require("dotenv").config();
const express = require("express");
const connectDB = require("./src/config/db");
const router = require("./src/routes/routes");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
connectDB();
app.use(
  cors({
    origin: "https://complaint-management-phi-three.vercel.app/",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use("/api", router);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
