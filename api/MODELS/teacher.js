const mongoose = require('mongoose');

/**
 * TITAN ERP | TEACHER & PAYROLL MODEL
 * This schema manages staff identity, subject assignment, and 
 * the logic for calculating their monthly earnings.
 */
const teacherSchema = new mongoose.Schema({
    // --- IDENTITY & CORE DATA ---
    name: { 
        type: String, 
        required: [true, "Teacher name is required"],
        trim: true // Automatically removes accidental spaces at the start/end
    },
    
    // ENUM CHECK: Only these subjects are allowed.
    // Notice 'Physics' and 'Chemistry' are here for your Secondary 2 focus.
    subject: { 
        type: String, 
        required: true,
        enum: ['Math', 'Physics', 'Chemistry', 'English', 'Arabic', 'Science', 'Social', 'Discovery', 'Religion'],
        default: 'Math'
    },

    // --- THE PAYROLL ENGINE ---
    // This determines HOW the teacher gets paid.
    salaryType: { 
        type: String, 
        enum: ['Fixed', 'Per Student'], // 'Fixed' = Monthly salary, 'Per Student' = Commission
        default: 'Fixed' 
    },
    
    baseSalary: { 
        type: Number, 
        default: 0 
    }, // The flat amount paid if salaryType is 'Fixed'.
    
    ratePerStudent: { 
        type: Number, 
        default: 0 
    }, // The amount paid per student if salaryType is 'Per Student'.
    
    // --- ASSIGNED LOAD ---
    // Links the teacher to specific levels and classes.
    // This is used to calculate how many students they are teaching.
    assignedClasses: [{
        level: { type: String, required: true },     // e.g., "Sec 2"
        className: { type: String, default: "A" },   // e.g., "Group A"
        language: { type: String, default: "English" } 
    }],

    // --- ADMIN & CONTACT ---
    // SYNC KEY: Connects this teacher to YOUR specific Admin account.
    owner: { 
        type: String, 
        required: true 
    }, 
    
    phone: { 
        type: String, 
        default: "" 
    },
    
    joiningDate: { 
        type: Date, 
        default: Date.now 
    }
});

/**
 * PRE-SAVE MIDDLEWARE
 * This runs automatically right before a teacher is saved to the database.
 * It acts as a "safety net" to warn you if a salary is set up incorrectly.
 */
teacherSchema.pre('save', function(next) {
    if (this.salaryType === 'Fixed' && this.baseSalary <= 0) {
        console.warn(`[SYSTEM WARNING]: Teacher ${this.name} is set to 'Fixed' salary but the amount is $0.`);
    }
    next();
});

module.exports = mongoose.model('Teacher', teacherSchema);