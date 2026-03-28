const express = require("express");
const router = express.Router();
const Student = require("../MODELS/student");

/**
 * TITAN ERP | STUDENT OPERATIONS ROUTE
 * Standardized to use 'adminId' for all owner-based queries.
 */

// Utility to get current month (e.g., "2026-03")
const getMonth = () => new Date().toISOString().slice(0, 7);

// --- 1. GLOBAL LIST & FILTER ---
// This feeds your index.html table.
router.get("/", async (req, res) => {
  try {
    const { adminId, level, language, className, month } = req.query;
    const targetMonth = month || getMonth();

    // Block request if no Admin ID is provided
    if (!adminId) {
      return res.status(400).json({ error: "Admin identifier required" });
    }

    let query = { owner: adminId };
    if (level) query.level = level;
    if (language) query.language = language;
    if (className && className !== "Both") query.className = className;

    const students = await Student.find(query).sort({ name: 1 });

    const formatted = students.map(s => {
      const rec = s.records?.find(r => r.month === targetMonth) || { 
        payments: 0, attendance: 0, absences: 0, grades: {} 
      };
      
      return {
        _id: s._id,
        name: s.name,
        level: s.level,
        className: s.className,
        language: s.language || "English",
        monthlyPayments: rec.payments,
        monthlyAttendance: rec.attendance,
        monthlyAbsences: rec.absences,
        totalPayments: s.payments,
        academicVault: s.grades,
        lastSeen: s.lastSeen
      };
    });

    res.json(formatted);
  } catch (err) { 
    res.status(500).json({ error: "Failed to fetch student stream" }); 
  }
});

// --- 2. ADD NEW STUDENT ---
// Triggered by the Enrollment portal.
router.post("/", async (req, res) => {
  try {
    const { name, level, language, className, adminId } = req.body;

    if (!adminId) {
      return res.status(400).json({ error: "Admin ID required for enrollment" });
    }

    const student = new Student({ 
      name, 
      level,
      language: language || "English",
      className: className || "Group A",
      owner: adminId,
      payments: 0,
      attendance: 0,
      absences: 0,
      records: [{ 
        month: getMonth(), 
        payments: 0, attendance: 0, absences: 0, grades: {} 
      }] 
    });

    await student.save();
    res.status(201).json(student);
  } catch (err) { 
    res.status(400).json({ error: "Entry creation failed" }); 
  }
});

// --- 3. THE MASTER DAILY SYNC ---
// Updates Timeline, Vault, and Finance in one go.
router.post("/daily-log", async (req, res) => {
  const { studentId, date, subject, status, grade, payment, adminId } = req.body;
  const targetMonth = date.slice(0, 7);

  try {
    const student = await Student.findOne({ _id: studentId, owner: adminId });
    if (!student) return res.status(404).json({ error: "Student not found" });

    // Update Logs
    const logIndex = student.logs.findIndex(l => l.date === date && l.subject.toLowerCase() === subject.toLowerCase());
    const logEntry = { date, subject, status: status || 'present', grade: Number(grade) || 0, payment: Number(payment) || 0 };

    if (logIndex > -1) {
      student.logs[logIndex] = logEntry;
    } else {
      student.logs.push(logEntry);
    }

    // Update Totals
    if (payment) student.payments += Number(payment);
    if (status === 'present') student.attendance += 1;
    if (status === 'absent') student.absences += 1;
    
    const subKey = subject.toLowerCase().trim();
    if (student.grades[subKey] !== undefined) {
      student.grades[subKey] = Number(grade);
    }

    // Sync Monthly Record
    let rec = student.records.find(r => r.month === targetMonth);
    if (!rec) {
      rec = { month: targetMonth, payments: 0, attendance: 0, absences: 0, grades: {} };
      student.records.push(rec);
      rec = student.records[student.records.length - 1];
    }

    if (payment) rec.payments += Number(payment);
    if (status === 'present') rec.attendance += 1;
    if (status === 'absent') rec.absences += 1;
    if (grade && subject) rec.grades[subKey] = Number(grade);

    student.lastSeen = new Date();
    await student.save();
    res.json({ message: "Student Data Fully Synced", student });
  } catch (err) {
    res.status(500).json({ error: "Timeline sync failed" });
  }
});

// --- 4. INDIVIDUAL HISTORY ---
router.get("/history", async (req, res) => {
  const { adminId, name } = req.query;
  try {
    const student = await Student.findOne({ 
      owner: adminId, 
      name: { $regex: new RegExp("^" + name + "$", "i") } 
    });
    if (!student) return res.status(404).json({ error: "Student not found" });
    
    const history = student.logs.sort((a,b) => new Date(b.date) - new Date(a.date));
    res.json({ name: student.name, history, vault: student.grades });
  } catch (err) {
    res.status(500).json({ error: "History retrieval failed" });
  }
});

// --- 5. SYSTEM ANALYTICS ---
router.get("/stats/all", async (req, res) => {
  try {
    const { adminId, month } = req.query;
    const targetMonth = month || getMonth();
    
    const students = await Student.find({ owner: adminId });
    
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

// --- 6. DELETE STUDENT ---
router.delete("/:id", async (req, res) => {
  try {
    const { adminId } = req.query;
    const deleted = await Student.findOneAndDelete({ _id: req.params.id, owner: adminId });
    if (!deleted) return res.status(403).json({ error: "Unauthorized or not found" });
    res.json({ success: true });
  } catch (err) { 
    res.status(500).json({ error: "Delete failed" }); 
  }
});

module.exports = router;