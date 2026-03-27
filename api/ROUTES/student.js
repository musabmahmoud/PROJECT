const express = require("express");
const router = express.Router();
const Student = require("../MODELS/student");

// 1. Add student
router.post("/", async (req, res) => {
  try {
    const { name, level } = req.body;
    const student = new Student({ name, level: level || "Sec 1" }); 
    await student.save();
    res.json(student);
  } catch (err) { res.status(400).json({ error: "Could not add student" }); }
});

// 2. List all students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find().sort({ level: 1, name: 1 });
    res.json(students);
  } catch (err) { res.status(500).json(err); }
});

// 3. Mark Present / 4. Mark Absent / 5. Add Payment (Keep your existing routes here...)
router.post("/:id/present", async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, { $inc: { attendance: 1 } }, { new: true });
  res.json(student);
});

router.post("/:id/absent", async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, { $inc: { absences: 1 } }, { new: true });
  res.json(student);
});

router.post("/:id/pay", async (req, res) => {
  const amount = Number(req.body.amount) || 0;
  const student = await Student.findByIdAndUpdate(req.params.id, { $inc: { payments: amount } }, { new: true });
  res.json(student);
});

// 7. Delete individual student
router.delete("/:id", async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ error: "Delete failed" }); }
});

// 8. Update Individual Grade
router.post("/:id/grade", async (req, res) => {
  try {
    // Make sure we are grabbing 'grade' from the request body
    const gradeValue = Number(req.body.grade);
    
    if (isNaN(gradeValue)) {
      return res.status(400).json({ error: "Invalid grade number" });
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id, 
      { $set: { grade: gradeValue } }, // Use $set to be safe
      { new: true }
    );

    if (!student) return res.status(404).json({ error: "Student not found" });
    
    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Grade update failed" });
  }
});

// 9 Stats for Dashboard & Summary
router.get("/stats/all", async (req, res) => {
  try {
    const students = await Student.find();
    
    const totalMoney = students.reduce((a, s) => a + (Number(s.payments) || 0), 0);
    const totalAttendance = students.reduce((a, s) => a + (Number(s.attendance) || 0), 0);
    const totalAbsences = students.reduce((a, s) => a + (Number(s.absences) || 0), 0);
    
    // ADD THIS: Calculate Average Grade
    const studentsWithGrades = students.filter(s => s.grade !== undefined && s.grade !== null);
    const avgGrade = studentsWithGrades.length > 0 
      ? (studentsWithGrades.reduce((a, s) => a + s.grade, 0) / studentsWithGrades.length).toFixed(1)
      : 0;

    res.json({ 
      totalMoney, 
      totalAttendance, 
      totalAbsences,
      avgGrade // Send this to the frontend
    });
  } catch (err) { 
    res.status(500).json(err); 
  }
});
// 10. BULK UPDATE GRADE
router.patch("/bulk/grade", async (req, res) => {
  try {
    const { level, grade } = req.body;
    const result = await Student.updateMany({ level }, { $set: { grade: Number(grade) || 0 } });
    res.json({ message: `Updated ${result.modifiedCount} students`, count: result.modifiedCount });
  } catch (err) { res.status(500).json({ error: "Bulk update failed" }); }
});

// 11. BULK DELETE LEVEL
router.delete("/bulk/delete", async (req, res) => {
  try {
    const { level } = req.query;
    const result = await Student.deleteMany({ level });
    res.json({ message: `Deleted ${result.deletedCount} students` });
  } catch (err) { res.status(500).json({ error: "Bulk delete failed" }); }
});

module.exports = router;