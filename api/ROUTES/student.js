const express = require("express");
const router = express.Router();
const mongoose = require("mongoose"); 
const Student = require("../MODELS/student");

// 1. Add student with Level
router.post("/", async (req, res) => {
  try {
    const { name, level } = req.body;
    // CRITICAL: Ensure level is actually sent
    const student = new Student({ name, level: level || "Sec 1" }); 
    await student.save();
    res.json(student);
  } catch (err) { 
    console.error("ADD ERROR:", err);
    res.status(400).json({ error: "Could not add student" }); 
  }
});

// 2. List all students (Sorted by Level then Name)
router.get("/", async (req, res) => {
  try {
    const students = await Student.find().sort({ level: 1, name: 1 });
    res.json(students);
  } catch (err) { res.status(500).json(err); }
});

// 3. Mark Present (+1)
router.post("/:id/present", async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, { $inc: { attendance: 1 } }, { new: true });
  res.json(student);
});

// 4. Mark Absent (+1)
router.post("/:id/absent", async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, { $inc: { absences: 1 } }, { new: true });
  res.json(student);
});

// 5. Add Payment (EGP) - Fixed to ensure amount is a number
router.post("/:id/pay", async (req, res) => {
  const amount = Number(req.body.amount) || 0;
  const student = await Student.findByIdAndUpdate(req.params.id, { $inc: { payments: amount } }, { new: true });
  res.json(student);
});

// 6. Stats for Dashboard
router.get("/stats/all", async (req, res) => {
  try {
    const students = await Student.find();
    const totalMoney = students.reduce((a, s) => a + (Number(s.payments) || 0), 0);
    const totalAttendance = students.reduce((a, s) => a + (Number(s.attendance) || 0), 0);
    const totalAbsences = students.reduce((a, s) => a + (Number(s.absences) || 0), 0);
    res.json({ totalMoney, totalAttendance, totalAbsences });
  } catch (err) { res.status(500).json(err); }
});

// 7. Delete student
router.delete("/:id", async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// 8. Update Grade
router.post("/:id/grade", async (req, res) => {
  try {
    const gradeValue = Number(req.body.grade) || 0;
    const student = await Student.findByIdAndUpdate(
      req.params.id, 
      { grade: gradeValue }, 
      { new: true }
    );
    res.json(student);
  } catch (err) {
    res.status(400).json({ error: "Grade update failed" });
  }
});

module.exports = router;