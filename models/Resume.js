const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    resumeText: { 
        type: String,
        required: true
    },
    atsScore: { 
        type: Number,
        default: 0
    },
    keywords: [{ 
        type: String,
        default: []
    }],
    suggestions: [{ 
        type: String,
        default: []
    }],
    missingKeywords: [{ 
        type: String,
        default: []
    }],
    scoreBreakdown: { 
        type: Object,
        default: {
            keywords: 0,
            experience: 0,
            education: 0,
            formatting: 0
        }
    },
    resumeStatus: {
        type: String,
        enum: ['processing', 'parsed', 'completed', 'failed'],
        default: 'processing'
    },
    error: {
        type: String
    }
}, { 
    timestamps: true,
    versionKey: false // Disable the version key
});

// Add index for better query performance
resumeSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Resume', resumeSchema);