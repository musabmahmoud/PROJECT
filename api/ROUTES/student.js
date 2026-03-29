const express = require("express");
const router = express.Router();
const Student = require("../MODELS/student");

// Helper to get current month string (e.g., "2026-03")
const getMonth = () => new Date().toISOString().slice(0, 7);

// --- 1. GET STUDENTS (With Smart Filters) ---
router.get("/", async (req, res) => {
  try {
    const { admin, level, className, language } = req.query;
    if (!admin) return res.status(400).json({ error: "Admin required" });

    // Build a dynamic query object
    let query = { owner: admin };
    if (level) query.level = level;
    if (className) query.className = className;
    if (language) query.language = language;

    const students = await Student.find(query).sort({ name: 1 });
    res.json(students);
  } catch (err) { 
    res.status(500).json({ error: "Fetch failed" }); 
  }
});

// --- 2. THE MASTER SYNC (Daily Log) ---
// This handles Attendance, Grades, and Payments in one click
router.post("/daily-log", async (req, res) => {
  const { studentId, date, subject, status, grade, payment, admin } = req.body;
  const targetMonth = date.slice(0, 7);

  try {
    const student = await Student.findOne({ _id: studentId, owner: admin });
    if (!student) return res.status(404).json({ error: "Student not found" });

    // A. Push to the Timeline Logs
    const newLog = { 
        date, 
        subject: subject ? subject.toUpperCase() : "GENERAL", 
        status: status || 'present', 
        grade: Number(grade) || 0, 
        payment: Number(payment) || 0 
    };
    student.logs.push(newLog);

    // B. Update Global Statistics
    if (payment) student.payments += Number(payment);
    if (status === 'present') student.attendance += 1;
    if (status === 'absent') student.absences += 1;

    // C. Update Monthly Record (for the Dashboard Stats)
    let rec = student.records.find(r => r.month === targetMonth);
    if (!rec) {
      rec = { month: targetMonth, payments: 0, attendance: 0, absences: 0 };
      student.records.push(rec);
      rec = student.records[student.records.length - 1];
    }
    if (payment) rec.payments += Number(payment);
    if (status === 'present') rec.attendance += 1;
    if (status === 'absent') rec.absences += 1;

    student.lastSeen = new Date();
    await student.save();
    
    res.json({ success: true, message: "Cloud Sync Complete" });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Sync failed" });
  }
});

// --- 3. GET INDIVIDUAL HISTORY ---
router.get("/history", async (req, res) => {
  const { admin, name } = req.query;
  try {
    const student = await Student.findOne({ owner: admin, name: name });
    if (!student) return res.status(404).json({ error: "History not found" });
    
    // Sort logs so the newest date is first
    const history = student.logs.sort((a,b) => new Date(b.date) - new Date(a.date));
    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: "Retrieval failed" });
  }
});

// --- 4. ADD NEW STUDENT ---
router.post("/", async (req, res) => {
  try {
    const { name, level, language, className, owner } = req.body;
    const student = new Student({ 
      name, level, language, className, owner,
      records: [{ month: getMonth() }] 
    });
    await student.save();
    res.status(201).json(student);
  } catch (err) { 
    res.status(400).json({ error: "Incomplete data" }); 
  }
});

// --- 5. DELETE STUDENT ---
router.delete("/:id", async (req, res) => {
  try {
    const { admin } = req.query;
    await Student.findOneAndDelete({ _id: req.params.id, owner: admin });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Delete failed" }); }
});

module.exports = router;