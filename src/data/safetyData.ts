import { useState, useEffect, useCallback } from 'react';

export interface District {
  id: string;
  name: { en: string; ar: string; fr: string };
  risk: 'critical' | 'high' | 'moderate' | 'low';
  bounds: [number, number][];
}

export interface Alert {
  id: string;
  type: 'danger' | 'warning' | 'info' | 'airstrike' | 'road_closure';
  location: string;
  districtId: string;
  message: string;
  timestamp: string;
  coordinates: [number, number];
  verified: boolean;
  isUserReported?: boolean;
}

export interface EssentialService {
  id: string;
  type: 'hospital' | 'bakery' | 'pharmacy' | 'fuel' | 'tools' | 'ngo' | 'food_water';
  name: string;
  coordinates: [number, number];
  status: 'open' | 'closed' | 'limited';
  aidType?: 'food' | 'medical' | 'shelter' | 'multi';
  hours?: string;
}

export const districts: District[] = [
  { id: 'beirut', name: { en: 'Beirut', ar: 'بيروت', fr: 'Beyrouth' }, risk: 'moderate', bounds: [[33.88, 35.47], [33.91, 35.53]] },
  { id: 'dahieh', name: { en: 'Dahieh', ar: 'الضاحية', fr: 'Dahieh' }, risk: 'critical', bounds: [[33.83, 35.48], [33.87, 35.52]] },
  { id: 'tyre', name: { en: 'Tyre', ar: 'صور', fr: 'Tyr' }, risk: 'critical', bounds: [[33.25, 35.18], [33.29, 35.22]] },
  { id: 'nabatieh', name: { en: 'Nabatieh', ar: 'النبطية', fr: 'Nabatieh' }, risk: 'critical', bounds: [[33.36, 35.46], [33.40, 35.50]] },
  { id: 'tripoli', name: { en: 'Tripoli', ar: 'طرابلس', fr: 'Tripoli' }, risk: 'low', bounds: [[34.42, 35.81], [34.46, 35.86]] },
  { id: 'saida', name: { en: 'Saida', ar: 'صيدا', fr: 'Saïda' }, risk: 'high', bounds: [[33.54, 35.35], [33.58, 35.39]] },
  { id: 'baalbek', name: { en: 'Baalbek', ar: 'بعلبك', fr: 'Baalbek' }, risk: 'critical', bounds: [[33.99, 36.18], [34.03, 36.22]] },
  { id: 'jounieh', name: { en: 'Jounieh', ar: 'جونية', fr: 'Jounieh' }, risk: 'low', bounds: [[33.97, 35.61], [34.01, 35.65]] },
];

export const initialAlerts: Alert[] = [
  { id: '1', type: 'danger', location: 'Haret Hreik', districtId: 'dahieh', message: 'Confirmed Air Strike - Avoid Area', timestamp: '2m', coordinates: [33.848, 35.505], verified: true },
  { id: '2', type: 'warning', location: 'Tyre Coast', districtId: 'tyre', message: 'Heavy Shelling Reported', timestamp: '15m', coordinates: [33.271, 35.196], verified: true },
  { id: '3', type: 'danger', location: 'Baalbek Center', districtId: 'baalbek', message: 'Immediate Evacuation Order', timestamp: '5m', coordinates: [34.006, 36.202], verified: true },
  { id: '4', type: 'info', location: 'Saida North', districtId: 'saida', message: 'Road Blockage - Use Alternate Route', timestamp: '45m', coordinates: [33.572, 35.381], verified: false },
];

export const essentialServices: EssentialService[] = [
  { id: 'h1', type: 'hospital', name: 'AUH Beirut', coordinates: [33.898, 35.481], status: 'open' },
  { id: 'h2', type: 'hospital', name: 'Nabatieh Govt Hospital', coordinates: [33.378, 35.484], status: 'limited' },
  { id: 'h3', type: 'hospital', name: 'Hotel Dieu de France', coordinates: [33.882, 35.518], status: 'open' },
  { id: 'b1', type: 'bakery', name: 'Wooden Bakery Saida', coordinates: [33.561, 35.372], status: 'open' },
  { id: 'p1', type: 'pharmacy', name: 'Mazloum Pharmacy Tripoli', coordinates: [34.436, 35.835], status: 'open' },
  { id: 'f1', type: 'fuel', name: 'Medco Jounieh', coordinates: [33.982, 35.621], status: 'open' },
  { id: 't1', type: 'tools', name: 'Hardware Store Aley', coordinates: [33.806, 35.601], status: 'open' },
  // NGOs & Aid Centers
  { id: 'lrc1', type: 'ngo', name: 'LRC Health Center - Baouchriyeh', coordinates: [33.885, 35.552], status: 'open', aidType: 'medical', hours: '24/7' },
  { id: 'lrc2', type: 'ngo', name: 'LRC Health Center - Nabatiyeh', coordinates: [33.375, 35.482], status: 'open', aidType: 'medical', hours: '24/7' },
  { id: 'lrc3', type: 'ngo', name: 'LRC Health Center - Saida', coordinates: [33.565, 35.375], status: 'open', aidType: 'medical', hours: '24/7' },
  { id: 'amel1', type: 'ngo', name: 'Amel Community Center - Haret Hreik', coordinates: [33.845, 35.502], status: 'limited', aidType: 'multi', hours: '08:00 - 16:00' },
  { id: 'amel2', type: 'ngo', name: 'Amel Community Center - Tyre', coordinates: [33.272, 35.203], status: 'open', aidType: 'multi', hours: '08:00 - 16:00' },
  { id: 'caritas1', type: 'ngo', name: 'Caritas Center - Akkar', coordinates: [34.545, 36.078], status: 'open', aidType: 'food', hours: '09:00 - 17:00' },
  { id: 'caritas2', type: 'ngo', name: 'Caritas Center - Zahle', coordinates: [33.848, 35.902], status: 'open', aidType: 'shelter', hours: '09:00 - 17:00' },
  { id: 'unrwa1', type: 'ngo', name: 'UNRWA Shelter - Siblin', coordinates: [33.625, 35.452], status: 'open', aidType: 'shelter', hours: '24/7' },
  { id: 'unrwa2', type: 'ngo', name: 'UNRWA Shelter - Nahr el-Bared', coordinates: [34.512, 35.965], status: 'limited', aidType: 'shelter', hours: '24/7' },
  { id: 'dist1', type: 'food_water', name: 'WFP Food Distribution - Tyre', coordinates: [33.275, 35.205], status: 'open', hours: '08:00 - 14:00' },
  { id: 'dist2', type: 'food_water', name: 'Water Tanker Point - Dahieh', coordinates: [33.852, 35.508], status: 'open', hours: '07:00 - 19:00' },
  { id: 'dist3', type: 'food_water', name: 'Community Kitchen - Tripoli', coordinates: [34.438, 35.838], status: 'open', hours: '12:00 - 15:00' },
];

