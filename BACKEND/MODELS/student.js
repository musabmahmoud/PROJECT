const express = require("express");
const router = express.Router();
const Student = require("../MODELS/student");

// 1. Get all students (for the table)
router.get("/", async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

// 2. Mark Attendance (+1)
router.post("/:id/present", async (req, res) => {
  try {
    const student = await Student.findById(req.id || req.params.id);
    student.attendance += 1;
    await student.save();
    res.json({ message: "Attendance updated" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 3. Add Payment
router.post("/:id/pay", async (req, res) => {
  try {
    const { amount } = req.body;
    const student = await Student.findById(req.params.id);
    student.payments += amount;
    await student.save();
    res.json({ message: "Payment added" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 4. Get Stats for the Dashboard Cards
router.get("/stats/all", async (req, res) => {
  const students = await Student.find();
  const totalMoney = students.reduce((sum, s) => sum + s.payments, 0);
  const totalAttendance = students.reduce((sum, s) => sum + s.attendance, 0);
  res.json({ totalMoney, totalAttendance });
});

module.exports = router;