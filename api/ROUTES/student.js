const express = require("express");
const router = express.Router();
const Student = require("../MODELS/student");

/**
 * TITAN ERP | STUDENT OPERATIONS ROUTE
 * Handles Registry, Daily Logs, Academic Vault, and System Analytics.
 */

// Utility to get current month (e.g., "2026-03")
const getMonth = () => new Date().toISOString().slice(0, 7);

// --- 1. GLOBAL LIST & FILTER ---
// Restored all filters: level, language, and className.
// This is the main feed for your index.html table.
router.get("/", async (req, res) => {
  try {
    const { admin, level, language, className, month } = req.query;
    const targetMonth = month || getMonth();

    // SYNC CHECK: Every request must be tied to an Admin ID.
    if (!admin) return res.status(400).json({ error: "Admin identifier required" });

    let query = { owner: admin };
    if (level) query.level = level;
    if (language) query.language = language;
    if (className && className !== "Both") query.className = className;

    const students = await Student.find(query).sort({ name: 1 });

    const formatted = students.map(s => {
      // Finds the specific record for the current month or provides defaults.
      const rec = s.records?.find(r => r.month === targetMonth) || { 
        payments: 0, attendance: 0, absences: 0, grades: {} 
      };
      
      return {
        _id: s._id,
        name: s.name,
        level: s.level,
        className: s.className,
        language: s.language || "English",
        // Monthly stats for the dashboard cards.
        monthlyPayments: rec.payments,
        monthlyAttendance: rec.attendance,
        monthlyAbsences: rec.absences,
        // Top-level "Academic Vault" data for long-term tracking.
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
// Triggered by the Enrollment form.
router.post("/", async (req, res) => {
  try {
    const { name, level, language, className, owner } = req.body;

    const student = new Student({ 
      name, 
      level,
      language: language || "English",
      className: className || "Group A",
      owner,
      // Initialize with zeroed-out trackers for the first month.
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
// This route updates three places at once: Logs, Main Stats, and Monthly Records.
router.post("/daily-log", async (req, res) => {
  const { studentId, date, subject, status, grade, payment, admin } = req.body;
  const targetMonth = date.slice(0, 7);

  try {
    const student = await Student.findOne({ _id: studentId, owner: admin });
    if (!student) return res.status(404).json({ error: "Student not found" });

    // A. Update the Timeline Logs (Memory Array)
    // Ensures we don't duplicate a log for the same date/subject.
    const logIndex = student.logs.findIndex(l => l.date === date && l.subject.toLowerCase() === subject.toLowerCase());
    const logEntry = { date, subject, status: status || 'present', grade: Number(grade) || 0, payment: Number(payment) || 0 };

    if (logIndex > -1) {
      student.logs[logIndex] = logEntry;
    } else {
      student.logs.push(logEntry);
    }

    // B. Update Top-Level Academic Vault & Finance Tracker (Running Totals)
    if (payment) student.payments += Number(payment);
    if (status === 'present') student.attendance += 1;
    if (status === 'absent') student.absences += 1;
    
    // Map the subject name (e.g. "Math") to the database key.
    const subKey = subject.toLowerCase().trim();
    if (student.grades[subKey] !== undefined) {
      student.grades[subKey] = Number(grade);
    }

    // C. Sync with Monthly Records for Dashboard Statistics
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
// Fetches the full timeline for a single student.
router.get("/history", async (req, res) => {
  const { admin, name } = req.query;
  try {
    const student = await Student.findOne({ 
      owner: admin, 
      name: { $regex: new RegExp("^" + name + "$", "i") } 
    });
    if (!student) return res.status(404).json({ error: "Student not found" });
    
    // Returns logs sorted by date (newest first).
    const history = student.logs.sort((a,b) => new Date(b.date) - new Date(a.date));
    res.json({ name: student.name, history, vault: student.grades });
  } catch (err) {
    res.status(500).json({ error: "History retrieval failed" });
  }
});

// --- 5. STATS ENGINE (System Analytics) ---
// Calculates Total Revenue, Attendance, and Absences for the entire center.
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
// Permanently removes a record from the database.
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