
export interface Service {
  id: string;
  category: string;
  name: string;
  price: number;
  description: string;
}

export type UserRole = 'MASTER' | 'ADMIN';

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  name: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  image: string;
  category: string;
  link?: string;
  appName?: string;
}

export interface SliderItem {
  id: string;
  text: string;
  image: string;
}

export interface AppConfig {
  companyName: string;
  logoInitial: string;
  logoUrl?: string;
  regNo: string;
  tradeMark?: string;
  regAddress: string;
  serviceAddress: string;
  adminPhone: string;
  businessHead: string;
  techHead: string;
  techHeadPhone: string;
  services: Service[];
  users: User[];
  portfolio: PortfolioItem[];
  sliderItems: SliderItem[];
}

export interface Inquiry {
  id: string;
  clientName: string;
  phone: string;
  email: string;
  serviceId: string;
  description: string;
  images: string[];
  paymentDone: number;
  status: 'Pending' | 'In Progress' | 'Completed';
  solutionText?: string;
  timestamp: number;
}

export enum AppRoute {
  HOME = 'home',
  ADMIN = 'admin',
  LOGIN = 'login'
}
