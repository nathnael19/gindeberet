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