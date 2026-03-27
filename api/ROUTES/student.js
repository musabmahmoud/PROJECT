const express = require("express");
const router = express.Router();
const Student = require("../MODELS/student");

// 1. Add student with Level
router.post("/", async (req, res) => {
  try {
    const { name, level } = req.body;
    const student = new Student({ name, level: level || "Sec 1" }); 
    await student.save();
    res.json(student);
  } catch (err) { 
    res.status(400).json({ error: "Could not add student" }); 
  }
});

// 2. List all students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find().sort({ level: 1, name: 1 });
    res.json(students);
  } catch (err) { res.status(500).json(err); }
});

// 3. Mark Present
router.post("/:id/present", async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, { $inc: { attendance: 1 } }, { new: true });
  res.json(student);
});

// 4. Mark Absent
router.post("/:id/absent", async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, { $inc: { absences: 1 } }, { new: true });
  res.json(student);
});

// 5. Add Payment
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

// 7. Delete individual student
router.delete("/:id", async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// 8. Update Individual Grade
router.post("/:id/grade", async (req, res) => {
  try {
    const gradeValue = Number(req.body.grade) || 0;
    const student = await Student.findByIdAndUpdate(req.params.id, { grade: gradeValue }, { new: true });
    res.json(student);
  } catch (err) { res.status(400).json({ error: "Grade update failed" }); }
});

// --- NEW MODERN FEATURES ---

// 9. BULK UPDATE GRADE (Update whole level at once)
// Expected Body: { level: "Sec 2", grade: 85 }
router.patch("/bulk/grade", async (req, res) => {
  try {
    const { level, grade } = req.body;
    const result = await Student.updateMany(
      { level: level }, 
      { $set: { grade: Number(grade) || 0 } }
    );
    res.json({ message: `Updated ${result.modifiedCount} students in ${level}`, count: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: "Bulk update failed" });
  }
});

// 10. BULK DELETE LEVEL (Delete all students in a level)
// URL Example: /api/students/bulk/delete?level=Sec 2
router.delete("/bulk/delete", async (req, res) => {
  try {
    const { level } = req.query;
    if (!level) return res.status(400).json({ error: "Level is required" });
    
    const result = await Student.deleteMany({ level: level });
    res.json({ message: `Deleted ${result.deletedCount} students from ${level}` });
  } catch (err) {
    res.status(500).json({ error: "Bulk delete failed" });
  }
});

module.exports = router;