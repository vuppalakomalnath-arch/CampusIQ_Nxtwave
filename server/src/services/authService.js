const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

class AuthService {
  generateToken(id, role) {
    return jwt.sign({ id, role }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });
  }

  async registerUser({ name, email, password, role, department, preferredLanguage }) {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      const error = new Error('Email is already registered');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'student',
      department: department || 'General',
      preferredLanguage: preferredLanguage || 'en',
    });

    const token = this.generateToken(user._id, user.role);

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        preferredLanguage: user.preferredLanguage,
        voicePreferences: user.voicePreferences,
      },
      token,
    };
  }

  async loginUser({ email, password }) {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = this.generateToken(user._id, user.role);

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        preferredLanguage: user.preferredLanguage,
        voicePreferences: user.voicePreferences,
      },
      token,
    };
  }

  async getUserProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  async updateUserProfile(userId, updateData) {
    const allowedUpdates = ['name', 'department', 'preferredLanguage', 'voicePreferences'];
    const filtered = {};
    for (const key of allowedUpdates) {
      if (updateData[key] !== undefined) {
        filtered[key] = updateData[key];
      }
    }

    const user = await User.findByIdAndUpdate(userId, filtered, {
      new: true,
      runValidators: true,
    });
    return user;
  }
}

module.exports = new AuthService();