// Comprehensive list of Lebanese villages/towns for search
export const lebanonLocations = [
  { name: 'Beirut', ar: 'بيروت', fr: 'Beyrouth', coords: [33.8938, 35.5018] },
  { name: 'Tripoli', ar: 'طرابلس', fr: 'Tripoli', coords: [34.4333, 35.8333] },
  { name: 'Saida', ar: 'صيدا', fr: 'Saïda', coords: [33.5631, 35.3689] },
  { name: 'Tyre', ar: 'صور', fr: 'Tyr', coords: [33.2708, 35.1962] },
  { name: 'Nabatieh', ar: 'النبطية', fr: 'Nabatieh', coords: [33.3789, 35.4839] },
  { name: 'Baalbek', ar: 'بعلبك', fr: 'Baalbek', coords: [34.0061, 36.2021] },
  { name: 'Jounieh', ar: 'جونية', fr: 'Jounieh', coords: [33.9811, 35.6172] },
  { name: 'Zahle', ar: 'زحلة', fr: 'Zahlé', coords: [33.8439, 35.9072] },
  { name: 'Byblos', ar: 'جبيل', coords: [34.1231, 35.6519] },
  { name: 'Aley', ar: 'عاليه', coords: [33.8061, 35.6014] },
  { name: 'Bint Jbeil', ar: 'بنت جبيل', coords: [33.1219, 35.4356] },
  { name: 'Khiam', ar: 'الخيام', coords: [33.3167, 35.6083] },
  { name: 'Marjayoun', ar: 'مرجعيون', coords: [33.3556, 35.5917] },
  { name: 'Arsal', ar: 'عرسال', coords: [34.1833, 36.4167] },
  { name: 'Hermel', ar: 'الهرمل', coords: [34.3939, 36.3847] },
  { name: 'Rachaya', ar: 'راشيا', coords: [33.5014, 35.8444] },
  { name: 'Hasbaya', ar: 'حاصبيا', coords: [33.3972, 35.6861] },
  { name: 'Bcharre', ar: 'بشري', coords: [34.2508, 36.0111] },
  { name: 'Jezzine', ar: 'جزين', coords: [33.5417, 35.5847] },
  { name: 'Baabda', ar: 'بعبدا', coords: [33.8339, 35.5439] },
  { name: 'Haret Hreik', ar: 'حارة حريك', coords: [33.848, 35.505] },
  { name: 'Ghobeiry', ar: 'الغبيري', coords: [33.858, 35.501] },
  { name: 'Bourj el-Barajneh', ar: 'برج البراجنة', coords: [33.838, 35.502] },
  { name: 'Naqoura', ar: 'الناقورة', coords: [33.12, 35.13] },
  { name: 'Ansar', ar: 'أنصار', coords: [33.33, 35.43] },
  { name: 'Kfar Kila', ar: 'كفركلا', coords: [33.33, 35.55] },
  { name: 'Meiss el Jabal', ar: 'ميس الجبل', coords: [33.25, 35.51] },
  { name: 'Damour', ar: 'الدامور', coords: [33.7333, 35.45] },
  { name: 'Chekka', ar: 'شكا', coords: [34.3333, 35.7167] },
  { name: 'Zgharta', ar: 'زغرتا', coords: [34.3986, 35.8939] },
  { name: 'Batroun', ar: 'البترون', coords: [34.2553, 35.6581] },
];

export function useSafetyData() {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [services, setServices] = useState<EssentialService[]>(essentialServices);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      // In a real app, this would fetch from an API or Telegram feed
      console.log('Fetching live safety data updates...');
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const addAlert = useCallback((newAlert: Omit<Alert, 'id' | 'timestamp' | 'verified'>) => {
    const alert: Alert = {
      ...newAlert,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: 'Just now',
      verified: false,
    };
    setAlerts(prev => [alert, ...prev]);
  }, []);

  return {
    districts,
    alerts,
    services,
    addAlert,
    locations: lebanonLocations
  };
}
