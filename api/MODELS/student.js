const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  level: { type: String, required: true },
  payments: { type: Number, default: 0 },
  attendance: { type: Number, default: 0 },
  absences: { type: Number, default: 0 },
  grade: { type: Number, default: 0 }, 
  dateAdded: { type: Date, default: Date.now }
});