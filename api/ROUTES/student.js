const express = require("express");
const router = express.Router();
const Student = require("../MODELS/student");

// Utility to get current month (e.g., "2026-03")
const getMonth = () => new Date().toISOString().slice(0, 7);

// 1. GLOBAL LIST & FILTER (Supports index.html and tables.html)
router.get("/", async (req, res) => {
  try {
    const { admin, level, language, month } = req.query;
    const targetMonth = month || getMonth();

    if (!admin) return res.status(400).json({ error: "Admin identifier required" });

    // Build flexible query
    let query = { owner: admin };
    if (level) query.level = level;
    if (language) query.language = language;

    const students = await Student.find(query).sort({ name: 1 });

    // Format data to flatten the monthly record for the frontend
    const formatted = students.map(s => {
      const rec = s.records?.find(r => r.month === targetMonth) || { 
        payments: 0, attendance: 0, absences: 0, grades: {} 
      };
      
      return {
        _id: s._id,
        name: s.name,
        level: s.level,
        language: s.language || "English",
        className: s.className || "A",
        payments: rec.payments,
        attendance: rec.attendance,
        absences: rec.absences,
        grades: rec.grades || {} // Contains subject scores like { math: 90, physics: 85 }
      };
    });

    res.json(formatted);
  } catch (err) { 
    res.status(500).json({ error: "Failed to fetch student stream" }); 
  }
});

// 2. ADD NEW STUDENT (Initializes first monthly record)
router.post("/", async (req, res) => {
  try {
    const { name, level, language, className, owner } = req.body;

    const student = new Student({ 
      name, 
      level: level || "Sec 2",
      language: language || "English",
      className: className || "A",
      owner,
      records: [{ 
        month: getMonth(), 
        payments: 0, 
        attendance: 0, 
        absences: 0, 
        grades: {} 
      }] 
    });

    await student.save();
    res.status(201).json(student);
  } catch (err) { 
    res.status(400).json({ error: "Entry creation failed" }); 
  }
});

// 3. ADVANCED VALUE UPDATE (Handles Grades, Payments, etc.)
router.post("/:id/update-value", async (req, res) => {
  const { id } = req.params;
  const { field, value, month, admin } = req.body; // field could be "payments" or "grades.math"
  const targetMonth = month || getMonth();

  try {
    // 1. Try to update existing month record
    let student = await Student.findOneAndUpdate(
      { _id: id, owner: admin, "records.month": targetMonth },
      { $set: { [`records.$.${field}`]: value } },
      { new: true }
    );

    // 2. If month record doesn't exist, create it (Upsert logic)
    if (!student) {
      const checkOwner = await Student.findOne({ _id: id, owner: admin });
      if (!checkOwner) return res.status(403).json({ error: "Unauthorized access" });

      student = await Student.findByIdAndUpdate(id, 
        { 
          $push: { 
            records: { 
              month: targetMonth, 
              [field.includes('.') ? 'grades' : field]: field.includes('.') ? { [field.split('.')[1]]: value } : value,
              payments: 0, attendance: 0, absences: 0
            } 
          } 
        }, 
        { new: true }
      );
    }
    res.json(student);
  } catch (err) { 
    res.status(500).json({ error: "Update operation failed" }); 
  }
});

// 4. ATTENDANCE ENGINE (Secured)
router.post("/:id/attendance/:type", async (req, res) => {
  const { id, type } = req.params;
  const { month, admin } = req.body;
  const targetMonth = month || getMonth();
  const field = type === "present" ? "attendance" : "absences";

  try {
    let student = await Student.findOneAndUpdate(
      { _id: id, owner: admin, "records.month": targetMonth },
      { $inc: { [`records.$.${field}`]: 1 } },
      { new: true }
    );

    if (!student) {
      const checkOwner = await Student.findOne({ _id: id, owner: admin });
      if (!checkOwner) return res.status(403).json({ error: "Unauthorized" });

      student = await Student.findByIdAndUpdate(id, 
        { $push: { records: { month: targetMonth, [field]: 1, payments: 0, attendance: 0, absences: 0, grades: {} } } }, 
        { new: true }
      );
    }
    res.json(student);
  } catch (err) { 
    res.status(500).json({ error: "Attendance sync failed" }); 
  }
});

// 5. STATS ENGINE (For Dashboard Charts)
router.get("/stats/all", async (req, res) => {
  try {
    const { admin, month } = req.query;
    const targetMonth = month || getMonth();
    
    const students = await Student.find({ owner: admin });
    
    let stats = {
      totalRevenue: 0,
      totalAttendance: 0,
      totalAbsences: 0,
      studentCount: students.length
    };

    students.forEach(s => {
      const rec = s.records.find(r => r.month === targetMonth);
      if (rec) {
        stats.totalRevenue += (rec.payments || 0);
        stats.totalAttendance += (rec.attendance || 0);
        stats.totalAbsences += (rec.absences || 0);
      }
    });

    res.json(stats);
  } catch (err) { 
    res.status(500).json({ error: "System analytics failed" }); 
  }
});

// 6. DELETE STUDENT (Final Guard)
router.delete("/:id", async (req, res) => {
  try {
    const { admin } = req.query;
    const deleted = await Student.findOneAndDelete({ _id: req.params.id, owner: admin });
    
    if (!deleted) return res.status(403).json({ error: "Delete unauthorized or record missing" });
    res.json({ success: true, message: "Records purged" });
  } catch (err) { 
    res.status(500).json({ error: "Delete operation failed" }); 
  }
});

module.exports = router;