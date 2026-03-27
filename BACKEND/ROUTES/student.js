const express = require("express");
const router = express.Router();
const Student = require("../MODELS/student");

// 1. Add student
router.post("/", async (req, res) => {
  try {
    const student = new Student({ name: req.body.name });
    await student.save();
    res.json(student);
  } catch (err) {
    res.status(400).json({ error: "Could not add student" });
  }
});

// 2. List all students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 3. Mark attendance (+1)
router.post("/:id/present", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });
    
    student.attendance++;
    await student.save();
    res.json(student);
  } catch (err) {
    res.status(400).json({ error: "Update failed" });
  }
});

// 4. Add payment
router.post("/:id/pay", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });

    student.payments += (req.body.amount || 0);
    await student.save();
    res.json(student);
  } catch (err) {
    res.status(400).json({ error: "Payment failed" });
  }
});

// 5. Delete student (Matches the ✕ button in your index.html)
router.delete("/:id", async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Student removed" });
  } catch (err) {
    res.status(400).json({ error: "Delete failed" });
  }
});

// 6. Stats for Dashboard
router.get("/stats/all", async (req, res) => {
  try {
    const students = await Student.find();
    const totalMoney = students.reduce((a, s) => a + (s.payments || 0), 0);
    const totalAttendance = students.reduce((a, s) => a + (s.attendance || 0), 0);
    res.json({ totalMoney, totalAttendance });
  } catch (err) {
    res.status(500).json({ error: "Stats calculation failed" });
  }
});
// 7 DANGER: Delete all students
router.delete("/all/danger", async (req, res) => {
  try {
    await Student.deleteMany({});
    res.json({ message: "Database cleared" });
  } catch (err) {
    res.status(500).json({ error: "Clear failed" });
  }
});

module.exports = router;