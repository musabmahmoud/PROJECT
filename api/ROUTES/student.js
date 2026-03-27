const express = require("express");
const router = express.Router();
const Student = require("../MODELS/student");

const getMonth = () => new Date().toISOString().slice(0, 7);

// 1. List Students (SECURED: Added owner filter)
router.get("/", async (req, res) => {
  try {
    const targetMonth = req.query.month || getMonth();
    const admin = req.query.admin; // Get admin name from frontend

    // CRITICAL: Only find students belonging to this admin
    const students = await Student.find({ owner: admin }).sort({ level: 1, name: 1 });

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
    res.status(500).json({ error: "Failed to fetch students" }); 
  }
});

// 2. Add Student (SECURED: Saving the owner)
router.post("/", async (req, res) => {
  try {
    const { name, level, owner } = req.body; // owner comes from localStorage in frontend
    const student = new Student({ 
      name, 
      level: level || "Sec 1",
      owner, // Now every student is "tagged" to an admin
      records: [{ month: getMonth(), payments: 0, attendance: 0, absences: 0, grade: 0 }] 
    });
    await student.save();
    res.json(student);
  } catch (err) { 
    res.status(400).json({ error: "Could not add student" }); 
  }
});

// 3. Update Attendance (SECURED: Added owner check)
router.post("/:id/attendance/:type", async (req, res) => {
  const { id, type } = req.params;
  const { month, admin } = req.body; // Ensure admin is passed
  
  const targetMonth = month || getMonth();
  const field = type === "present" ? "attendance" : "absences";

  try {
    // We search by ID AND Owner to prevent unauthorized edits
    let student = await Student.findOneAndUpdate(
      { _id: id, owner: admin, "records.month": targetMonth },
      { $inc: { [`records.$.${field}`]: 1 } },
      { new: true }
    );

    if (!student) {
      // Check if student exists for this admin before pushing new month record
      const checkOwner = await Student.findOne({ _id: id, owner: admin });
      if (!checkOwner) return res.status(403).json({ error: "Unauthorized" });

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

// 4. Update Value (SECURED: Added owner check)
router.post("/:id/update-value", async (req, res) => {
  const { id } = req.params;
  const { field, value, month, admin } = req.body;
  const targetMonth = month || getMonth();

  try {
    let student = await Student.findOneAndUpdate(
      { _id: id, owner: admin, "records.month": targetMonth },
      { $set: { [`records.$.${field}`]: Number(value) } },
      { new: true }
    );

    if (!student) {
      const checkOwner = await Student.findOne({ _id: id, owner: admin });
      if (!checkOwner) return res.status(403).json({ error: "Unauthorized" });

      student = await Student.findByIdAndUpdate(id, 
        { $push: { records: { month: targetMonth, [field]: Number(value), payments: 0, attendance: 0, absences: 0, grade: 0 } } }, 
        { new: true }
      );
    }
    res.json(student);
  } catch (err) { res.status(500).json({ error: "Value update failed" }); }
});

// 5. Delete Student (SECURED: Double check owner)
router.delete("/:id", async (req, res) => {
  try {
    // You should ideally pass ?admin= in the delete request too
    const admin = req.query.admin; 
    const deleted = await Student.findOneAndDelete({ _id: req.params.id, owner: admin });
    if (!deleted) return res.status(403).json({ error: "Not found or unauthorized" });
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ error: "Delete failed" }); }
});

// 6. Stats (SECURED: Filtered by owner)
router.get("/stats/all", async (req, res) => {
  try {
    const targetMonth = req.query.month || getMonth();
    const admin = req.query.admin;
    const students = await Student.find({ owner: admin });
    
    let totalMoney = 0, totalAtt = 0, totalAbs = 0, totalGrades = 0, gradedCount = 0;

    students.forEach(s => {
      const rec = s.records.find(r => r.month === targetMonth);
      if (rec) {
        totalMoney += (rec.payments || 0);
        totalAtt += (rec.attendance || 0);
        totalAbs += (rec.absences || 0);
        if (rec.grade > 0) { totalGrades += rec.grade; gradedCount++; }
      }
    });

    res.json({ 
      totalMoney, 
      totalAttendance: totalAtt, 
      totalAbsences: totalAbs,
      avgGrade: gradedCount > 0 ? (totalGrades / gradedCount).toFixed(1) : 0,
      studentCount: students.length
    });
  } catch (err) { res.status(500).json({ error: "Stats failed" }); }
});

module.exports = router;