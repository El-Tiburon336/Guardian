import React, { useState, useEffect, useMemo, Fragment, useCallback, useRef } from 'react';
import { 
  Phone,
  MessageSquare,
  LifeBuoy,
  ShieldAlert, 
  Search, 
  Navigation, 
  AlertTriangle, 
  Menu, 
  X, 
  Zap, 
  Hospital, 
  Home, 
  Fuel, 
  Utensils, 
  Shield, 
  Activity, 
  MapPin, 
  WifiOff, 
  Sun, 
  Moon, 
  Settings as SettingsIcon, 
  Pill, 
  Wrench,
  Share2,
  BatteryLow,
  CheckCircle2,
  QrCode,
  Info,
  ShieldCheck,
  HandHeart,
  Flame,
  Package,
  Construction,
  Fence,
  Waves,
  Video,
  PhoneOutgoing,
  ChevronRight
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { QRCodeCanvas } from 'qrcode.react';
import { motion, AnimatePresence, useAnimation } from 'motion/react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Polyline, 
  useMap,
  useMapEvents,
  Circle
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import MarkerClusterGroup from 'react-leaflet-cluster';

// Centralized Data Hook
import { useSafetyData, Alert, District, EssentialService } from './data/safetyData';

// Types
type Language = 'en' | 'ar' | 'fr';
type Theme = 'dark' | 'light';

const LanguageContext = React.createContext<{
  language: Language;
  setLanguage: (lang: Language) => void;
  t: any;
  isRTL: boolean;
} | null>(null);

const useLanguage = () => {
  const context = React.useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};

const TRANSLATIONS: Record<Language, any> = {
  en: {
    name: "Guardian",
    safetyStatus: "Safety Status",
    findSafestPath: "Find Safest Path",
    reportDanger: "Report Danger",
    emergency: "EMERGENCY",
    searchPlaceholder: "Search village, city or address...",
    offlineReady: "Offline Ready",
    liveSafetyFeed: "Live Safety Feed",
    lowBandwidth: "Low Bandwidth Mode",
    optimized3G: "Optimized for 3G networks",
    startPoint: "Start Point",
    destination: "Destination",
    selectDistrict: "Select District",
    report: "REPORT",
    routing: "ROUTING...",
    submitReport: "SUBMIT REPORT",
    dangerType: "Select Danger Type",
    details: "Additional Details (Optional)",
    describe: "Describe the situation...",
    noResults: "No results found",
    verified: "Verified",
    nnaVerified: "✓ Verified (NNA)",
    communityReport: "⚠️ Community Report",
    foodWater: "Food/Water Distribution",
    safeCorridor: "Safe Corridor",
    lowPower: "Low Power Mode",
    lowPowerDesc: "Disables map animations to save battery",
    share: "Share Safe Route",
    shareApp: "Share Guardian App",
    shareSuccess: "Link copied to clipboard!",
    welcomeTitle: "Welcome to Guardian",
    welcomeMessage: "Our priority is 'Security over Speed'. We calculate routes based on real-time safety data, not just the shortest distance. Stay safe.",
    settings: "Settings",
    language: "Language",
    theme: "Appearance",
    allResources: "All Resources",
    airstrikes: "Airstrikes",
    hospitals: "Hospitals",
    bakeries: "Bakeries",
    pharmacies: "Pharmacies",
    fuel: "Fuel Stations",
    tools: "Tools",
    ngo: "NGOs/Aid",
    requestAid: "Request Humanitarian Aid",
    aidType: "Aid Type",
    food: "Food",
    medical: "Medical",
    shelter: "Shelter",
    multi: "Multi-Aid",
    hours: "Operational Hours",
    close: "Close",
    understand: "I Understand",
    scanQR: "Scan this code to open Guardian on another device",
    showQR: "Show QR",
    offlineShare: "Share with others offline",
    dangerZone: "DANGER ZONE",
    dangerLevel: "Danger Level",
    airstrike: "Airstrike/Shelling",
    emergencyContacts: "EMERGENCY CONTACTS",
    lrc: "Red Cross",
    civilDefense: "Civil Defense",
    shareLocation: "Share My Location",
    whatsappMessage: "Emergency! My current location is: ",
    verified_ago: "Verified {time} ago",
    reported_ago: "Reported {time} ago",
    userVerified: "Community Verified",
    operational: "Operational",
    limited: "Limited Service",
    closed: "Closed",
    lrcEmergency: "LRC Emergency: 140",
    iAmSafe: "I am Safe",
    iAmSafeMessage: "I am safe! My current location is: ",
    roadStatus: "Road Status",
    roadClosure: "Road Closure",
    verifiedISF: "✓ Verified (ISF)",
    communityAlert: "⚠️ Community Alert",
    earthquakes: "Earthquakes",
    seismicAlert: "SEISMIC ALERT",
    seismicInstructions: "Drop, Cover, and Hold On",
    magnitude: "Magnitude",
    richter: "Richter",
    workingOffline: "Working Offline",
    survivalGuide: "Survival Guide",
    earthquakeSafety: "Earthquake Safety",
    gasLeakSafety: "Gas Leak Safety",
    gasLeakInstructions: "If you smell gas: Open windows, do not use switches, leave immediately.",
    safetyDisclaimerTitle: "Safety Disclaimer",
    safetyDisclaimerMessage: "This app provides safety data for informational purposes only. Always prioritize local authorities' instructions. Stay safe.",
    videoCall: "Video Call",
    shareCallLink: "Share Call Link",
    hangUp: "Hang Up",
    emergencyVideoCall: "Emergency Video Call",
    districts: {
      dahieh: "Dahieh",
      beirut: "Beirut",
      tyre: "Tyre",
      nabatieh: "Nabatieh",
      tripoli: "Tripoli",
      saida: "Saida",
      baalbek: "Baalbek",
      jounieh: "Jounieh"
    }
  },
  ar: {
    name: "الحارس",
    safetyStatus: "حالة الأمان",
    reportDanger: "بلغ عن خطر",
    emergency: "طوارئ",
    searchPlaceholder: "ابحث عن قرية، مدينة أو عنوان...",
    offlineReady: "جاهز للعمل دون اتصال",
    liveSafetyFeed: "بلاغات الأمان المباشرة",
    lowBandwidth: "وضع النطاق الترددي المنخفض",
    optimized3G: "محسن لشبكات 3G",
    startPoint: "نقطة البداية",
    destination: "الوجهة",
    selectDistrict: "اختر المنطقة",
    report: "تبليغ",
    routing: "جاري التوجيه...",
    submitReport: "إرسال التقرير",
    dangerType: "اختر نوع الخطر",
    details: "تفاصيل إضافية (اختياري)",
    describe: "صف الموقف...",
    noResults: "لم يتم العثور على نتائج",
    verified: "تم التحقق",
    nnaVerified: "موثوق (NNA) ✓",
    communityReport: "بلاغ مجتمعي ⚠️",
    foodWater: "توزيع طعام/ماء",
    safeCorridor: "ممر آمن",
    lowPower: "وضع توفير الطاقة",
    lowPowerDesc: "يعطل الرسوم المتحركة لتوفير البطارية",
    share: "مشاركة الطريق الآمن",
    shareApp: "مشاركة تطبيق الحارس",
    shareSuccess: "تم نسخ الرابط!",
    welcomeTitle: "مرحباً بك في الحارس",
    welcomeMessage: "أولويتنا هي 'الأمان قبل السرعة'. نقوم بحساب الطرق بناءً على بيانات الأمان في الوقت الفعلي، وليس فقط المسافة الأقصر. ابقَ آمناً.",
    settings: "الإعدادات",
    language: "اللغة",
    theme: "المظهر",
    allResources: "جميع الموارد",
    airstrikes: "غارات جوية",
    hospitals: "مشافي",
    bakeries: "أفران",
    pharmacies: "صيدليات",
    fuel: "محطات وقود",
    tools: "أدوات",
    ngo: "منظمات",
    requestAid: "طلب مساعدات إنسانية",
    aidType: "نوع المساعدة",
    food: "طعام",
    medical: "طبي",
    shelter: "مأوى",
    multi: "مساعدات متعددة",
    hours: "ساعات العمل",
    close: "إغلاق",
    understand: "أفهم ذلك",
    scanQR: "امسح هذا الرمز لفتح الحارس على جهاز آخر",
    showQR: "عرض الرمز",
    offlineShare: "مشاركة مع الآخرين دون اتصال",
    dangerZone: "منطقة خطر",
    dangerLevel: "مستوى الخطر",
    airstrike: "غارة جوية / قصف",
    emergencyContacts: "جهات اتصال الطوارئ",
    lrc: "الصليب الأحمر",
    civilDefense: "الدفاع المدني",
    shareLocation: "مشاركة موقعي",
    whatsappMessage: "طوارئ! موقعي الحالي هو: ",
    verified_ago: "تم التحقق منذ {time}",
    reported_ago: "تم التبليغ منذ {time}",
    userVerified: "تم التحقق من المجتمع",
    operational: "قيد الخدمة",
    limited: "خدمة محدودة",
    closed: "مغلق",
    lrcEmergency: "طوارئ الصليب الأحمر: ١٤٠",
    iAmSafe: "أنا بخير",
    iAmSafeMessage: "أنا بخير! موقعي الحالي هو: ",
    findSafestPath: "البحث عن المسار الأكثر أماناً",
    roadStatus: "حالة الطرق",
    roadClosure: "إغلاق طريق",
    verifiedISF: "موثوق (ISF) ✓",
    communityAlert: "بلاغ مجتمعي ⚠️",
    earthquakes: "هزات أرضية",
    seismicAlert: "تنبيه زلزالي",
    seismicInstructions: "انخفض، تغطَّ، وتمسك",
    magnitude: "القوة",
    richter: "ريختر",
    workingOffline: "نظام عدم الاتصال",
    survivalGuide: "دليل النجاة",
    earthquakeSafety: "السلامة من الزلازل",
    gasLeakSafety: "السلامة من تسرب الغاز",
    gasLeakInstructions: "إذا شممت رائحة غاز: افتح النوافذ، لا تستخدم المفاتيح الكهربائية، وغادر فوراً.",
    safetyDisclaimerTitle: "إخلاء مسؤولية الأمان",
    safetyDisclaimerMessage: "يوفر هذا التطبيق بيانات الأمان لأغراض إعلامية فقط. أعطِ الأولوية دائماً لتعليمات السلطات المحلية. ابقَ آمناً.",
    videoCall: "اتصال فيديو",
    shareCallLink: "مشاركة رابط المكالمة",
    hangUp: "إنهاء المكالمة",
    emergencyVideoCall: "اتصال فيديو الطوارئ",
    districts: {
      dahieh: "الضاحية",
      beirut: "بيروت",
      tyre: "صور",
      nabatieh: "النبطية",
      tripoli: "طرابلس",
      saida: "صيدا",
      baalbek: "بعلبك",
      jounieh: "جونية"
    }
  },
  fr: {
    name: "Le Gardien",
    safetyStatus: "État de Sécurité",
    findSafestPath: "Trouver le chemin le plus sûr",
    reportDanger: "Signaler un danger",
    emergency: "Urgences",
    searchPlaceholder: "Chercher un village, ville...",
    offlineReady: "Prêt Hors Ligne",
    liveSafetyFeed: "Signalements en Direct",
    lowBandwidth: "Mode Basse Bande",
    optimized3G: "Optimisé pour la 3G",
    startPoint: "Point de Départ",
    destination: "Destination",
    selectDistrict: "Sélectionner District",
    report: "SIGNALER",
    routing: "CALCUL...",
    submitReport: "ENVOYER LE RAPPORT",
    dangerType: "Type de Danger",
    details: "Détails (Optionnel)",
    describe: "Décrivez la situation...",
    noResults: "Aucun résultat",
    verified: "Vérifié",
    nnaVerified: "✓ Vérifié (NNA)",
    communityReport: "⚠️ Signalement Communautaire",
    foodWater: "Distribution Eau/Nourriture",
    safeCorridor: "Corridor Sûr",
    lowPower: "Mode Économie",
    lowPowerDesc: "Désactive les animations pour économiser la batterie",
    share: "Partager l'itinéraire",
    shareApp: "Partager l'application",
    shareSuccess: "Lien copié!",
    welcomeTitle: "Bienvenue sur Le Gardien",
    welcomeMessage: "Notre priorité est 'La Sécurité avant la Vitesse'. Nous calculons les itinéraires basés sur la sécurité en temps réel, pas seulement la distance. Restez en sécurité.",
    settings: "Paramètres",
    language: "Langue",
    theme: "Apparence",
    allResources: "Toutes les ressources",
    airstrikes: "Frappes Aériennes",
    hospitals: "Hôpitaux",
    bakeries: "Boulangeries",
    pharmacies: "Pharmacies",
    fuel: "Stations-service",
    tools: "Outils",
    ngo: "ONG",
    requestAid: "Demander de l'aide humanitaire",
    aidType: "Type d'aide",
    food: "Nourriture",
    medical: "Médical",
    shelter: "Abri",
    multi: "Aide multiple",
    hours: "Heures d'ouverture",
    close: "Fermer",
    understand: "Je comprends",
    scanQR: "Scannez ce code pour ouvrir Le Gardien sur un autre appareil",
    showQR: "Afficher le QR",
    offlineShare: "Partager hors ligne",
    dangerZone: "ZONE DE DANGER",
    dangerLevel: "Niveau de Danger",
    airstrike: "Frappe Aérienne / Bombardement",
    emergencyContacts: "CONTACTS D'URGENCE",
    lrc: "Croix-Rouge",
    civilDefense: "Défense Civile",
    shareLocation: "Partager ma position",
    whatsappMessage: "Urgence ! Ma position actuelle est : ",
    verified_ago: "Vérifié il y a {time}",
    reported_ago: "Signalé il y a {time}",
    userVerified: "Vérifié par la Communauté",
    operational: "Opérationnel",
    limited: "Service Limité",
    closed: "Fermé",
    lrcEmergency: "Urgence Croix-Rouge: 140",
    iAmSafe: "Je suis en sécurité",
    iAmSafeMessage: "Je suis en sécurité ! Ma position actuelle est : ",
    roadStatus: "État des Routes",
    roadClosure: "Route Fermée",
    verifiedISF: "✓ Vérifié (ISF)",
    communityAlert: "⚠️ Alerte Communautaire",
    earthquakes: "Séismes",
    seismicAlert: "ALERTE SISMIQUE",
    seismicInstructions: "Baissez-vous, abritez-vous et agrippez-vous",
    magnitude: "Magnitude",
    richter: "Richter",
    workingOffline: "Mode Hors-ligne",
    survivalGuide: "Guide de Survie",
    earthquakeSafety: "Sécurité Séisme",
    gasLeakSafety: "Sécurité Fuite de Gaz",
    gasLeakInstructions: "Si vous sentez du gaz : ouvrez les fenêtres, n'utilisez pas d'interrupteurs, partez immédiatement.",
    safetyDisclaimerTitle: "Avis de sécurité",
    safetyDisclaimerMessage: "Cette application fournit des données de sécurité à titre informatif uniquement. Priorisez toujours les instructions des autorités locales. Restez en sécurité.",
    videoCall: "Appel Vidéo",
    shareCallLink: "Partager le lien",
    hangUp: "Raccrocher",
    emergencyVideoCall: "Appel Vidéo d'Urgence",
    districts: {
      dahieh: "Dahieh",
      beirut: "Beyrouth",
      tyre: "Tyr",
      nabatieh: "Nabatieh",
      tripoli: "Tripoli",
      saida: "Saïda",
      baalbek: "Baalbek",
      jounieh: "Jounieh"
    }
  }
};

const DANGER_TYPES: Record<Language, string[]> = {
  en: ["Airstrike/Shelling", "Road Block", "Gunfire", "Checkpoint", "Resource Update", "Request Humanitarian Aid"],
  ar: ["غارة جوية / قصف", "قطع طريق", "إطلاق نار", "حاجز أمني", "تحديث الموارد", "طلب مساعدات إنسانية"],
  fr: ["Frappe Aérienne / Bombardement", "Barrage Routier", "Fusillade", "Point de Contrôle", "Mise à jour des ressources", "Demande d'aide humanitaire"]
};

// --- Static Utilities & Icons ---
const createCustomIcon = (emoji: string, color: string) => L.divIcon({
  html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-size: 18px;">${emoji}</div>`,
  className: 'custom-div-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const dangerIcon = L.divIcon({
  html: `<div style="background-color: #FF3B30; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(255,59,48,0.5);"></div>`,
  className: 'danger-icon',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const warningIcon = L.divIcon({
  html: `<div style="background-color: #FF9500; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(255,149,0,0.4);"></div>`,
  className: 'warning-icon',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const infoIcon = L.divIcon({
  html: `<div style="background-color: #007AFF; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(0,122,255,0.4);"></div>`,
  className: 'info-icon',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// --- Map Components ---
const MapResizeHandler = () => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

const MapBoundsHandler = ({ onBoundsChange }: { onBoundsChange: (bounds: L.LatLngBounds) => void }) => {
  const map = useMapEvents({
    moveend: () => onBoundsChange(map.getBounds()),
    zoomend: () => onBoundsChange(map.getBounds()),
  });
  
  // Initial bounds set
  useEffect(() => {
    onBoundsChange(map.getBounds());
  }, []); // Only run once on mount

  return null;
};

const MapClickHandler = ({ isReportingMode, onMapClick }: { isReportingMode: boolean, onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click: (e) => { if (isReportingMode) onMapClick(e.latlng.lat, e.latlng.lng); },
  });
  return null;
};

const MapUpdater = ({ focusedAlertId, alerts, searchLocation }: { focusedAlertId: string | null, alerts: Alert[], searchLocation: [number, number] | null }) => {
  const map = useMap();
  const lastFocusedId = useRef<string | null>(null);
  const lastSearchLoc = useRef<string | null>(null);

  useEffect(() => {
    if (!map) return;
    
    if (focusedAlertId && focusedAlertId !== lastFocusedId.current) {
      const alert = alerts.find(a => a.id === focusedAlertId);
      if (alert) {
        map.setView(alert.coordinates, 14);
        lastFocusedId.current = focusedAlertId;
      }
    } else if (searchLocation) {
      const locKey = `${searchLocation[0]},${searchLocation[1]}`;
      if (locKey !== lastSearchLoc.current) {
        map.setView(searchLocation, 12);
        lastSearchLoc.current = locKey;
      }
    }
    
    if (!focusedAlertId) lastFocusedId.current = null;
    if (!searchLocation) lastSearchLoc.current = null;
  }, [map, focusedAlertId, alerts, searchLocation]);

  return null;
};

const PulseCircle = ({ center, pulse, lowPowerMode, color = '#FF3B30', radius = 500 }: { center: [number, number], pulse: number, lowPowerMode: boolean, color?: string, radius?: number }) => {
  if (lowPowerMode) return (
    <Circle 
      center={center} 
      radius={radius} 
      pathOptions={{ fillColor: color, fillOpacity: 0.3, strokeWeight: 1, color: color }} 
    />
  );
  return (
    <Circle
      center={center}
      radius={radius * pulse}
      pathOptions={{
        fillColor: color,
        fillOpacity: 0.4 * (1.5 - pulse),
        strokeWeight: 0
      }}
    />
  );
};

interface MapComponentProps {
  theme: Theme;
  alerts: Alert[];
  services: EssentialService[];
  activeFilter: string | null;
  routePath: [number, number][];
  focusedAlertId: string | null;
  setFocusedAlertId: (id: string | null) => void;
  t: any;
  onBoundsChange: (bounds: L.LatLngBounds) => void;
  isReportingMode: boolean;
  onMapClick: (lat: number, lng: number) => void;
  lowPowerMode: boolean;
}

const ZoomControls = ({ isRTL }: { isRTL: boolean }) => {
  const map = useMap();
  return (
    <div className={`leaflet-top ${isRTL ? 'leaflet-left' : 'leaflet-right'} mt-24 ${isRTL ? 'ml-4' : 'mr-4'} pointer-events-auto`}>
      <div className="leaflet-control leaflet-bar border-none shadow-2xl flex flex-col">
        <button 
          onClick={(e) => { e.stopPropagation(); map.zoomIn(); }} 
          className={`w-10 h-10 flex items-center justify-center bg-zinc-900 text-white border-b border-white/10 rounded-t-xl hover:bg-zinc-800 transition-colors`}
        >
          +
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); map.zoomOut(); }} 
          className={`w-10 h-10 flex items-center justify-center bg-zinc-900 text-white rounded-b-xl hover:bg-zinc-800 transition-colors`}
        >
          -
        </button>
      </div>
    </div>
  );
};

const MapComponent = React.memo(({ 
  theme, alerts, services, earthquakes, activeFilter, routePath, focusedAlertId, setFocusedAlertId, onBoundsChange, isReportingMode, onMapClick, lowPowerMode, searchLocation, onZoom
}: any) => {
  const { t, language, isRTL } = useLanguage();
  const [pulse, setPulse] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(p => p === 1 ? 1.2 : 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const MapEvents = () => {
    useMapEvents({
      // Removed onZoom to prevent rate limit exhaustion
    });
    return null;
  };

  useEffect(() => {
    if (lowPowerMode) return;
    const interval = setInterval(() => {
      setPulse(p => p > 1.5 ? 1 : p + 0.05);
    }, 50);
    return () => clearInterval(interval);
  }, [lowPowerMode]);

  return (
    <div className={`absolute inset-0 z-0 transition-opacity duration-500 ${isReportingMode ? 'cursor-crosshair' : ''}`}>
      <MapContainer center={[33.85, 35.50]} zoom={9} zoomControl={false} className="w-full h-full">
        <MapResizeHandler />
        <MapBoundsHandler onBoundsChange={onBoundsChange} />
        <MapClickHandler isReportingMode={isReportingMode} onMapClick={onMapClick} />
        <MapUpdater focusedAlertId={focusedAlertId} alerts={alerts} searchLocation={searchLocation} />
        <MapEvents />
        <TileLayer
          url={theme === 'dark' 
            ? `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?lang=${language}` 
            : `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?lang=${language}`}
          attribution='&copy; OpenStreetMap contributors'
        />
        
        <ZoomControls isRTL={isRTL} />

        {alerts.filter(a => {
          if (!activeFilter || activeFilter === 'all') return true;
          if (activeFilter === 'airstrike') return a.type === 'airstrike';
          if (activeFilter === 'road_closure') return a.type === 'road_closure';
          return false;
        }).map(alert => (
          <Fragment key={alert.id}>
            {(alert.type === 'danger' || alert.type === 'airstrike') && (
              <PulseCircle center={alert.coordinates} pulse={pulse} lowPowerMode={lowPowerMode} color={alert.type === 'airstrike' ? '#FF3B30' : '#FF3B30'} />
            )}
            <Marker
              position={alert.coordinates}
              icon={
                alert.type === 'airstrike' ? createCustomIcon('🔥', '#FF3B30') : 
                alert.type === 'road_closure' ? createCustomIcon('✖', '#FF9500') :
                alert.type === 'danger' ? dangerIcon : 
                alert.type === 'warning' ? warningIcon : infoIcon
              }
              eventHandlers={{ click: () => setFocusedAlertId(alert.id) }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]" dir={isRTL ? 'rtl' : 'ltr'}>
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${alert.type === 'airstrike' || alert.type === 'danger' || alert.type === 'road_closure' ? 'text-danger' : 'text-warning'}`}>
                    {alert.type === 'airstrike' ? t.airstrikes : alert.type === 'road_closure' ? t.roadClosure : t.dangerZone}
                  </p>
                  <p className="font-bold text-sm mb-2">{alert.message}</p>
                  <div className="flex items-center justify-between border-t pt-2">
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${alert.isUserReported ? 'border-warning/50 text-warning bg-warning/5' : 'border-safety/50 text-safety bg-safety/5'}`}>
                      {alert.type === 'road_closure' && !alert.isUserReported ? t.verifiedISF : alert.isUserReported ? t.communityAlert : t.nnaVerified}
                    </span>
                    <span className="text-[10px] font-mono font-bold">
                      {alert.type === 'airstrike' ? t.reported_ago.replace('{time}', alert.timestamp) : t.verified_ago.replace('{time}', alert.timestamp)}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          </Fragment>
        ))}

        {earthquakes.filter(() => !activeFilter || activeFilter === 'all' || activeFilter === 'earthquake').map((quake: any) => (
          <Fragment key={quake.id}>
            <PulseCircle 
              center={quake.coordinates} 
              pulse={pulse} 
              lowPowerMode={lowPowerMode} 
              color="#A855F7" 
              radius={1500}
            />
            <Marker
              position={quake.coordinates}
              icon={createCustomIcon('🌋', quake.mag > 6.0 ? '#FF3B30' : quake.mag > 4.0 ? '#FF9500' : '#FFCC00')}
            >
              <Popup>
                <div className="p-2 min-w-[200px]" dir={isRTL ? 'rtl' : 'ltr'}>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-purple-500">
                    {t.earthquakes}
                  </p>
                  <p className="font-bold text-sm mb-1">{quake.place}</p>
                  <div className={`flex items-center gap-2 mb-2 p-1.5 rounded-lg ${theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                    <div className={`w-2 h-2 rounded-full ${quake.mag > 6.0 ? 'bg-danger animate-pulse' : quake.mag > 4.0 ? 'bg-warning' : 'bg-yellow-400'}`} />
                    <p className="text-[10px] font-black uppercase">
                      {t.magnitude}: {quake.mag} {t.richter}
                    </p>
                  </div>
                  <p className="text-[10px] font-mono font-bold text-zinc-500">{quake.time}</p>
                </div>
              </Popup>
            </Marker>
          </Fragment>
        ))}

        <MarkerClusterGroup chunkedLoading>
          {services.filter(s => {
            if (activeFilter === 'all') return true;
            return s.type === activeFilter;
          }).map(service => (
            <Marker
              key={service.id}
              position={service.coordinates}
              icon={createCustomIcon(
                service.type === 'hospital' ? '🏥' :
                service.type === 'bakery' ? '🍞' :
                service.type === 'pharmacy' ? '💊' :
                service.type === 'fuel' ? '⛽' : 
                service.type === 'food_water' ? '📦' :
                service.type === 'ngo' ? '❤️' : '🛠️',
                service.type === 'hospital' ? '#007AFF' : 
                service.type === 'ngo' ? '#FF2D55' : 
                service.type === 'food_water' ? '#34C759' : '#FFCC00'
              )}
            >
            <Popup>
                <div className="p-2 min-w-[200px]" dir={isRTL ? 'rtl' : 'ltr'}>
                  <h3 className="font-bold text-sm mb-1">{service.name}</h3>
                  <div className={`flex items-center gap-2 mb-2 p-1.5 rounded-lg ${theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                    <div className={`w-2 h-2 rounded-full ${service.status === 'open' ? 'bg-safety' : 'bg-warning'}`} />
                    <p className={`text-[10px] font-black uppercase ${service.status === 'open' ? 'text-safety' : 'text-warning'}`}>
                      {service.status === 'open' ? t.operational : service.status === 'limited' ? t.limited : t.closed}
                    </p>
                  </div>
                  {service.type === 'ngo' && (
                    <div className="space-y-1 mt-2 border-t border-white/10 pt-2">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-zinc-500 uppercase font-bold">{t.aidType}:</span>
                        <span className="font-bold">{t[service.aidType || 'multi']}</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-zinc-500 uppercase font-bold">{t.hours}:</span>
                        <span className="font-bold">{service.hours}</span>
                      </div>
                      {service.name.includes('LRC') && (
                        <div className="mt-2 p-2 bg-danger/10 rounded-lg text-center">
                          <p className="text-[10px] font-black text-danger uppercase tracking-widest">{t.lrcEmergency}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>

        {routePath.length > 1 && (
          <Polyline positions={routePath} pathOptions={{ color: '#007AFF', weight: 6, opacity: 0.8, dashArray: '10, 10' }} />
        )}
      </MapContainer>
    </div>
  );
});

// --- Sidebar ---
const Sidebar = React.memo(({
  isSidebarOpen, isMobile, theme, setIsSidebarOpen, setIsReportModalOpen, filteredAlerts, focusedAlertId, setFocusedAlertId, getDistrictName, isBackoffActive, onStartVideoCall
}: any) => {
  const { t, isRTL } = useLanguage();
  return (
    <AnimatePresence mode="wait">
      {isSidebarOpen && (
        <motion.aside
          initial={isMobile ? { x: isRTL ? '100%' : '-100%' } : { x: isRTL ? '100%' : '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: isRTL ? '100%' : '-100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={`fixed inset-y-0 z-[2000] w-80 flex flex-col border-r transition-colors duration-500 backdrop-blur-xl ${theme === 'dark' ? 'bg-[#121212]/90 border-white/10' : 'bg-white/80 border-zinc-200 shadow-xl'} ${isRTL ? 'right-0' : 'left-0'}`}
        >
          <div className="p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-danger p-2 rounded-xl shadow-[0_0_15px_rgba(255,59,48,0.4)]"><ShieldAlert className="text-black w-6 h-6" /></div>
                <h1 className="text-2xl font-black tracking-tighter uppercase italic text-left" style={{ textAlign: 'left', direction: 'ltr' }}>GUARDIAN</h1>
              </div>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setIsSidebarOpen(false)} className={`p-2 rounded-xl ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-zinc-100'}`}><X className="w-5 h-5" /></motion.button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-8">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-2">{t.videoHub}</h3>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={onStartVideoCall}
                  className={`w-full flex items-center justify-center gap-3 p-5 rounded-3xl border ${theme === 'dark' ? 'bg-indigo-500/10 border-indigo-500/30 hover:bg-indigo-500/20' : 'bg-indigo-50 border-indigo-100 hover:bg-indigo-100'} transition-all shadow-lg shadow-indigo-500/5`}
                >
                  <Video className="w-6 h-6 text-indigo-500" />
                  <span className="text-sm font-black uppercase tracking-widest">{t.emergencyVideoCall}</span>
                </motion.button>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-2">{t.survivalGuide}</h3>
                <div className="space-y-3">
                  <div className={`p-5 rounded-3xl border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-zinc-50 border-zinc-100'}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl bg-purple-500/20"><Waves className="w-5 h-5 text-purple-500" /></div>
                      <p className="text-xs font-black uppercase tracking-widest">{t.earthquakeSafety}</p>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed">{t.seismicInstructions}</p>
                  </div>
                  <div className={`p-5 rounded-3xl border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-zinc-50 border-zinc-100'}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl bg-warning/20"><Flame className="w-5 h-5 text-warning" /></div>
                      <p className="text-xs font-black uppercase tracking-widest">{t.gasLeakSafety}</p>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed">{t.gasLeakInstructions}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={`mt-auto pt-6 border-t ${theme === 'dark' ? 'border-white/10' : 'border-zinc-100'}`}>
              <div className={`p-4 rounded-2xl flex items-center gap-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-zinc-50'}`}>
                <div className="bg-safety/20 p-2 rounded-lg"><Zap className="text-safety w-4 h-4" /></div>
                <div><p className="text-[10px] font-black uppercase tracking-widest">{t.lowBandwidth}</p><p className="text-[8px] text-zinc-500">{t.optimized3G}</p></div>
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
});

// --- SOS Modal ---
const SOSModal = ({ isOpen, onClose, t, isRTL, theme }: any) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-black/90 backdrop-blur-xl" 
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.9, opacity: 0, y: 20 }} 
            className={`relative w-full max-w-sm rounded-[32px] p-8 text-center shadow-2xl border ${theme === 'dark' ? 'bg-[#121212] border-white/10' : 'bg-white border-zinc-200'}`}
          >
            <div className="space-y-8">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-danger/10 flex items-center justify-center shadow-[0_0_40px_rgba(255,59,48,0.2)]">
                  <Phone className="w-10 h-10 text-danger animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black uppercase tracking-tight">{t.emergency}</h2>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{t.directDial}</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <motion.a 
                  whileTap={{ scale: 0.95 }}
                  href="tel:140"
                  className="flex items-center justify-between p-6 rounded-[24px] bg-danger text-black font-black transition-all shadow-xl shadow-danger/20 group"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] opacity-70 uppercase tracking-widest">RED CROSS</span>
                    <span className="text-xl">140</span>
                  </div>
                  <PhoneOutgoing className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </motion.a>
                <motion.a 
                  whileTap={{ scale: 0.95 }}
                  href="tel:125"
                  className={`flex items-center justify-between p-6 rounded-[24px] font-black transition-all shadow-xl ${theme === 'dark' ? 'bg-white text-black' : 'bg-zinc-900 text-white'} group`}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] opacity-70 uppercase tracking-widest">CIVIL DEFENSE</span>
                    <span className="text-xl">125</span>
                  </div>
                  <PhoneOutgoing className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </motion.a>
              </div>
              <button 
                onClick={onClose}
                className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors py-2"
              >
                {t.close}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- Bottom Sheet ---
const BottomSheet = ({ 
  theme, t, isRTL, districts, startDistrict, setStartDistrict, endDistrict, setEndDistrict, 
  getDistrictName, calculateSafestRoute, isRouting, routePath, handleShare, filteredAlerts,
  focusedAlertId, setFocusedAlertId, setIsReportModalOpen, setIsVideoCallOpen
}: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const controls = useAnimation();

  const onDragEnd = (event: any, info: any) => {
    if (info.offset.y < -50) setIsOpen(true);
    if (info.offset.y > 50) setIsOpen(false);
  };
  
  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      onDragEnd={onDragEnd}
      initial={{ y: 'calc(100% - 100px)' }}
      animate={{ y: isOpen ? 0 : 'calc(100% - 100px)' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className={`fixed bottom-0 left-0 right-0 z-[1500] h-[85vh] rounded-t-[40px] border-t backdrop-blur-3xl transition-colors duration-500 ${theme === 'dark' ? 'bg-[#121212]/80 border-white/10' : 'bg-white/90 border-zinc-200 shadow-[0_-20px_60px_rgba(0,0,0,0.1)]'}`}
    >
      <div 
        className="w-full h-14 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={`w-12 h-1.5 rounded-full mb-2 ${theme === 'dark' ? 'bg-white/20' : 'bg-zinc-300'}`} />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{isOpen ? t.swipeDown : t.searchAndReport}</p>
      </div>

      <div className="px-6 pb-24 h-full overflow-y-auto no-scrollbar">
        <div className="max-w-2xl mx-auto space-y-10">
          {/* Action Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsReportModalOpen(true)}
              className={`w-full p-6 rounded-[24px] border flex items-center justify-between group transition-all ${theme === 'dark' ? 'bg-danger/10 border-danger/20 hover:bg-danger/20' : 'bg-red-50 border-red-100 hover:bg-red-100'}`}
            >
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-danger text-black shadow-xl shadow-danger/20">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-base font-black uppercase tracking-tight text-danger">{t.reportDanger}</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{t.communityAlert}</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-danger opacity-50 group-hover:opacity-100 transition-opacity" />
            </motion.button>

            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsVideoCallOpen(true)}
              className={`w-full p-6 rounded-[24px] border flex items-center justify-between group transition-all ${theme === 'dark' ? 'bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20' : 'bg-indigo-50 border-indigo-100 hover:bg-indigo-100'}`}
            >
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-indigo-500 text-white shadow-xl shadow-indigo-500/20">
                  <Video className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-base font-black uppercase tracking-tight text-indigo-500">{t.videoHub}</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{t.emergencyVideoCall}</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-indigo-500 opacity-50 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          </div>

          {/* Routing Section */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-2">{t.routeFinding}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{t.startPoint}</label>
                <select value={startDistrict} onChange={(e) => setStartDistrict(e.target.value)} className={`w-full border rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-safety/50 appearance-none ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`}>
                  <option value="">{t.selectDistrict}</option>
                  {districts.map((d: any) => <option key={d.id} value={d.id}>{getDistrictName(d.id)}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{t.destination}</label>
                <select value={endDistrict} onChange={(e) => setEndDistrict(e.target.value)} className={`w-full border rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-safety/50 appearance-none ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`}>
                  <option value="">{t.selectDistrict}</option>
                  {districts.map((d: any) => <option key={d.id} value={d.id}>{getDistrictName(d.id)}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <motion.button whileTap={{ scale: 0.95 }} onClick={calculateSafestRoute} disabled={!startDistrict || !endDistrict || isRouting} className={`flex-1 flex items-center justify-center gap-2 font-bold px-8 py-4 rounded-2xl transition-all shadow-lg ${startDistrict && endDistrict && !isRouting ? 'bg-safety text-black hover:bg-safety/90' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}>{isRouting ? <><Activity className="w-5 h-5 animate-spin" />{t.routing}</> : <><Navigation className="w-5 h-5" />{t.findSafestPath}</>}</motion.button>
              {routePath.length > 0 && <motion.button whileTap={{ scale: 0.95 }} onClick={handleShare} className="bg-zinc-800 text-white p-4 rounded-2xl hover:bg-zinc-700 transition-all shadow-lg"><Share2 className="w-5 h-5" /></motion.button>}
            </div>
          </div>

          {/* Feed Section */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-2">{t.liveSafetyFeed}</h3>
            <div className="space-y-3">
              {filteredAlerts.map((alert: any) => (
                <motion.div
                  key={alert.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  onClick={() => setFocusedAlertId(focusedAlertId === alert.id ? null : alert.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${focusedAlertId === alert.id ? 'bg-danger/10 border-danger' : theme === 'dark' ? 'bg-white/5 border-white/5 hover:border-white/20' : 'bg-zinc-50 border-zinc-100 hover:border-zinc-300'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col gap-1">
                      <span className={`text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 rounded w-fit ${alert.type === 'danger' || alert.type === 'airstrike' ? 'bg-danger text-black' : alert.type === 'road_closure' ? 'bg-warning text-black' : 'bg-safety text-black'}`}>{alert.type === 'road_closure' ? t.roadClosure : alert.type}</span>
                      <span className={`text-[7px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border ${alert.isUserReported ? 'border-warning/50 text-warning bg-warning/5' : 'border-safety/50 text-safety bg-safety/5'}`}>
                        {alert.type === 'road_closure' && !alert.isUserReported ? t.verifiedISF : alert.isUserReported ? t.communityAlert : t.nnaVerified}
                      </span>
                    </div>
                    <span className="text-[8px] font-mono text-zinc-500">{alert.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-1"><MapPin className="w-3 h-3 text-zinc-500" /><p className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{alert.location} ({getDistrictName(alert.districtId)})</p></div>
                  <p className="text-[10px] text-zinc-500 leading-relaxed">{alert.message}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Main App ---
export default function App() {
  const { districts, alerts, services, addAlert, locations } = useSafetyData();
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('guardian-lang') as Language) || 'en');
  
  const genAI = useMemo(() => process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null, []);
  const lastFetchRef = React.useRef<number>(0);
  const [isBackoffActive, setIsBackoffActive] = useState(() => {
    const backoffUntil = localStorage.getItem('guardian-backoff-until');
    return backoffUntil ? Date.now() < parseInt(backoffUntil) : false;
  });

  const fetchCrisisData = useCallback(async (force = false) => {
    if (!genAI) return;
    
    const now = Date.now();
    const backoffUntil = localStorage.getItem('guardian-backoff-until');
    if (backoffUntil && now < parseInt(backoffUntil)) {
      setIsBackoffActive(true);
      return;
    } else {
      setIsBackoffActive(false);
    }
    
    // Debounce: Don't fetch more than once every 2 minutes unless forced
    if (!force && now - lastFetchRef.current < 120000) return;

    try {
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Simulate a Live Data Analyst for Lebanon in 2026. Generate 5-10 realistic, timestamped reports of recent airstrikes, road closures, safe humanitarian shelters, and aid distribution points. Return JSON array of objects with type ('airstrike', 'road_closure', 'danger', 'info'), location, districtId (beirut, dahieh, tyre, nabatieh, baalbek), message, coordinates [lat, lng], timestamp (e.g. '2m'). Ensure locations are realistic for South Lebanon, Bekaa, and Beirut.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                location: { type: Type.STRING },
                districtId: { type: Type.STRING },
                message: { type: Type.STRING },
                coordinates: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                timestamp: { type: Type.STRING }
              },
              required: ["type", "location", "districtId", "message", "coordinates", "timestamp"]
            }
          }
        }
      });

      const data = JSON.parse(response.text);
      data.forEach((report: any) => {
        addAlert({
          type: report.type || 'airstrike',
          location: report.location,
          districtId: report.districtId,
          message: report.message,
          coordinates: report.coordinates as [number, number],
          timestamp: report.timestamp,
          isUserReported: false
        } as any);
      });
      
      lastFetchRef.current = now;
      // Cache successful data
      localStorage.setItem('guardian-crisis-cache', JSON.stringify(data));
      localStorage.setItem('guardian-crisis-last-fetch', now.toString());
    } catch (error: any) {
      console.error("Crisis data fetch failed:", error);
      
      // Handle Quota Exceeded (429)
      if (error.message?.includes('429') || error.status === 'RESOURCE_EXHAUSTED' || error.message?.includes('quota')) {
        const backoffTime = Date.now() + 600000; // 10 minutes
        localStorage.setItem('guardian-backoff-until', backoffTime.toString());
        setIsBackoffActive(true);
      }
    }
  }, [addAlert, genAI]);

  useEffect(() => {
    // Load from cache on mount
    const cachedData = localStorage.getItem('guardian-crisis-cache');
    const lastFetch = localStorage.getItem('guardian-crisis-last-fetch');
    if (cachedData) {
      const data = JSON.parse(cachedData);
      data.forEach((report: any) => {
        addAlert({
          type: report.type || 'airstrike',
          location: report.location,
          districtId: report.districtId,
          message: report.message,
          coordinates: report.coordinates as [number, number],
          timestamp: report.timestamp,
          isUserReported: false
        } as any);
      });
      if (lastFetch) lastFetchRef.current = parseInt(lastFetch);
    }

    if (navigator.onLine) {
      fetchCrisisData();
    }
    
    const interval = setInterval(() => {
      if (!navigator.onLine) return;
      const backoffUntil = localStorage.getItem('guardian-backoff-until');
      if (!backoffUntil || Date.now() > parseInt(backoffUntil)) {
        fetchCrisisData();
      }
    }, 300000); // Every 5 mins
    return () => clearInterval(interval);
  }, [fetchCrisisData, addAlert]);

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [earthquakes, setEarthquakes] = useState<any[]>([]);
  const [seismicAlert, setSeismicAlert] = useState<any | null>(null);

  const fetchEarthquakes = useCallback(async () => {
    try {
      const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson');
      const data = await response.json();
      
      const beirut = { lat: 33.89, lng: 35.50 };
      
      const filtered = data.features.filter((f: any) => {
        const [lng, lat] = f.geometry.coordinates;
        const mag = f.properties.mag;
        
        // Simple distance approximation for 500km
        const dist = Math.sqrt(Math.pow(lat - beirut.lat, 2) + Math.pow(lng - beirut.lng, 2)) * 111;
        
        return mag > 2.0 && dist < 500;
      }).map((f: any) => ({
        id: f.id,
        mag: f.properties.mag,
        place: f.properties.place,
        time: new Date(f.properties.time).toLocaleTimeString(),
        coordinates: [f.geometry.coordinates[1], f.geometry.coordinates[0]] as [number, number]
      }));

      setEarthquakes(filtered);
      localStorage.setItem('guardian-earthquake-cache', JSON.stringify(filtered));

      // Check for large quakes (> 4.5)
      const largeQuake = filtered.find((q: any) => q.mag > 4.5);
      if (largeQuake) {
        setSeismicAlert(largeQuake);
      } else {
        setSeismicAlert(null);
      }
    } catch (error) {
      console.error("Failed to fetch earthquake data:", error);
      const cached = localStorage.getItem('guardian-earthquake-cache');
      if (cached) {
        setEarthquakes(JSON.parse(cached));
      }
    }
  }, []);

  useEffect(() => {
    fetchEarthquakes();
    const interval = setInterval(fetchEarthquakes, 300000); // 5 mins
    return () => clearInterval(interval);
  }, [fetchEarthquakes]);

  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('guardian-theme') as Theme) || 'dark');
  const [lowPowerMode, setLowPowerMode] = useState(() => localStorage.getItem('guardian-lowpower') === 'true');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState<[number, number] | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [startDistrict, setStartDistrict] = useState('');
  const [endDistrict, setEndDistrict] = useState('');
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [isRouting, setIsRouting] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isReportingMode, setIsReportingMode] = useState(false);
  const [selectedDangerType, setSelectedDangerType] = useState('');
  const [focusedAlertId, setFocusedAlertId] = useState<string | null>(null);
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);
  const [shareToast, setShareToast] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);
  const t = useMemo(() => TRANSLATIONS[language], [language]);
  const isRTL = useMemo(() => language === 'ar', [language]);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  useEffect(() => {
    if (t) {
      t.swipeDown = language === 'ar' ? 'اسحب للأسفل' : language === 'fr' ? 'Balayer vers le bas' : 'Swipe Down';
      t.searchAndReport = language === 'ar' ? 'بحث وإبلاغ' : language === 'fr' ? 'Recherche & Rapport' : 'Search & Report';
      t.videoHub = language === 'ar' ? 'مركز الفيديو' : language === 'fr' ? 'Hub Vidéo' : 'Video Hub';
    }
  }, [t, language]);

  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [jitsiRoomId, setJitsiRoomId] = useState('');

  const handleStartVideoCall = useCallback(() => {
    const roomId = `Guardian-LB-${Math.floor(100000 + Math.random() * 900000)}`;
    setJitsiRoomId(roomId);
    setIsVideoCallOpen(true);
  }, []);

  const handleShareVideoCall = useCallback(() => {
    const url = `https://meet.jit.si/${jitsiRoomId}`;
    const message = encodeURIComponent(`${t.emergencyVideoCall}: ${url}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  }, [jitsiRoomId, t.emergencyVideoCall]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(reg => {
          console.log('SW registered:', reg);
        }).catch(err => {
          console.log('SW registration failed:', err);
        });
      });
    }
  }, []);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('guardian-welcome-seen');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, []);

  const dismissWelcome = useCallback(() => {
    localStorage.setItem('guardian-welcome-seen', 'true');
    setShowWelcome(false);
  }, []);

  useEffect(() => {
    localStorage.setItem('guardian-lang', language);
    localStorage.setItem('guardian-theme', theme);
    localStorage.setItem('guardian-lowpower', lowPowerMode.toString());
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, theme, lowPowerMode, isRTL]);

  const filteredAlerts = useMemo(() => {
    if (!mapBounds) return alerts;
    return alerts.filter(alert => mapBounds.contains(alert.coordinates));
  }, [alerts, mapBounds]);

  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    return locations.filter(loc => 
      loc.name.toLowerCase().includes(query) || 
      loc.ar.includes(query) || 
      (loc.fr && loc.fr.toLowerCase().includes(query))
    ).slice(0, 5);
  }, [searchQuery, locations]);

  const getDistrictName = useCallback((id: string) => {
    const district = districts.find(d => d.id === id);
    return district ? district.name[language] : id;
  }, [language]);

  const calculateSafestRoute = useCallback(() => {
    setIsRouting(true);
    setTimeout(() => {
      const start = districts.find(d => d.id === startDistrict);
      const end = districts.find(d => d.id === endDistrict);
      if (start && end) {
        const startCoord = start.bounds[0];
        const endCoord = end.bounds[0];
        
        // Smart "Safe Path" logic: Avoid airstrike markers
        const airstrikes = alerts.filter(a => a.type === 'airstrike' || a.type === 'road_closure');
        let midPoint: [number, number] = [(startCoord[0] + endCoord[0]) / 2, (startCoord[1] + endCoord[1]) / 2];
        
        // If midpoint is near an airstrike or road closure, nudge it significantly
        airstrikes.forEach(strike => {
          const dist = Math.sqrt(Math.pow(strike.coordinates[0] - midPoint[0], 2) + Math.pow(strike.coordinates[1] - midPoint[1], 2));
          if (dist < 0.1) { 
            // Nudge away from the danger
            const dx = midPoint[0] - strike.coordinates[0];
            const dy = midPoint[1] - strike.coordinates[1];
            const angle = Math.atan2(dy, dx);
            midPoint[0] += Math.cos(angle) * 0.15;
            midPoint[1] += Math.sin(angle) * 0.15;
          }
        });

        setRoutePath([startCoord, midPoint, endCoord]);
      }
      setIsRouting(false);
    }, 1500);
  }, [startDistrict, endDistrict, alerts]);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (isReportingMode) {
      setIsReportModalOpen(true);
      setIsReportingMode(false);
    }
  }, [isReportingMode]);

  const handleShare = useCallback(() => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 3000);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      <div className={`flex h-screen w-full overflow-hidden font-sans transition-colors duration-500 ${theme === 'dark' ? 'bg-[#121212] text-white' : 'bg-zinc-50 text-zinc-900'}`}>
        <Sidebar 
          isSidebarOpen={isSidebarOpen} isMobile={isMobile} theme={theme} 
          setIsSidebarOpen={setIsSidebarOpen} setIsReportModalOpen={setIsReportModalOpen} 
          filteredAlerts={filteredAlerts} focusedAlertId={focusedAlertId} 
          setFocusedAlertId={setFocusedAlertId} getDistrictName={getDistrictName}
          isBackoffActive={isBackoffActive}
          onStartVideoCall={handleStartVideoCall}
        />

      <main className="flex-1 flex flex-col relative min-w-0 h-full">
        <header className={`fixed top-0 left-0 right-0 z-[1100] backdrop-blur-2xl transition-colors duration-500 ${theme === 'dark' ? 'bg-[#121212]/40 border-b border-white/10' : 'bg-white/60 border-b border-zinc-200'}`}>
          {!isOnline && (
            <div className="bg-zinc-800 text-white p-2 flex items-center justify-center gap-2 border-b border-white/5">
              <WifiOff className="w-3 h-3 text-zinc-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">{t.workingOffline}</span>
            </div>
          )}
          {seismicAlert && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="bg-danger text-black p-3 flex flex-col items-center justify-center gap-1 border-b border-black/20"
            >
              <div className="flex items-center gap-2">
                <Waves className="w-5 h-5 animate-bounce" />
                <span className="text-xs font-black uppercase tracking-[0.2em]">{t.seismicAlert}</span>
                <Waves className="w-5 h-5 animate-bounce" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">{t.seismicInstructions}</p>
              <p className="text-[9px] font-black mt-1">M{seismicAlert.mag} - {seismicAlert.place}</p>
            </motion.div>
          )}
          <div className="max-w-4xl mx-auto p-4 space-y-4">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black tracking-tighter uppercase italic" style={{ textAlign: 'left', direction: 'ltr' }}>GUARDIAN</h1>
              </div>
              <div className="flex-1 mx-4 relative">
                <div className={`flex items-center gap-3 px-4 py-3 rounded-[24px] border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 focus-within:border-white/30' : 'bg-zinc-100 border-zinc-200 focus-within:border-zinc-400'}`}>
                  <Search className="w-4 h-4 text-zinc-500" />
                  <input 
                    type="text" placeholder={t.searchPlaceholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none w-full text-sm font-medium"
                  />
                </div>
                <AnimatePresence>
                  {searchResults.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className={`absolute top-full left-0 right-0 mt-2 rounded-[24px] border shadow-2xl overflow-hidden z-[1200] ${theme === 'dark' ? 'bg-zinc-900 border-white/10' : 'bg-white border-zinc-200'}`}>
                      {searchResults.map((loc, i) => (
                        <button key={i} onClick={() => { 
                          setSearchQuery(''); 
                          setFocusedAlertId(null);
                          setSearchLocation(loc.coords as [number, number]);
                        }} className={`w-full p-5 text-left flex items-center gap-3 hover:bg-zinc-800 transition-colors ${i !== searchResults.length - 1 ? 'border-b border-white/5' : ''} ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                          <MapPin className="w-4 h-4 text-zinc-500" />
                          <div><p className="text-sm font-bold">{language === 'ar' ? loc.ar : (language === 'fr' && loc.fr ? loc.fr : loc.name)}</p><p className="text-[10px] text-zinc-500">{language === 'en' ? loc.ar : loc.name}</p></div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex items-center gap-2">
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setIsSettingsOpen(true)} className={`p-3 rounded-[24px] border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-zinc-100 border-zinc-200'}`}><SettingsIcon className="w-6 h-6" /></motion.button>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              <button 
                onClick={() => setActiveFilter(activeFilter === 'airstrike' ? null : 'airstrike')} 
                className={`flex items-center gap-2 px-6 py-3 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all backdrop-blur-md whitespace-nowrap min-h-[44px] ${activeFilter === 'airstrike' ? 'bg-danger text-black border-danger shadow-[0_0_20px_rgba(255,59,48,0.3)]' : theme === 'dark' ? 'bg-white/5 border-white/10 text-zinc-400 hover:border-white/30' : 'bg-zinc-100 border-zinc-200 text-zinc-500 hover:border-zinc-300'}`}
              >
                <Flame className="w-4 h-4" />{t.airstrikes}
              </button>
              <button 
                onClick={() => setActiveFilter(activeFilter === 'road_closure' ? null : 'road_closure')} 
                className={`flex items-center gap-2 px-6 py-3 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all backdrop-blur-md whitespace-nowrap min-h-[44px] ${activeFilter === 'road_closure' ? 'bg-warning text-black border-warning shadow-[0_0_20px_rgba(255,149,0,0.3)]' : theme === 'dark' ? 'bg-white/5 border-white/10 text-zinc-400 hover:border-white/30' : 'bg-zinc-100 border-zinc-200 text-zinc-500 hover:border-zinc-300'}`}
              >
                <Construction className="w-4 h-4" />{t.roadStatus}
              </button>
              <button 
                onClick={() => setActiveFilter(activeFilter === 'earthquake' ? null : 'earthquake')} 
                className={`flex items-center gap-2 px-6 py-3 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all backdrop-blur-md whitespace-nowrap min-h-[44px] ${activeFilter === 'earthquake' ? 'bg-purple-500 text-black border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]' : theme === 'dark' ? 'bg-white/5 border-white/10 text-zinc-400 hover:border-white/30' : 'bg-zinc-100 border-zinc-200 text-zinc-500 hover:border-zinc-300'}`}
              >
                <Waves className="w-4 h-4" />{t.earthquakes}
              </button>
              <button 
                onClick={() => setActiveFilter(activeFilter === 'ngo' ? null : 'ngo')} 
                className={`flex items-center gap-2 px-6 py-3 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all backdrop-blur-md whitespace-nowrap min-h-[44px] ${activeFilter === 'ngo' ? 'bg-safety text-black border-safety shadow-[0_0_20px_rgba(52,199,89,0.3)]' : theme === 'dark' ? 'bg-white/5 border-white/10 text-zinc-400 hover:border-white/30' : 'bg-zinc-100 border-zinc-200 text-zinc-500 hover:border-zinc-300'}`}
              >
                <HandHeart className="w-4 h-4" />NGOs
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 relative">
          <MapComponent 
            theme={!isOnline ? 'dark' : theme} alerts={alerts} services={services} earthquakes={earthquakes} activeFilter={activeFilter} routePath={routePath} 
            focusedAlertId={focusedAlertId} setFocusedAlertId={setFocusedAlertId} onBoundsChange={setMapBounds} 
            isReportingMode={isReportingMode} onMapClick={handleMapClick} lowPowerMode={lowPowerMode || activeFilter === 'airstrike' || !isOnline}
            searchLocation={searchLocation}
          />
          
          {isReportingMode && (
            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-danger rounded-full animate-ping" />
                <div className="absolute top-1/2 left-0 w-full h-1 bg-danger" />
                <div className="absolute left-1/2 top-0 w-1 h-full bg-danger" />
              </div>
            </div>
          )}

          {/* FABs */}
          <div className="absolute bottom-32 right-6 z-[1000] flex flex-col gap-4">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSOSModalOpen(true)}
              className="w-16 h-16 rounded-full bg-danger flex items-center justify-center shadow-[0_10px_30px_rgba(255,59,48,0.4)] border-4 border-white/20 active:scale-95 transition-transform"
            >
              <Phone className="w-8 h-8 text-black" />
            </motion.button>
          </div>

          <BottomSheet 
            theme={theme} t={t} isRTL={isRTL} districts={districts} 
            startDistrict={startDistrict} setStartDistrict={setStartDistrict}
            endDistrict={endDistrict} setEndDistrict={setEndDistrict}
            getDistrictName={getDistrictName} calculateSafestRoute={calculateSafestRoute}
            isRouting={isRouting} routePath={routePath} handleShare={handleShare}
            filteredAlerts={filteredAlerts} focusedAlertId={focusedAlertId}
            setFocusedAlertId={setFocusedAlertId} setIsReportModalOpen={setIsReportModalOpen}
            setIsVideoCallOpen={setIsVideoCallOpen}
          />
        </div>
      </main>

      <SOSModal 
        isOpen={isSOSModalOpen} 
        onClose={() => setIsSOSModalOpen(false)} 
        t={t} isRTL={isRTL} theme={theme} 
      />

        {/* Settings Modal */}
        <AnimatePresence>
          {isSettingsOpen && (
            <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSettingsOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={`relative w-full max-w-md rounded-[2.5rem] border overflow-hidden shadow-2xl ${theme === 'dark' ? 'bg-zinc-900 border-white/10' : 'bg-white border-zinc-200'}`}>
                <div className={`p-8 border-b border-white/10 flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <h2 className="text-xl font-bold">{t.settings}</h2>
                  <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-8 space-y-8">
                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">{t.language}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['en', 'ar', 'fr'] as Language[]).map(lang => (
                        <button key={lang} onClick={() => setLanguage(lang)} className={`py-3 rounded-xl border font-bold transition-all ${language === lang ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>{lang.toUpperCase()}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">{t.theme}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setTheme('dark')} className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-bold transition-all ${theme === 'dark' ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10'}`}><Moon className="w-4 h-4" />Dark</button>
                      <button onClick={() => setTheme('light')} className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-bold transition-all ${theme === 'light' ? 'bg-zinc-800 text-white border-zinc-800' : 'bg-white/5 border-white/10'}`}><Sun className="w-4 h-4" />Light</button>
                    </div>
                  </div>
                  <div className={`flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <QrCode className="w-5 h-5 text-zinc-500" />
                      <div className={isRTL ? 'text-right' : ''}><p className="text-sm font-bold">{t.shareApp}</p><p className="text-[10px] text-zinc-500">{t.offlineShare}</p></div>
                    </div>
                    <button onClick={() => setIsQRModalOpen(true)} className="bg-white text-black px-4 py-2 rounded-xl text-xs font-bold">{t.showQR}</button>
                  </div>
                  <div className={`flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <BatteryLow className={`w-5 h-5 ${lowPowerMode ? 'text-warning' : 'text-zinc-500'}`} />
                      <div className={isRTL ? 'text-right' : ''}><p className="text-sm font-bold">{t.lowPower}</p><p className="text-[10px] text-zinc-500">{t.lowPowerDesc}</p></div>
                    </div>
                    <button onClick={() => setLowPowerMode(!lowPowerMode)} className={`w-12 h-6 rounded-full transition-all relative ${lowPowerMode ? 'bg-safety' : 'bg-zinc-700'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${lowPowerMode ? 'right-1' : 'left-1'}`} /></button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Report Modal */}
        <AnimatePresence>
          {isReportModalOpen && (
            <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsReportModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={`relative w-full max-w-md rounded-[2.5rem] border overflow-hidden shadow-2xl ${theme === 'dark' ? 'bg-zinc-900 border-white/10' : 'bg-white border-zinc-200'}`}>
                <div className={`p-8 border-b border-white/10 bg-danger/5 flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}><AlertTriangle className="text-danger w-6 h-6" /><h2 className="text-xl font-bold">{t.reportDanger}</h2></div>
                  <button onClick={() => setIsReportModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-8 space-y-6">
                  <div className="space-y-3">
                    <label className={`text-xs font-bold uppercase tracking-widest text-zinc-500 ${isRTL ? 'text-right block' : ''}`}>{t.dangerType}</label>
                    <div className="grid grid-cols-1 gap-2">
                      {DANGER_TYPES[language].map(type => (
                        <button key={type} onClick={() => setSelectedDangerType(type)} className={`w-full p-4 rounded-2xl border font-bold transition-all ${isRTL ? 'text-right' : 'text-left'} ${selectedDangerType === type ? 'bg-danger text-black border-danger shadow-lg' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>{type}</button>
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={() => { 
                      const isAidRequest = selectedDangerType.includes('Aid') || selectedDangerType.includes('مساعدة') || selectedDangerType.includes('aide');
                      const isAirstrike = selectedDangerType.includes('Airstrike') || selectedDangerType.includes('غارة') || selectedDangerType.includes('Frappe');
                      addAlert({ 
                        type: isAirstrike ? 'airstrike' : isAidRequest ? 'info' : 'danger', 
                        location: 'User Reported', 
                        districtId: 'dahieh', 
                        message: selectedDangerType, 
                        coordinates: [33.85, 35.50],
                        isUserReported: true,
                        timestamp: 'Just now'
                      } as any); 
                      setIsReportModalOpen(false); 
                      setSelectedDangerType('');
                    }} 
                    disabled={!selectedDangerType} 
                    className={`w-full py-4 rounded-2xl font-bold transition-all ${selectedDangerType ? 'bg-danger text-black shadow-lg' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
                  >
                    {t.submitReport}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      {/* QR Modal */}
      <AnimatePresence>
        {isQRModalOpen && (
          <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsQRModalOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={`relative p-8 rounded-[3rem] border flex flex-col items-center gap-6 ${theme === 'dark' ? 'bg-zinc-900 border-white/10' : 'bg-white border-zinc-200'}`}>
              <h3 className="text-xl font-bold">{t.shareApp}</h3>
              <div className="p-4 bg-white rounded-3xl">
                <QRCodeCanvas value={window.location.href} size={200} level="H" />
              </div>
              <p className="text-xs text-zinc-500 text-center max-w-[200px]">{t.scanQR}</p>
              <button onClick={() => setIsQRModalOpen(false)} className="w-full py-4 rounded-2xl bg-zinc-800 text-white font-bold">{t.close}</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

        {/* Welcome Toast (Safety Disclaimer) */}
        <AnimatePresence>
          {showWelcome && (
            <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className={`relative w-full max-w-md p-8 rounded-[3rem] border shadow-2xl ${theme === 'dark' ? 'bg-zinc-900 border-white/10' : 'bg-white border-zinc-200'}`}>
                <div className={`flex items-center gap-4 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="bg-danger/20 p-3 rounded-2xl"><ShieldCheck className="text-danger w-8 h-8" /></div>
                  <div className={isRTL ? 'text-right' : ''}><h2 className="text-2xl font-black tracking-tight">{t.safetyDisclaimerTitle}</h2><p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">{t.safetyStatus}</p></div>
                </div>
                <p className={`text-sm leading-relaxed text-zinc-400 mb-8 ${isRTL ? 'text-right' : ''}`}>{t.safetyDisclaimerMessage}</p>
                <button onClick={dismissWelcome} className="w-full py-4 rounded-2xl bg-danger text-black font-black uppercase tracking-widest text-xs shadow-lg shadow-danger/20">{t.understand}</button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Video Call Modal */}
        <AnimatePresence>
          {isVideoCallOpen && (
            <div className="fixed inset-0 z-[6000] flex items-center justify-center p-0 sm:p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                exit={{ scale: 0.95, opacity: 0, y: 20 }} 
                className="relative w-full h-full sm:max-w-5xl sm:h-[80vh] bg-black rounded-none sm:rounded-[3rem] border-none sm:border border-white/10 overflow-hidden flex flex-col shadow-2xl"
              >
                <div className="p-4 sm:p-6 border-b border-white/10 flex justify-between items-center bg-zinc-900/50">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-500 p-2 rounded-xl"><Video className="w-5 h-5 text-black" /></div>
                    <div>
                      <h2 className="text-sm sm:text-lg font-black uppercase tracking-tight text-white">{t.emergencyVideoCall}</h2>
                      <p className="text-[8px] sm:text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{jitsiRoomId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button 
                      whileTap={{ scale: 0.9 }} 
                      onClick={handleShareVideoCall}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest transition-all"
                    >
                      <Share2 className="w-3 h-3 sm:w-4 h-4" />
                      <span className="hidden sm:inline">{t.shareCallLink}</span>
                    </motion.button>
                    <motion.button 
                      whileTap={{ scale: 0.9 }} 
                      onClick={() => setIsVideoCallOpen(false)}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-danger text-black text-[10px] font-bold uppercase tracking-widest transition-all"
                    >
                      <X className="w-3 h-3 sm:w-4 h-4" />
                      <span>{t.hangUp}</span>
                    </motion.button>
                  </div>
                </div>
                <div className="flex-1 bg-black relative">
                  <JitsiMeeting
                    domain="meet.jit.si"
                    roomName={jitsiRoomId}
                    configOverwrite={{
                      startWithAudioMuted: false,
                      disableModeratorIndicator: true,
                      startScreenSharing: false,
                      enableEmailInStats: false,
                      prejoinPageEnabled: false,
                    }}
                    interfaceConfigOverwrite={{
                      DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                    }}
                    userInfo={{
                      displayName: `Guardian User (${language.toUpperCase()})`,
                      email: ''
                    }}
                    getIFrameRef={(iframeRef) => {
                      iframeRef.style.height = '100%';
                      iframeRef.style.width = '100%';
                    }}
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Share Toast */}
        <AnimatePresence>
          {shareToast && (
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className={`fixed bottom-8 ${isRTL ? 'left-8' : 'right-8'} z-[4000] bg-safety text-black px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2`}>
              <CheckCircle2 className="w-5 h-5" />{t.shareSuccess}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </LanguageContext.Provider>
  );
}
