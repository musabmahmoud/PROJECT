const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const studentRoutes = require("./ROUTES/student");
const authRoutes = require("./ROUTES/auth");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb+srv://Musab:Musab2008!@cluster0.47y03jt.mongodb.net/",)
.then(() => console.log('Connected to MongoDB!'))
  .catch(err => console.error('Could not connect to MongoDB', err));

app.use("/students", studentRoutes);
app.use("/auth", authRoutes);

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
module.exports = app;