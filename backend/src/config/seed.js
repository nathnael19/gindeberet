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
      update: {
        officeLocation: 'Near Global Hotel Lancha\nAddis Ababa, Ethiopia',
        phone: '+251 11 000 0000',
        workingHours: 'Mon-Fri, 8:00am-6:00pm',
        email: 'info@gindeberet.com',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=8.9935718,38.7598685'
      },
      create: {
        id: 1,
        officeLocation: 'Near Global Hotel Lancha\nAddis Ababa, Ethiopia',
        phone: '+251 11 000 0000',
        workingHours: 'Mon-Fri, 8:00am-6:00pm',
        email: 'info@gindeberet.com',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=8.9935718,38.7598685'
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

    const activityCount = await prisma.activityLog.count();
    if (activityCount === 0) {
      for (const activity of activities) {
        await prisma.activityLog.create({ data: activity });
      }
      console.log('Sample activity logs created');
    } else {
      console.log('Sample activity logs skipped (already present)');
    }

    const sampleVacancies = [
      {
        title: 'Site Engineer',
        department: 'Operations',
        location: 'Addis Ababa',
        employmentType: 'Full-time',
        description:
          'Lead day-to-day site execution for road and civil packages, coordinating crews, quality, and safety.',
        requirements:
          'BSc in Civil Engineering\n3+ years site experience\nStrong safety mindset\nAmharic and English',
        status: 'OPEN',
      },
      {
        title: 'Quantity Surveyor',
        department: 'Commercial',
        location: 'Addis Ababa',
        employmentType: 'Full-time',
        description:
          'Prepare BOQs, track variations, and support cost control across active infrastructure projects.',
        requirements:
          'Diploma or degree in QS / Construction Management\n2+ years experience\nExcel proficiency',
        status: 'OPEN',
      },
    ];

    for (const vacancy of sampleVacancies) {
      const existing = await prisma.jobVacancy.findFirst({ where: { title: vacancy.title } });
      if (!existing) {
        await prisma.jobVacancy.create({ data: vacancy });
      }
    }
    console.log('Sample vacancies created');

    // Landing page content (only seed when empty so admin edits are kept)
    if ((await prisma.partner.count()) === 0) {
      await prisma.partner.createMany({
        data: [
          { name: 'Ethiopian Roads Authority' },
          { name: 'Addis Ababa City Admin' },
          { name: 'Commercial Bank of Ethiopia' },
        ],
      });
    }

    if ((await prisma.safetyFeature.count()) === 0) {
      await prisma.safetyFeature.createMany({
        data: [
          {
            title: 'Zero-harm sites',
            description: 'Daily toolbox talks, PPE enforcement, and supervised high-risk work.',
            icon: '✓',
          },
          {
            title: 'Environmental care',
            description: 'Dust control, waste segregation, and responsible material sourcing.',
            icon: '🌿',
          },
          {
            title: 'Quality assurance',
            description: 'Inspected work packages with traceable checklists at every stage.',
            icon: '◆',
          },
        ],
      });
    }

    if ((await prisma.testimonial.count()) === 0) {
      await prisma.testimonial.createMany({
        data: [
          {
            authorName: 'Abebe Kebede',
            authorTitle: 'Project Owner',
            text: 'Gindeberet delivered on schedule with clear communication from foundation to handover.',
          },
          {
            authorName: 'Sara Hailu',
            authorTitle: 'Facilities Manager',
            text: 'Professional crew, tidy sites, and finishes that matched the drawings.',
          },
          {
            authorName: 'Getachew Tulu',
            authorTitle: 'Jimma Zone Roads & Logistics',
            text: 'Their bridge and road packages were disciplined on programme. Traffic staging stayed clear and handover documents were complete.',
          },
          {
            authorName: 'Aster Mentwab',
            authorTitle: 'Oromia Construction Works Corporation',
            text: 'From mobilization to finishing, Gindeberet kept quality checks visible. We trust them on water and building packages alike.',
          },
          {
            authorName: 'Daniel Bekele',
            authorTitle: 'Shaggar City Project Office',
            text: 'Corridor works demand coordination with many stakeholders — their site team communicated early and closed issues without drama.',
          },
          {
            authorName: 'Hiwot Alemu',
            authorTitle: 'Woreda Health Office Representative',
            text: 'The health office and related buildings were delivered to a standard we can operate from day one. Clean site, clear schedule.',
          },
        ],
      });
    }

    if ((await prisma.teamMember.count()) === 0) {
      await prisma.teamMember.createMany({
        data: [
          { name: 'Tadesse Bekele', position: 'Managing Director' },
          { name: 'Hanna Lemma', position: 'Head of Operations' },
          { name: 'Yonas Alemu', position: 'Chief Engineer' },
        ],
      });
    }

    if ((await prisma.award.count()) === 0) {
      await prisma.award.createMany({
        data: [
          {
            title: 'Safety Excellence',
            description: 'Recognized for zero lost-time incidents across active packages.',
            icon: '🏆',
          },
          {
            title: 'On-time Delivery',
            description: 'Consistently completing civil works within agreed programmes.',
            icon: '★',
          },
        ],
      });
    }

    if ((await prisma.newsItem.count()) === 0) {
      await prisma.newsItem.createMany({
        data: [
          {
            title: 'New road package underway',
            date: 'March 2026',
            category: 'news',
            excerpt: 'Mobilization started for a new urban connector corridor in West Shewa.',
            imageUrl: '/images/hero.jpg',
            sortOrder: 1,
          },
          {
            title: 'Careers: site engineers wanted',
            date: 'February 2026',
            category: 'announcement',
            excerpt: 'We are hiring site engineers and quantity surveyors for active projects.',
            linkUrl: '/careers',
            imageUrl: '/images/about.jpg',
            sortOrder: 2,
          },
        ],
      });
    }

    if ((await prisma.officeFacility.count()) === 0) {
      await prisma.officeFacility.createMany({
        data: [
          {
            title: 'Head Office — Addis Ababa',
            description: 'Near Global Hotel Lancha. Coordination, contracts, and client meetings.',
            imageUrl:
              'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
            sortOrder: 0,
          },
          {
            title: 'Planning & Engineering Room',
            description: 'Programme control, drawings, and method statements before site launch.',
            imageUrl:
              'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80',
            sortOrder: 1,
          },
          {
            title: 'Equipment Yard',
            description: 'Plant staging and maintenance that keep mobilization on schedule.',
            imageUrl:
              'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=900&q=80',
            sortOrder: 2,
          },
          {
            title: 'Materials Store',
            description: 'Controlled storage for materials that feed active work packages.',
            imageUrl:
              'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=80',
            sortOrder: 3,
          },
          {
            title: 'Active Project Sites',
            description: 'Field execution across roads, buildings, water, and corridor works.',
            imageUrl:
              'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80',
            sortOrder: 4,
          },
        ],
      });
    }

    console.log('Sample landing content ensured');

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Seeding error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed();