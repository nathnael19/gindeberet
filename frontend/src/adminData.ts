export type ProjectStatus = 'active' | 'completed' | 'pending';

export interface AdminProject {
  id: string;
  name: string;
  client: string;
  status: ProjectStatus;
  budget: string;
  location: string;
  category: string;
  duration: string;
  year: string;
  description: string;
  image: string;
}

export const ALL_PROJECTS: AdminProject[] = [
  {
    id: 'PRJ-1023',
    name: 'Highway 401 Expansion',
    client: 'Ministry of Transport',
    status: 'completed',
    budget: '$42M',
    location: 'Greater Metro Area',
    category: 'Roads',
    duration: '18 Months',
    year: '2023',
    description: 'Major highway expansion including 3 new lanes and 2 overpasses, completed 3 months ahead of schedule.',
    image: 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'PRJ-1024',
    name: 'Metro Transit Corridor',
    client: 'City Transit Authority',
    status: 'completed',
    budget: '$115M',
    location: 'Downtown to Eastside',
    category: 'Corridors',
    duration: '28 Months',
    year: '2022',
    description: '15km dedicated transit corridor with 8 new stations and smart traffic management systems.',
    image: 'https://images.unsplash.com/photo-1474487548417-781cb6d646df?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'PRJ-1025',
    name: 'Downtown Utility Upgrade',
    client: 'City Waterworks Dept.',
    status: 'completed',
    budget: '$28M',
    location: 'Central Business District',
    category: 'Infrastructure',
    duration: '14 Months',
    year: '2023',
    description: 'Complete replacement of century-old water and sewer mains serving 80,000 residents.',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'PRJ-1026',
    name: 'River Bridge Rehabilitation',
    client: 'Regional Roads Board',
    status: 'completed',
    budget: '$67M',
    location: 'Northgate River Crossing',
    category: 'Bridges',
    duration: '22 Months',
    year: '2021',
    description: 'Structural reinforcement and full deck replacement of a 90-year-old heritage bridge.',
    image: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'PRJ-1027',
    name: 'Valley Parkway',
    client: 'Parks & Recreation Dept.',
    status: 'completed',
    budget: '$19M',
    location: 'Green Valley Corridor',
    category: 'Roads',
    duration: '16 Months',
    year: '2024',
    description: 'New 8km scenic parkway through an environmentally sensitive valley with recycled asphalt.',
    image: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'PRJ-1028',
    name: 'Industrial Park Grid',
    client: 'Eastport Development Corp.',
    status: 'active',
    budget: '$54M',
    location: 'Eastport Industrial Zone',
    category: 'Infrastructure',
    duration: '20 Months',
    year: '2024',
    description: 'High-capacity water distribution network for a 500-acre greenfield manufacturing hub.',
    image: 'https://images.unsplash.com/photo-1541888086425-d81bb19240f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
];
