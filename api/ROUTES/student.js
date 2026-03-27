const express = require("express");
const router = express.Router();
const Student = require("../MODELS/student");

// Helper to get current month string (e.g., "2026-03")
const getMonth = () => new Date().toISOString().slice(0, 7);

// 1. List Students (Filtered by Month)
router.get("/", async (req, res) => {
  try {
    const targetMonth = req.query.month || getMonth();
    const students = await Student.find().sort({ level: 1, name: 1 });

    // Map students to only show data for the selected month
    const formatted = students.map(s => {
      const rec = s.records.find(r => r.month === targetMonth) || { 
        payments: 0, attendance: 0, absences: 0, grade: 0 
      };
      return {
        _id: s._id,
        name: s.name,
        level: s.level,
        payments: rec.payments,
        attendance: rec.attendance,
        absences: rec.absences,
        grade: rec.grade
      };
    });
    res.json(formatted);
  } catch (err) { res.status(500).json(err); }
});

// 2. Add Student
router.post("/", async (req, res) => {
  try {
    const { name, level } = req.body;
    const student = new Student({ 
      name, 
      level: level || "Sec 1",
      records: [{ month: getMonth() }] 
    });
    await student.save();
    res.json(student);
  } catch (err) { res.status(400).json({ error: "Could not add student" }); }
});

// 3. Update Attendance (Present/Absent)
router.post("/:id/:type", async (req, res) => {
  const { id, type } = req.params;
  if (type !== 'present' && type !== 'absent') return res.status(400).json({error: "Invalid type"});
  
  const month = getMonth();
  const field = type === "present" ? "attendance" : "absences";

  try {
    let student = await Student.findOneAndUpdate(
      { _id: id, "records.month": month },
      { $inc: { [`records.$.${field}`]: 1 } },
      { new: true }
    );

    if (!student) {
      student = await Student.findByIdAndUpdate(id, 
        { $push: { records: { month, [field]: 1, payments: 0, attendance: 0, absences: 0, grade: 0 } } }, 
        { new: true }
      );
    }
    res.json(student);
  } catch (err) { res.status(500).json(err); }
});

// 4. Update Value (Grade/Payments)
router.post("/:id/update-value", async (req, res) => {
  const { id } = req.params;
  const { field, value } = req.body; // field is "grade" or "payments"
  const month = getMonth();

  try {
    let student = await Student.findOneAndUpdate(
      { _id: id, "records.month": month },
      { $set: { [`records.$.${field}`]: Number(value) } },
      { new: true }
    );

    if (!student) {
      student = await Student.findByIdAndUpdate(id, 
        { $push: { records: { month, [field]: Number(value), payments: 0, attendance: 0, absences: 0, grade: 0 } } }, 
        { new: true }
      );
    }
    res.json(student);
  } catch (err) { res.status(500).json(err); }
});

// 5. Delete Student
router.delete("/:id", async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ error: "Delete failed" }); }
});

// 6. Stats for Dashboard
router.get("/stats/all", async (req, res) => {
  try {
    const month = getMonth();
    const students = await Student.find();
    
    let totalMoney = 0, totalAtt = 0, totalAbs = 0, totalGrades = 0, gradedCount = 0;

    students.forEach(s => {
      const rec = s.records.find(r => r.month === month);
      if (rec) {
        totalMoney += (rec.payments || 0);
        totalAtt += (rec.attendance || 0);
        totalAbs += (rec.absences || 0);
        if (rec.grade > 0) {
          totalGrades += rec.grade;
          gradedCount++;
        }
      }
    });

    res.json({ 
      totalMoney, 
      totalAttendance: totalAtt, 
      totalAbsences: totalAbs,
      avgGrade: gradedCount > 0 ? (totalGrades / gradedCount).toFixed(1) : 0
    });
  } catch (err) { res.status(500).json(err); }
});

module.exports = router;