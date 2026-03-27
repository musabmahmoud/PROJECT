const express = require("express");
const router = express.Router();
const Student = require("../MODELS/student");

// Add student
router.post("/", async (req, res) => {
  const student = new Student({ name: req.body.name });
  await student.save();
  res.json(student);
});

// List students
router.get("/", async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

// Mark present
router.post("/:id/present", async (req, res) => {
  const student = await Student.findById(req.params.id);
  student.attendance++;
  await student.save();
  res.json(student);
});

// Add payment
router.post("/:id/pay", async (req, res) => {
  const student = await Student.findById(req.params.id);
  student.payments += req.body.amount;
  await student.save();
  res.json(student);
});

// Stats
router.get("/stats/all", async (req, res) => {
  const students = await Student.find();
  const totalMoney = students.reduce((a, s) => a + s.payments, 0);
  const totalAttendance = students.reduce((a, s) => a + s.attendance, 0);
  res.json({ totalMoney, totalAttendance });
});

module.exports = router;