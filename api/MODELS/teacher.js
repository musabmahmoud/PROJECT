const mongoose = require('mongoose');

/**
 * TITAN ERP | TEACHER & PAYROLL MODEL
 * Updated to sync with the "salary" field sent from teachers.html
 */
const teacherSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, "Teacher name is required"],
        trim: true 
    },
    
    subject: { 
        type: String, 
        // Removed 'enum' restriction temporarily so any subject from your input works
        default: 'General'
    },

    // --- THE PAYROLL ENGINE ---
    salaryType: { 
        type: String, 
        enum: ['Fixed', 'Per Student'], 
        default: 'Fixed' 
    },
    
    // SYNC: renamed/aliased to 'salary' to match your frontend input
    salary: { 
        type: Number, 
        default: 0 
    }, 
    
    ratePerStudent: { 
        type: Number, 
        default: 0 
    }, 
    
    // --- ASSIGNED LOAD ---
    assignedClasses: [{
        level: { type: String },
        className: { type: String, default: "Group A" },
        language: { type: String, default: "English" } 
    }],

    // --- SYNC KEY ---
    owner: { 
        type: String, 
        required: true // Matches 'adminId' from frontend
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

// Pre-save safety check
teacherSchema.pre('save', function(next) {
    if (this.salary <= 0) {
        console.warn(`[SYSTEM]: Teacher ${this.name} saved with 0 salary.`);
    }
    next();
});

module.exports = mongoose.model('Teacher', teacherSchema);