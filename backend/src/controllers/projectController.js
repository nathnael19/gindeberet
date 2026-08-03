const prisma = require('../config/database');
const { convertProjectStatus } = require('../middleware/enumConverter');

// Get all projects with filtering
const getAllProjects = async (req, res) => {
  try {
    const { status, category, search } = req.query;
    
    // Build where clause
    const where = {};

    if (status && status !== 'all' && status !== 'undefined' && status !== '') {
      where.status = convertProjectStatus(status);
    }

    if (category && category !== 'All' && category !== 'undefined' && category !== '') {
      where.category = category;
    }

    if (search && search !== 'undefined' && search !== '') {
      where.OR = [
        { name: { contains: search } },
        { client: { contains: search } },
        { location: { contains: search } }
      ];
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        gallery: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Convert status to lowercase for frontend compatibility
    const formattedProjects = projects.map(project => ({
      ...project,
      status: project.status.toLowerCase(),
      gallery: project.gallery.map(g => g.imageUrl)
    }));

    res.json({
      success: true,
      data: formattedProjects
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching projects'
    });
  }
};

// Get single project by ID
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        gallery: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Convert status to lowercase for frontend compatibility
    const formattedProject = {
      ...project,
      status: project.status.toLowerCase(),
      gallery: project.gallery.map(g => g.imageUrl)
    };

    res.json({
      success: true,
      data: formattedProject
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching project'
    });
  }
};

// Create new project
const createProject = async (req, res) => {
  try {
    const {
      id,
      name,
      client,
      status,
      budget,
      location,
      category,
      duration,
      year,
      description,
      challenge,
      solution,
      highlights,
      image,
      gallery
    } = req.body;

    // Validate required fields
    if (!id || !name || !client || !budget || !location || !category || !duration || !year) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if project ID already exists
    const existingProject = await prisma.project.findUnique({
      where: { id }
    });

    if (existingProject) {
      return res.status(400).json({
        success: false,
        message: 'Project with this ID already exists'
      });
    }

    // Create project with gallery
    const project = await prisma.project.create({
      data: {
        id,
        name,
        client,
        status: convertProjectStatus(status),
        budget,
        location,
        category,
        duration,
        year,
        description,
        challenge,
        solution,
        highlights,
        image,
        createdBy: req.user.userId,
        gallery: gallery && gallery.length > 0 ? {
          create: gallery.map((url, index) => ({
            imageUrl: url,
            order: index
          }))
        } : undefined
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.userId,
        action: 'created',
        targetType: 'project',
        targetId: id,
        projectId: id,
        description: `Created project: ${name}`
      }
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { id, name }
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating project'
    });
  }
};

// Update project
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      client,
      status,
      budget,
      location,
      category,
      duration,
      year,
      description,
      challenge,
      solution,
      highlights,
      image,
      gallery
    } = req.body;

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id }
    });

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Build update data dynamically
    const updateData = {};
    
    if (name !== undefined) updateData.name = name;
    if (client !== undefined) updateData.client = client;
    if (status !== undefined) updateData.status = convertProjectStatus(status);
    if (budget !== undefined) updateData.budget = budget;
    if (location !== undefined) updateData.location = location;
    if (category !== undefined) updateData.category = category;
    if (duration !== undefined) updateData.duration = duration;
    if (year !== undefined) updateData.year = year;
    if (description !== undefined) updateData.description = description;
    if (challenge !== undefined) updateData.challenge = challenge;
    if (solution !== undefined) updateData.solution = solution;
    if (highlights !== undefined) updateData.highlights = highlights;
    if (image !== undefined) updateData.image = image;

    if (Object.keys(updateData).length === 0 && gallery === undefined) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    // Handle gallery updates - delete old gallery and create new one
    if (gallery !== undefined) {
      // Delete existing gallery
      await prisma.projectGallery.deleteMany({
        where: { projectId: id }
      });

      // Create new gallery entries if provided
      if (gallery && gallery.length > 0) {
        updateData.gallery = {
          create: gallery.map((url, index) => ({
            imageUrl: url,
            order: index
          }))
        };
      }
    }

    await prisma.project.update({
      where: { id },
      data: updateData
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.userId,
        action: 'updated',
        targetType: 'project',
        targetId: id,
        projectId: id,
        description: `Updated project: ${name || existingProject.name}`
      }
    });

    res.json({
      success: true,
      message: 'Project updated successfully'
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating project'
    });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id }
    });

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Log activity before deleting so the projectId FK still resolves
    await prisma.activityLog.create({
      data: {
        userId: req.user.userId,
        action: 'deleted',
        targetType: 'project',
        targetId: id,
        projectId: id,
        description: `Deleted project: ${existingProject.name}`
      }
    });

    // Delete project
    await prisma.project.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting project'
    });
  }
};

// Get project statistics
const getProjectStats = async (req, res) => {
  try {
    // Get counts by status
    const statusCounts = await prisma.project.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    // Get total projects
    const total = await prisma.project.count();
    
    // Get counts by category
    const categoryCounts = await prisma.project.groupBy({
      by: ['category'],
      _count: {
        id: true
      }
    });

    // Format status counts
    const stats = {
      total,
      byStatus: {
        ACTIVE: 0,
        COMPLETED: 0,
        PENDING: 0
      },
      byCategory: {}
    };

    statusCounts.forEach(row => {
      stats.byStatus[row.status] = row._count.id;
    });

    categoryCounts.forEach(row => {
      stats.byCategory[row.category] = row._count.id;
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching statistics'
    });
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats
};