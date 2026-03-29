const express = require("express");
const router = express.Router();
const Student = require("../MODELS/student");

const getMonth = () => new Date().toISOString().slice(0, 7);

// GET ALL STUDENTS
router.get("/", async (req, res) => {
  try {
    const { admin } = req.query;
    if (!admin) return res.status(400).json({ error: "Admin required" });
    const students = await Student.find({ owner: admin }).sort({ name: 1 });
    res.json(students);
  } catch (err) { 
    res.status(500).json({ error: "Fetch failed" }); 
  }
});

// ADD NEW STUDENT
router.post("/", async (req, res) => {
  try {
    const { name, level, language, className, owner } = req.body;
    
    const student = new Student({ 
      name, 
      level, 
      language, 
      className, 
      owner,
      records: [{ month: getMonth() }] 
    });

    await student.save();
    res.status(201).json(student);
  } catch (err) { 
    console.error(err);
    res.status(400).json({ error: "Check if all fields are filled" }); 
  }
});

// DELETE STUDENT
router.delete("/:id", async (req, res) => {
  try {
    const { admin } = req.query;
    await Student.findOneAndDelete({ _id: req.params.id, owner: admin });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Delete failed" }); }
});

module.exports = router;