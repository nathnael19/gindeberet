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
  gallery?: string[];
  createdAt?: string;
  updatedAt?: string;
}
