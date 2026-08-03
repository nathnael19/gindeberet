const prisma = require('../config/database');

// Get recent activity
const getRecentActivity = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const activities = await prisma.activityLog.findMany({
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });

    // Format activity data
    const formattedActivities = activities.map(activity => {
      const userName = activity.user?.firstName 
        ? `${activity.user.firstName} ${activity.user.lastName || ''}`.trim()
        : activity.user?.email || 'System';

      return {
        id: activity.id,
        user: userName,
        action: activity.action,
        target: activity.targetType,
        targetId: activity.targetId,
        description: activity.description,
        time: formatTimeAgo(activity.createdAt)
      };
    });

    res.json({
      success: true,
      data: formattedActivities
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching activity'
    });
  }
};

// Log activity (helper function)
const logActivity = async (userId, action, targetType, targetId, description) => {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        targetType,
        targetId,
        description
      }
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

// Helper function to format time ago
function formatTimeAgo(date) {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return past.toLocaleDateString();
}

module.exports = { getRecentActivity, logActivity };