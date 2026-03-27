const express = require("express");
const router = express.Router();
const Student = require("../MODELS/student");

// 1. Add student with Level
router.post("/", async (req, res) => {
  try {
    const { name, level } = req.body;
    const student = new Student({ name, level });
    await student.save();
    res.json(student);
  } catch (err) { res.status(400).json({ error: "Could not add student" }); }
});

// 2. List all students
router.get("/", async (req, res) => {
  const students = await Student.find().sort({ level: 1, name: 1 });
  res.json(students);
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

// 5. Add Payment (EGP)
router.post("/:id/pay", async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, { $inc: { payments: req.body.amount } }, { new: true });
  res.json(student);
});

// 6. Stats for Dashboard
router.get("/stats/all", async (req, res) => {
  const students = await Student.find();
  const totalMoney = students.reduce((a, s) => a + (s.payments || 0), 0);
  const totalAttendance = students.reduce((a, s) => a + (s.attendance || 0), 0);
  const totalAbsences = students.reduce((a, s) => a + (s.absences || 0), 0);
  res.json({ totalMoney, totalAttendance, totalAbsences });
});

// 7. Delete student
router.delete("/:id", async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

module.exports = router;