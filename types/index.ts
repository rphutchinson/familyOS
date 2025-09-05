export interface Provider {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending';
  joinDate: string;
  patientsCount: number;
}

export interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  providerId: string;
  lastVisit: string;
  status: 'active' | 'inactive';
}

export interface DashboardStats {
  totalProviders: number;
  activeProviders: number;
  totalPatients: number;
  appointmentsToday: number;
}

export interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
}