const bcrypt = require('bcryptjs');
const prisma = require('./database');

async function seed() {
  try {
    console.log('Starting database seeding...');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = await prisma.adminUser.upsert({
      where: { email: 'admin@gindeberet.com' },
      update: {},
      create: {
        email: 'admin@gindeberet.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'SUPER_ADMIN'
      }
    });

    console.log('Admin user created/updated');

    // Create default site settings
    await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        officeLocation: '123 Industrial Way, Builder City, BC 12345',
        phone: '(555) 123-4567',
        workingHours: 'Mon-Fri, 8am-6pm',
        email: 'info@gindeberet.com',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=9.0244,38.7469'
      }
    });

    console.log('Default site settings created');

    // Create sample projects
    const sampleProjects = [
      {
        id: 'PRJ001',
        name: 'Commercial Complex',
        client: 'ABC Corporation',
        status: 'COMPLETED',
        budget: '$150,000',
        location: 'Addis Ababa',
        category: 'Commercial',
        duration: '6 months',
        year: '2024',
        description: 'Modern commercial complex with office spaces and retail units',
        challenge: 'Delivering a commercial complex on a tight urban plot while keeping existing tenant operations running throughout construction.',
        solution: 'Phased construction with nighttime logistics, prefabricated facade panels, and a dedicated pedestrian walkway to isolate active zones from work zones.',
        highlights: ['LEED Silver design', 'Zero lost-time incidents', 'Delivered 2 weeks early'],
        image: null,
        createdBy: adminUser.id
      },
      {
        id: 'PRJ002',
        name: 'Residential Villa',
        client: 'John Doe',
        status: 'ACTIVE',
        budget: '$85,000',
        location: 'Bole',
        category: 'Residential',
        duration: '4 months',
        year: '2024',
        description: 'Luxury residential villa with modern amenities',
        challenge: 'Building on a narrow sloped plot with soft-soil conditions and strict height restrictions from the local zoning code.',
        solution: 'Deep foundation piling paired with a stepped structural frame that follows the terrain, keeping the villa within height limits.',
        highlights: ['Smart home integration', 'Rammed earth feature walls'],
        image: null,
        createdBy: adminUser.id
      },
      {
        id: 'PRJ003',
        name: 'Office Building',
        client: 'Tech Solutions',
        status: 'ACTIVE',
        budget: '$200,000',
        location: 'Kazanchis',
        category: 'Commercial',
        duration: '8 months',
        year: '2024',
        description: 'Multi-story office building for tech company',
        challenge: 'Fast-tracked delivery required for lease start, with limited street access for material staging in a dense business district.',
        solution: 'Off-site prefabrication of structural steel and MEP modules, with just-in-time deliveries scheduled during off-peak hours.',
        highlights: ['14-month build in 11 months', 'Open-plan flexible floors'],
        image: null,
        createdBy: adminUser.id
      },
      {
        id: 'PRJ004',
        name: 'Apartment Complex',
        client: 'Real Estate Co',
        status: 'PENDING',
        budget: '$350,000',
        location: 'Megenagna',
        category: 'Residential',
        duration: '12 months',
        year: '2024',
        description: 'Modern apartment complex with 50 units',
        challenge: 'Coordinating 50 residential units plus shared amenities while managing public utility relocations on the project site.',
        solution: 'Early engagement with utility providers, dual-tower construction sequence, and a shared amenities core built first to serve both phases.',
        highlights: ['50 residential units', 'Shared rooftop amenity deck'],
        image: null,
        createdBy: adminUser.id
      },
      {
        id: 'PRJ005',
        name: 'Shopping Mall',
        client: 'Retail Group',
        status: 'COMPLETED',
        budget: '$500,000',
        location: 'Bahrain',
        category: 'Commercial',
        duration: '18 months',
        year: '2024',
        description: 'Large shopping mall with entertainment facilities',
        challenge: 'A complex phasing challenge: opening retail anchors before the entertainment wing was complete, with 40+ tenant fit-outs running in parallel.',
        solution: 'A rolling handover schedule with zoned MEP isolation so anchors traded early while construction continued in other wings without cross-contamination.',
        highlights: ['40+ tenant fit-outs', '6 cinema screens'],
        image: null,
        createdBy: adminUser.id
      }
    ];

    for (const project of sampleProjects) {
      await prisma.project.upsert({
        where: { id: project.id },
        update: {},
        create: project
      });
    }

    console.log('Sample projects created');

    // Create sample activity logs
    const activities = [
      {
        userId: adminUser.id,
        action: 'created',
        targetType: 'project',
        targetId: 'PRJ001',
        description: 'Created project: Commercial Complex'
      },
      {
        userId: adminUser.id,
        action: 'created',
        targetType: 'project',
        targetId: 'PRJ002',
        description: 'Created project: Residential Villa'
      },
      {
        userId: adminUser.id,
        action: 'updated',
        targetType: 'project',
        targetId: 'PRJ003',
        description: 'Updated project: Office Building'
      },
      {
        userId: adminUser.id,
        action: 'created',
        targetType: 'project',
        targetId: 'PRJ004',
        description: 'Created project: Apartment Complex'
      }
    ];

    for (const activity of activities) {
      await prisma.activityLog.create({
        data: activity
      });
    }

    console.log('Sample activity logs created');
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Seeding error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed();