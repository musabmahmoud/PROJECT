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
  } catch (err) { 
    console.error("List Error:", err);
    res.status(500).json({ error: "Failed to fetch students" }); 
  }
});

// 2. Add Student
router.post("/", async (req, res) => {
  try {
    const { name, level } = req.body;
    const student = new Student({ 
      name, 
      level: level || "Sec 1",
      records: [{ month: getMonth(), payments: 0, attendance: 0, absences: 0, grade: 0 }] 
    });
    await student.save();
    res.json(student);
  } catch (err) { 
    res.status(400).json({ error: "Could not add student" }); 
  }
});

// 3. Update Attendance (Fixed Path to avoid "Invalid Type" error)
router.post("/:id/attendance/:type", async (req, res) => {
  const { id, type } = req.params;
  const { month } = req.body;
  
  if (type !== 'present' && type !== 'absent') {
    return res.status(400).json({ error: "Invalid type" });
  }
  
  const targetMonth = month || getMonth();
  const field = type === "present" ? "attendance" : "absences";

  try {
    let student = await Student.findOneAndUpdate(
      { _id: id, "records.month": targetMonth },
      { $inc: { [`records.$.${field}`]: 1 } },
      { new: true }
    );

    if (!student) {
      student = await Student.findByIdAndUpdate(id, 
        { $push: { records: { month: targetMonth, [field]: 1, payments: 0, attendance: 0, absences: 0, grade: 0 } } }, 
        { new: true }
      );
    }
    res.json(student);
  } catch (err) { 
    res.status(500).json({ error: "Attendance update failed" }); 
  }
});

// 4. Update Value (Grade/Payments)
router.post("/:id/update-value", async (req, res) => {
  const { id } = req.params;
  const { field, value, month } = req.body;
  const targetMonth = month || getMonth();

  try {
    let student = await Student.findOneAndUpdate(
      { _id: id, "records.month": targetMonth },
      { $set: { [`records.$.${field}`]: Number(value) } },
      { new: true }
    );

    if (!student) {
      student = await Student.findByIdAndUpdate(id, 
        { $push: { records: { month: targetMonth, [field]: Number(value), payments: 0, attendance: 0, absences: 0, grade: 0 } } }, 
        { new: true }
      );
    }
    res.json(student);
  } catch (err) { 
    res.status(500).json({ error: "Value update failed" }); 
  }
});

// 5. Delete Student
router.delete("/:id", async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) { 
    res.status(500).json({ error: "Delete failed" }); 
  }
});

// 6. Stats for Dashboard (Restored)
router.get("/stats/all", async (req, res) => {
  try {
    const targetMonth = req.query.month || getMonth();
    const students = await Student.find();
    
    let totalMoney = 0, totalAtt = 0, totalAbs = 0, totalGrades = 0, gradedCount = 0;

    students.forEach(s => {
      const rec = s.records.find(r => r.month === targetMonth);
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
      avgGrade: gradedCount > 0 ? (totalGrades / gradedCount).toFixed(1) : 0,
      studentCount: students.length
    });
  } catch (err) { 
    res.status(500).json({ error: "Stats calculation failed" }); 
  }
});

module.exports = router;