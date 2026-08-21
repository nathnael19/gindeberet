const prisma = require('../config/database');

const DEFAULT_SITE_SETTINGS = {
  id: 1,
  officeLocation: '123 Industrial Way, Builder City, BC 12345',
  phone: '(555) 123-4567',
  workingHours: 'Mon-Fri, 8am-6pm',
  email: 'gindeberetconstruction278@gmail.com',
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=9.0244,38.7469'
};

// Get public site settings
const getSiteSettings = async (req, res) => {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 1 }
    });

    res.json({
      success: true,
      data: settings || DEFAULT_SITE_SETTINGS
    });
  } catch (error) {
    console.error('Get site settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching site settings'
    });
  }
};

// Update site settings (admin only)
const updateSiteSettings = async (req, res) => {
  try {
    const { officeLocation, phone, workingHours, email, mapUrl } = req.body;

    if (officeLocation === undefined && phone === undefined && workingHours === undefined && email === undefined && mapUrl === undefined) {
      return res.status(400).json({
        success: false,
        message: 'No settings were provided'
      });
    }

    const updateData = {};

    if (officeLocation !== undefined) updateData.officeLocation = officeLocation;
    if (phone !== undefined) updateData.phone = phone;
    if (workingHours !== undefined) updateData.workingHours = workingHours;
    if (email !== undefined) updateData.email = email;
    if (mapUrl !== undefined) updateData.mapUrl = mapUrl;

    updateData.updatedBy = req.user.userId;

    const settings = await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: updateData,
      create: {
        id: 1,
        ...DEFAULT_SITE_SETTINGS,
        ...updateData
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.userId,
        action: 'updated',
        targetType: 'site_settings',
        targetId: '1',
        description: 'Updated site settings'
      }
    });

    res.json({
      success: true,
      message: 'Site settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Update site settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating site settings'
    });
  }
};

module.exports = { getSiteSettings, updateSiteSettings };
