const prisma = require('../config/database');

// Get dashboard revenue data
const getRevenueData = async (req, res) => {
  try {
    // Get projects with their budgets and creation dates
    const projects = await prisma.project.findMany({
      select: {
        budget: true,
        createdAt: true,
        status: true
      }
    });

    // Generate monthly revenue data for the last 6 months
    const monthlyData = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = monthDate.toLocaleString('default', { month: 'short' });
      
      // Calculate revenue for this month (sum of budgets from completed projects)
      const monthRevenue = projects
        .filter(p => {
          const projectDate = new Date(p.createdAt);
          return projectDate.getMonth() === monthDate.getMonth() && 
                 projectDate.getFullYear() === monthDate.getFullYear() &&
                 p.status === 'COMPLETED';
        })
        .reduce((sum, p) => {
          // Extract numeric value from budget string (e.g., "$50,000" -> 50000)
          const budgetNum = parseFloat(p.budget.replace(/[^0-9.]/g, '')) || 0;
          return sum + budgetNum;
        }, 0);

      monthlyData.push({
        name: monthName,
        revenue: monthRevenue
      });
    }

    res.json({
      success: true,
      data: monthlyData
    });
  } catch (error) {
    console.error('Get revenue data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching revenue data'
    });
  }
};

// Get dashboard KPI data
const getKPIData = async (req, res) => {
  try {
    // Get total revenue from all completed projects
    const projects = await prisma.project.findMany({
      where: { status: 'COMPLETED' },
      select: { budget: true }
    });

    const totalRevenue = projects.reduce((sum, p) => {
      const budgetNum = parseFloat(p.budget.replace(/[^0-9.]/g, '')) || 0;
      return sum + budgetNum;
    }, 0);

    // Get team members count (active admin users)
    const teamMembers = await prisma.adminUser.count({
      where: { isActive: true }
    });

    // Get incident reports (activities with error/failure actions)
    const incidentReports = await prisma.activityLog.count({
      where: {
        action: {
          contains: 'error'
        }
      }
    });

    // Format total revenue as currency
    const formattedRevenue = totalRevenue > 0 
      ? `ETB ${totalRevenue.toLocaleString()}` 
      : null;

    res.json({
      success: true,
      data: {
        totalRevenue: formattedRevenue,
        teamMembers: teamMembers || null,
        incidentReports: incidentReports || null
      }
    });
  } catch (error) {
    console.error('Get KPI data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching KPI data'
    });
  }
};

module.exports = {
  getRevenueData,
  getKPIData
};
