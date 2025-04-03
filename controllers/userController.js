const User = require('../models/User');
const Resume = require('../models/Resume');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');
const bcrypt = require('bcryptjs');

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('-password')
      .lean();

    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    const resumes = await Resume.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .select('-resumeText')
      .lean();

    res.status(200).json({
      success: true,
      user: {
        ...user,
        resumeCount: resumes.length
      },
      resumes
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error while fetching profile' 
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    if (name) user.name = name;

    let emailUpdated = false;
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ 
          success: false,
          error: 'Email already in use' 
        });
      }
      user.email = email;
      emailUpdated = true;
    }

    if (newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ 
          success: false,
          error: 'Current password is incorrect' 
        });
      }
      user.password = newPassword;
    }

    await user.save();

    let token;
    if (emailUpdated) {
      token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '30d' });
    }

    const userResponse = {
      _id: user._id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    };

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      token: token || undefined,
      user: userResponse
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error while updating profile' 
    });
  }
};

const getResumeDetails = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.resumeId,
      user: req.userId
    });

    if (!resume) {
      return res.status(404).json({ 
        success: false,
        error: 'Resume not found or access denied' 
      });
    }

    res.status(200).json({
      success: true,
      resume
    });

  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error while fetching resume' 
    });
  }
};

const deleteAccount = async (req, res) => {
  try {
    await Resume.deleteMany({ user: req.userId });
    await User.findByIdAndDelete(req.userId);

    res.status(200).json({
      success: true,
      message: 'Account and all associated data deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error while deleting account' 
    });
  }
};

module.exports = {
  getUserProfile,
  updateProfile,
  getResumeDetails,
  deleteAccount
};