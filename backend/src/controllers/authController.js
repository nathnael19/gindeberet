const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { generateToken } = require('../utils/jwt');
const { convertRole } = require('../middleware/enumConverter');

const formatAdminUser = (user) => {
  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();

  return {
    ...user,
    firstName,
    lastName,
    name: fullName || null,
    fullName: fullName || null,
    role: user.role.toLowerCase()
  };
};

// Admin login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await prisma.adminUser.findUnique({
      where: { email }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Generate token
    const token = generateToken(user.id, user.email, user.role);

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;

    // Convert role to lowercase for frontend compatibility
    const formattedUser = formatAdminUser(userWithoutPassword);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: formattedUser
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// Get current user info
const getMe = async (req, res) => {
  try {
    const user = await prisma.adminUser.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLogin: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Convert role to lowercase for frontend compatibility
    const formattedUser = formatAdminUser(user);

    res.json({
      success: true,
      data: formattedUser
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update current user profile
const updateMe = async (req, res) => {
  try {
    const { firstName, lastName, email, currentPassword, newPassword } = req.body;
    const user = await prisma.adminUser.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const updateData = {};

    if (typeof firstName !== 'undefined') {
      updateData.firstName = firstName || null;
    }

    if (typeof lastName !== 'undefined') {
      updateData.lastName = lastName || null;
    }

    if (typeof email !== 'undefined' && email) {
      const existingUser = await prisma.adminUser.findUnique({
        where: { email }
      });

      if (existingUser && existingUser.id !== user.id) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use'
        });
      }

      updateData.email = email;
    }

    // Role changes are not allowed via self-service profile update

    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password and new password are required'
        });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No changes were provided'
      });
    }

    const updatedUser = await prisma.adminUser.update({
      where: { id: req.user.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLogin: true
      }
    });

    const formattedUser = formatAdminUser(updatedUser);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: formattedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
};

// Create new admin user (super admin only)
const createUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.adminUser.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const user = await prisma.adminUser.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: convertRole(role)
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.userId,
        action: 'created',
        targetType: 'admin_user',
        targetId: user.id.toString(),
        description: `Created admin user: ${email}`
      }
    });

    // Convert role to lowercase for frontend compatibility
    const formattedUser = {
      ...user,
      role: user.role.toLowerCase()
    };

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: formattedUser
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating user'
    });
  }
};

module.exports = { login, getMe, updateMe, createUser };