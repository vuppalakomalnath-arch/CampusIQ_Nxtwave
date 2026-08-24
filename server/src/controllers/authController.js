const authService = require('../services/authService');

const register = async (req, res, next) => {
  try {
    const { name, email, password, role, department, preferredLanguage } = req.body;
    const result = await authService.registerUser({
      name,
      email,
      password,
      role,
      department,
      preferredLanguage,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getUserProfile(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        preferredLanguage: user.preferredLanguage,
        voicePreferences: user.voicePreferences,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await authService.updateUserProfile(req.user._id, req.body);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        preferredLanguage: user.preferredLanguage,
        voicePreferences: user.voicePreferences,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

module.exports = { register, login, getMe, updateProfile, logout };
