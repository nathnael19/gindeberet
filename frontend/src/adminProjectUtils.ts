import { type AdminProject } from './adminData';
import { type Project } from './ProjectDetail';

export function adminProjectToDetail(p: AdminProject): Project {
  return {
    id: Number(p.id),
    title: p.name,
    category: p.category,
    image: p.image,
    description: p.description || 'No description available.',
    client: p.client,
    location: p.location,
    duration: p.duration,
    value: p.budget,
    year: p.year,
    status: p.status.charAt(0).toUpperCase() + p.status.slice(1),
    challenge: p.challenge,
    solution: p.solution,
    highlights: p.highlights,
    gallery: p.gallery && p.gallery.length > 0 ? p.gallery : p.image ? [p.image] : undefined,
  };
}
