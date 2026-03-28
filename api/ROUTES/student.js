const express = require("express");
const router = express.Router();
const Student = require("../MODELS/student");

// Utility to get current month (e.g., "2026-03")
const getMonth = () => new Date().toISOString().slice(0, 7);

// --- 1. GLOBAL LIST & FILTER ---
// Restored all filters: level, language, and className
router.get("/", async (req, res) => {
  try {
    const { admin, level, language, className, month } = req.query;
    const targetMonth = month || getMonth();

    if (!admin) return res.status(400).json({ error: "Admin identifier required" });

    let query = { owner: admin };
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
        // Monthly stats for index.html
        monthlyPayments: rec.payments,
        monthlyAttendance: rec.attendance,
        monthlyAbsences: rec.absences,
        // Top-level Academic Vault data
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
router.post("/", async (req, res) => {
  try {
    const { name, level, language, className, owner } = req.body;

    const student = new Student({ 
      name, 
      level,
      language: language || "English",
      className: className || "Group A",
      owner,
      // Initialize with empty vault and first record
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

// --- 3. THE MASTER DAILY SYNC (Timeline + Vault + Finance) ---
router.post("/daily-log", async (req, res) => {
  const { studentId, date, subject, status, grade, payment, admin } = req.body;
  const targetMonth = date.slice(0, 7);

  try {
    const student = await Student.findOne({ _id: studentId, owner: admin });
    if (!student) return res.status(404).json({ error: "Student not found" });

    // A. Update the Timeline Logs (Memory)
    const logIndex = student.logs.findIndex(l => l.date === date && l.subject.toLowerCase() === subject.toLowerCase());
    const logEntry = { date, subject, status: status || 'present', grade: Number(grade) || 0, payment: Number(payment) || 0 };

    if (logIndex > -1) {
      student.logs[logIndex] = logEntry;
    } else {
      student.logs.push(logEntry);
    }

    // B. Update Top-Level Academic Vault & Finance Tracker
    if (payment) student.payments += Number(payment);
    if (status === 'present') student.attendance += 1;
    if (status === 'absent') student.absences += 1;
    
    // Map subject string to the specific schema field (e.g., "Math" -> grades.math)
    const subKey = subject.toLowerCase().trim();
    if (student.grades[subKey] !== undefined) {
      student.grades[subKey] = Number(grade);
    }

    // C. Sync with Monthly Records for Dashboard Stats
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

// --- 4. INDIVIDUAL HISTORY (For Side-Panel/Intelligence) ---
router.get("/history", async (req, res) => {
  const { admin, name } = req.query;
  try {
    const student = await Student.findOne({ 
      owner: admin, 
      name: { $regex: new RegExp("^" + name + "$", "i") } 
    });
    if (!student) return res.status(404).json({ error: "Student not found" });
    
    // Send back logs sorted by date (newest first)
    const history = student.logs.sort((a,b) => new Date(b.date) - new Date(a.date));
    res.json({ name: student.name, history, vault: student.grades });
  } catch (err) {
    res.status(500).json({ error: "History retrieval failed" });
  }
});

// --- 5. STATS ENGINE (Restored) ---
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

// --- 6. DELETE STUDENT ---
router.delete("/:id", async (req, res) => {
  try {
    const { admin } = req.query;
    const deleted = await Student.findOneAndDelete({ _id: req.params.id, owner: admin });
    if (!deleted) return res.status(403).json({ error: "Unauthorized" });
    res.json({ success: true });
  } catch (err) { 
    res.status(500).json({ error: "Delete failed" }); 
  }
});

module.exports = router;