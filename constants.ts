
import { AppConfig } from './types';

export const DEFAULT_CONFIG: AppConfig = {
  companyName: "EGINTECH",
  logoInitial: "E",
  logoUrl: "",
  regNo: "PENDING-REG",
  tradeMark: "",
  regAddress: "Enter Registered Address",
  serviceAddress: "Enter Service Address",
  adminPhone: "9934490025",
  businessHead: "Owner",
  techHead: "Lead Tech",
  techHeadPhone: "",
  services: [
    { id: 'sw1', category: 'Website Designing', name: 'Static Informatic Website', price: 5000, description: 'Clean, fast, and informative static site for your business.' },
    { id: 'sw2', category: 'Website Designing', name: 'Dynamic Informatic Website', price: 7500, description: 'Interactive site with content management capabilities.' },
    { id: 'sw3', category: 'Website Designing', name: 'Static E-commerce Website', price: 15000, description: 'Basic online store setup with payment links.' },
    { id: 'sw4', category: 'Website Designing', name: 'Dynamic E-commerce Website', price: 25000, description: 'Full-featured online store with inventory and cart management.' },
    { id: 'sd1', category: 'Software Development', name: 'Software/Mobile App', price: 50000, description: 'Custom software or cross-platform mobile application development.' },
    { id: 'ed1', category: 'Services and Education', name: 'Education-Career Guidance', price: 100, description: 'Professional advice for your academic and career path.' },
    { id: 'ed2', category: 'Services and Education', name: 'Question Paper Generation', price: 500, description: '1 full set (all subjects) or 5 sets (single subject).' },
    { id: 'ed3', category: 'Services and Education', name: 'DMIT Test', price: 1000, description: 'Dermatoglyphics Multiple Intelligence Test for career mapping.' },
    { id: 'ed4', category: 'Services and Education', name: 'Health-Fitness Guidance', price: 100, description: 'Personalized wellness and nutrition advice.' },
    { id: 'ed5', category: 'Services and Education', name: 'Any Report Analysis', price: 100, description: 'Expert technical or business report breakdown.' },
  ],
  users: [
    { id: 'm1', username: 'master', password: 'password123', role: 'MASTER', name: 'Master Admin' }
  ],
  portfolio: [
    { id: 'sample1', title: 'E-commerce Platform', category: 'Web Design', image: 'https://picsum.photos/seed/web1/800/450' },
    { id: 'sample2', title: 'Educational Portal', category: 'Software', image: 'https://picsum.photos/seed/soft1/800/450' }
  ],
  sliderItems: [
    { id: 's1', text: "Join us for Excellent Growth", image: "https://picsum.photos/seed/growth/1600/600" },
    { id: 's2', text: "Low Cost - High Quality", image: "https://picsum.photos/seed/quality/1600/600" },
    { id: 's3', text: "5+1 Free Scheme", image: "https://picsum.photos/seed/offer/1600/600" },
    { id: 's4', text: "Assured Gift for Everyone", image: "https://picsum.photos/seed/gift/1600/600" },
  ]
};
