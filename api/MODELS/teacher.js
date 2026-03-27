const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, "Teacher name is required"],
        trim: true 
    },
    subject: { 
        type: String, 
        required: true,
        enum: ['Math', 'Physics', 'Chemistry', 'English', 'Arabic', 'Science', 'Social', 'Discovery', 'Religion'],
        default: 'Math'
    },
    // THE PAYROLL ENGINE
    salaryType: { 
        type: String, 
        enum: ['Fixed', 'Per Student'], 
        default: 'Fixed' 
    },
    baseSalary: { 
        type: Number, 
        default: 0 
    }, // Used if 'Fixed'
    ratePerStudent: { 
        type: Number, 
        default: 0 
    }, // Used if 'Per Student'
    
    // ASSIGNED LOAD (Used for Per-Student calculations)
    assignedClasses: [{
        level: { type: String, required: true },     // e.g., "Sec 2"
        className: { type: String, default: "A" },   // e.g., "Class A"
        language: { type: String, default: "English" } // e.g., "English"
    }],

    // ADMIN DATA
    owner: { 
        type: String, 
        required: true 
    }, // Link to the Admin's name/ID
    phone: { 
        type: String, 
        default: "" 
    },
    joiningDate: { 
        type: Date, 
        default: Date.now 
    }
});

// Middleware to ensure we don't have empty arrays breaking the logic
teacherSchema.pre('save', function(next) {
    if (this.salaryType === 'Fixed' && this.baseSalary <= 0) {
        console.warn(`Warning: Teacher ${this.name} is set to Fixed salary but baseSalary is 0.`);
    }
    next();
});

module.exports = mongoose.model('Teacher', teacherSchema);