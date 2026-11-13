const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'sc_dev_secret_change_in_prod';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim(), isActive: true });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
        assignedDistrict: user.assignedDistrict
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      token,
      user: user.toProfile()
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

// GET /api/auth/me  — requires Authorization: Bearer <token>
async function me(req, res) {
  try {
    // req.user is attached by authMiddleware
    const user = await User.findById(req.user.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or deactivated.' });
    }
    return res.json({ user: user.toProfile() });
  } catch (err) {
    console.error('Me error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

// POST /api/auth/signup
async function signup(req, res) {
  try {
    const { name, email, password, role, assignedDistrict, title, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const assignedRole = role === 'ADMIN' ? 'ADMIN' : 'OUTLET_MANAGER';
    const district = assignedRole === 'OUTLET_MANAGER' ? (assignedDistrict || 'guntur') : null;

    const defaultAvatars = {
      ADMIN: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      amaravati: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      guntur: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      vijayawada: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    };

    const avatar = defaultAvatars[district] || defaultAvatars[assignedRole];
    const passwordHash = await User.hashPassword(password);

    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role: assignedRole,
      assignedDistrict: district,
      title: title || (assignedRole === 'ADMIN' ? 'State Dining Administrator' : `${district.toUpperCase()} Kitchen Executive`),
      department: department || (assignedRole === 'ADMIN' ? 'State Canteen Operations' : `${district.toUpperCase()} Floor Dining`),
      badge: assignedRole === 'ADMIN' ? 'Statewide Admin' : `${district.charAt(0).toUpperCase() + district.slice(1)} Floor`,
      avatar
    });

    const token = jwt.sign(
      {
        userId: newUser._id.toString(),
        role: newUser.role,
        assignedDistrict: newUser.assignedDistrict
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      token,
      user: newUser.toProfile()
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Failed to create account.' });
  }
}

module.exports = { login, signup, me };

