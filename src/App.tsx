import React, { useState, useEffect, useMemo, Fragment, useCallback } from 'react';
import { 
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
  Flame
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { QRCodeCanvas } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';
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
    verified_ago: "Verified {time} ago",
    reported_ago: "Reported {time} ago",
    userVerified: "Community Verified",
    operational: "Operational",
    limited: "Limited Service",
    closed: "Closed",
    lrcEmergency: "LRC Emergency: 140",
    safetyDisclaimerTitle: "Safety Disclaimer",
    safetyDisclaimerMessage: "This app provides safety data for informational purposes only. Always prioritize local authorities' instructions. Stay safe.",
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
    findSafestPath: "ابحث عن أمن طريق",
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
    verified_ago: "تم التحقق منذ {time}",
    reported_ago: "تم التبليغ منذ {time}",
    userVerified: "تم التحقق من المجتمع",
    operational: "قيد الخدمة",
    limited: "خدمة محدودة",
    closed: "مغلق",
    lrcEmergency: "طوارئ الصليب الأحمر: ١٤٠",
    safetyDisclaimerTitle: "إخلاء مسؤولية الأمان",
    safetyDisclaimerMessage: "يوفر هذا التطبيق بيانات الأمان لأغراض إعلامية فقط. أعطِ الأولوية دائماً لتعليمات السلطات المحلية. ابقَ آمناً.",
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
    emergency: "URGENCE",
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
    verified_ago: "Vérifié il y a {time}",
    reported_ago: "Signalé il y a {time}",
    userVerified: "Vérifié par la Communauté",
    operational: "Opérationnel",
    limited: "Service Limité",
    closed: "Fermé",
    lrcEmergency: "Urgence Croix-Rouge: 140",
    safetyDisclaimerTitle: "Avis de sécurité",
    safetyDisclaimerMessage: "Cette application fournit des données de sécurité à titre informatif uniquement. Priorisez toujours les instructions des autorités locales. Restez en sécurité.",
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
  useEffect(() => { onBoundsChange(map.getBounds()); }, [map, onBoundsChange]);
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
  useEffect(() => {
    if (!map) return;
    if (focusedAlertId) {
      const alert = alerts.find(a => a.id === focusedAlertId);
      if (alert) map.setView(alert.coordinates, 14);
    } else if (searchLocation) {
      map.setView(searchLocation, 12);
    }
  }, [map, focusedAlertId, alerts, searchLocation]);
  return null;
};

const PulseCircle = ({ center, pulse, lowPowerMode, color = '#FF3B30' }: { center: [number, number], pulse: number, lowPowerMode: boolean, color?: string }) => {
  if (lowPowerMode) return (
    <Circle 
      center={center} 
      radius={500} 
      pathOptions={{ fillColor: color, fillOpacity: 0.3, strokeWeight: 1, color: color }} 
    />
  );
  return (
    <Circle
      center={center}
      radius={500 * pulse}
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
  theme, alerts, services, activeFilter, routePath, focusedAlertId, setFocusedAlertId, onBoundsChange, isReportingMode, onMapClick, lowPowerMode, searchLocation, onZoom
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
      zoomend: () => onZoom?.(),
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

        {alerts.filter(a => activeFilter === 'airstrike' ? a.type === 'airstrike' : true).map(alert => (
          <Fragment key={alert.id}>
            {(alert.type === 'danger' || alert.type === 'airstrike') && (
              <PulseCircle center={alert.coordinates} pulse={pulse} lowPowerMode={lowPowerMode} color={alert.type === 'airstrike' ? '#FF3B30' : '#FF3B30'} />
            )}
            <Marker
              position={alert.coordinates}
              icon={alert.type === 'airstrike' ? createCustomIcon('🔥', '#FF3B30') : alert.type === 'danger' ? dangerIcon : alert.type === 'warning' ? warningIcon : infoIcon}
              eventHandlers={{ click: () => setFocusedAlertId(alert.id) }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]" dir={isRTL ? 'rtl' : 'ltr'}>
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${alert.type === 'airstrike' || alert.type === 'danger' ? 'text-danger' : 'text-warning'}`}>
                    {alert.type === 'airstrike' ? t.airstrikes : t.dangerZone}
                  </p>
                  <p className="font-bold text-sm mb-2">{alert.message}</p>
                  <div className="flex items-center justify-between border-t pt-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">
                      {alert.isUserReported ? t.userVerified : t.verified}
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

        <MarkerClusterGroup chunkedLoading>
          {activeFilter && services.filter(s => s.type === activeFilter || activeFilter === 'all').map(service => (
            <Marker
              key={service.id}
              position={service.coordinates}
              icon={createCustomIcon(
                service.type === 'hospital' ? '🏥' :
                service.type === 'bakery' ? '🍞' :
                service.type === 'pharmacy' ? '💊' :
                service.type === 'fuel' ? '⛽' : 
                service.type === 'ngo' ? '❤️' : '🛠️',
                service.type === 'hospital' ? '#007AFF' : 
                service.type === 'ngo' ? '#FF2D55' : '#FFCC00'
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
          <Polyline positions={routePath} pathOptions={{ color: '#34C759', weight: 6, opacity: 0.8 }} />
        )}
      </MapContainer>
    </div>
  );
});

// --- Sidebar ---
const Sidebar = React.memo(({
  isSidebarOpen, isMobile, theme, setIsSidebarOpen, setIsReportModalOpen, filteredAlerts, focusedAlertId, setFocusedAlertId, getDistrictName
}: any) => {
  const { t, isRTL } = useLanguage();
  return (
    <AnimatePresence mode="wait">
      {isSidebarOpen && (
        <motion.aside
          initial={isMobile ? { y: '100%' } : { x: isRTL ? '100%' : '-100%' }}
          animate={isMobile ? { y: 0 } : { x: 0 }}
          exit={isMobile ? { y: '100%' } : { x: isRTL ? '100%' : '-100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={`fixed inset-y-0 z-[2000] w-full lg:w-80 lg:static flex flex-col border-r transition-colors duration-500 ${theme === 'dark' ? 'bg-black border-white/10' : 'bg-white border-zinc-200 shadow-xl'} ${isMobile ? 'rounded-t-[3rem] top-20' : ''} ${isRTL ? 'right-0' : 'left-0'}`}
        >
          {isMobile && <div className="flex justify-center p-4"><div className="w-12 h-1.5 bg-zinc-800 rounded-full" /></div>}
          <div className="p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-danger p-2 rounded-xl shadow-[0_0_15px_rgba(255,59,48,0.4)]"><ShieldAlert className="text-black w-6 h-6" /></div>
                <h1 className="text-2xl font-black tracking-tighter uppercase italic text-left" style={{ textAlign: 'left' }}>GUARDIAN</h1>
              </div>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setIsSidebarOpen(false)} className={`p-2 rounded-xl ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-zinc-100'}`}><X className="w-5 h-5" /></motion.button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setIsReportModalOpen(true)} className="w-full bg-danger text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(255,59,48,0.3)] flex items-center justify-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4" />{t.reportDanger}
            </motion.button>
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-2">{t.liveSafetyFeed}</h3>
              <div className="space-y-2">
                {filteredAlerts.map((alert: Alert) => (
                  <motion.div
                    key={alert.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    onClick={() => setFocusedAlertId(focusedAlertId === alert.id ? null : alert.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${focusedAlertId === alert.id ? 'bg-danger/10 border-danger' : theme === 'dark' ? 'bg-white/5 border-white/5 hover:border-white/20' : 'bg-zinc-50 border-zinc-100 hover:border-zinc-300'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 rounded ${alert.type === 'danger' ? 'bg-danger text-black' : alert.type === 'warning' ? 'bg-warning text-black' : 'bg-safety text-black'}`}>{alert.type}</span>
                      <span className="text-[8px] font-mono text-zinc-500">{alert.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-1"><MapPin className="w-3 h-3 text-zinc-500" /><p className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{alert.location} ({getDistrictName(alert.districtId)})</p></div>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">{alert.message}</p>
                  </motion.div>
                ))}
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

// --- Main App ---
export default function App() {
  const { districts, alerts, services, addAlert, locations } = useSafetyData();
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('guardian-lang') as Language) || 'en');
  
  const genAI = useMemo(() => process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null, []);

  const fetchCrisisData = useCallback(async () => {
    if (!genAI) return;
    try {
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Simulate a Telegram/RSS feed scanner for Lebanon. Summarize 2-3 realistic recent airstrike reports from verified sources in South Lebanon, Bekaa, and Beirut Dahiya. Return JSON array of objects with location, districtId (beirut, dahieh, tyre, nabatieh, baalbek), message, coordinates [lat, lng], timestamp (e.g. '5m').",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                location: { type: Type.STRING },
                districtId: { type: Type.STRING },
                message: { type: Type.STRING },
                coordinates: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                timestamp: { type: Type.STRING }
              },
              required: ["location", "districtId", "message", "coordinates", "timestamp"]
            }
          }
        }
      });

      const data = JSON.parse(response.text);
      data.forEach((report: any) => {
        addAlert({
          type: 'airstrike',
          location: report.location,
          districtId: report.districtId,
          message: report.message,
          coordinates: report.coordinates as [number, number],
          timestamp: report.timestamp,
          isUserReported: false
        } as any);
      });
    } catch (error) {
      console.error("Crisis data fetch failed:", error);
    }
  }, [addAlert, genAI]);

  useEffect(() => {
    fetchCrisisData();
    const interval = setInterval(fetchCrisisData, 300000); // Every 5 mins
    return () => clearInterval(interval);
  }, [fetchCrisisData]);

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

  const t = useMemo(() => TRANSLATIONS[language], [language]);
  const isRTL = useMemo(() => language === 'ar', [language]);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('guardian-welcome-seen');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, []);

  const dismissWelcome = () => {
    localStorage.setItem('guardian-welcome-seen', 'true');
    setShowWelcome(false);
  };

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

  const getDistrictName = (id: string) => {
    const district = districts.find(d => d.id === id);
    return district ? district.name[language] : id;
  };

  const calculateSafestRoute = () => {
    setIsRouting(true);
    setTimeout(() => {
      const start = districts.find(d => d.id === startDistrict);
      const end = districts.find(d => d.id === endDistrict);
      if (start && end) {
        // Simple straight line for demo, in real app would use routing engine
        setRoutePath([start.bounds[0], end.bounds[0]]);
      }
      setIsRouting(false);
    }, 1500);
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (isReportingMode) {
      setIsReportModalOpen(true);
      setIsReportingMode(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 3000);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      <div className={`flex h-screen w-full overflow-hidden font-sans transition-colors duration-500 ${theme === 'dark' ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>
        <Sidebar 
          isSidebarOpen={isSidebarOpen} isMobile={isMobile} theme={theme} 
          setIsSidebarOpen={setIsSidebarOpen} setIsReportModalOpen={setIsReportModalOpen} 
          filteredAlerts={filteredAlerts} focusedAlertId={focusedAlertId} 
          setFocusedAlertId={setFocusedAlertId} getDistrictName={getDistrictName}
        />

      <main className="flex-1 flex flex-col relative min-w-0 h-full">
        <header className={`sticky top-0 z-[1100] border-b backdrop-blur-xl ${theme === 'dark' ? 'bg-black/80 border-white/10' : 'bg-white/90 border-zinc-200'}`}>
          <div className="max-w-4xl mx-auto p-4 space-y-4">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setIsSidebarOpen(true)} className={`p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-zinc-100 border-zinc-200'}`}><Menu className="w-5 h-5" /></motion.button>
              <div className="flex-1 mx-4 relative">
                <div className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 focus-within:border-white/30' : 'bg-zinc-100 border-zinc-200 focus-within:border-zinc-400'}`}>
                  <Search className="w-4 h-4 text-zinc-500" />
                  <input 
                    type="text" placeholder={t.searchPlaceholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none w-full text-sm font-medium"
                  />
                </div>
                <AnimatePresence>
                  {searchResults.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className={`absolute top-full left-0 right-0 mt-2 rounded-2xl border shadow-2xl overflow-hidden z-[1200] ${theme === 'dark' ? 'bg-zinc-900 border-white/10' : 'bg-white border-zinc-200'}`}>
                      {searchResults.map((loc, i) => (
                        <button key={i} onClick={() => { 
                          setSearchQuery(''); 
                          setFocusedAlertId(null);
                          setSearchLocation(loc.coords as [number, number]);
                        }} className={`w-full p-4 text-left flex items-center gap-3 hover:bg-zinc-800 transition-colors ${i !== searchResults.length - 1 ? 'border-b border-white/5' : ''} ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                          <MapPin className="w-4 h-4 text-zinc-500" />
                          <div><p className="text-sm font-bold">{language === 'ar' ? loc.ar : (language === 'fr' && loc.fr ? loc.fr : loc.name)}</p><p className="text-[10px] text-zinc-500">{language === 'en' ? loc.ar : loc.name}</p></div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex items-center gap-2">
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setIsSettingsOpen(true)} className={`p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-zinc-100 border-zinc-200'}`}><SettingsIcon className="w-5 h-5" /></motion.button>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              <button 
                onClick={() => setActiveFilter(activeFilter === 'airstrike' ? null : 'airstrike')} 
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeFilter === 'airstrike' ? 'bg-danger text-black border-danger shadow-[0_0_15px_rgba(255,59,48,0.4)]' : 'bg-white/5 border-white/10 text-zinc-400 hover:border-white/30'}`}
              >
                <Flame className="w-3 h-3" />{t.airstrikes}
              </button>
              <button onClick={() => setActiveFilter(activeFilter === 'all' ? null : 'all')} className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeFilter === 'all' ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-zinc-400 hover:border-white/30'}`}><Shield className="w-3 h-3" />{t.allResources}</button>
              {['hospital', 'bakery', 'pharmacy', 'fuel', 'tools', 'ngo'].map(type => (
                <button key={type} onClick={() => setActiveFilter(activeFilter === type ? null : type)} className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeFilter === type ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-zinc-400 hover:border-white/30'}`}>
                  {type === 'hospital' ? <Hospital className="w-3 h-3" /> : 
                   type === 'bakery' ? <Utensils className="w-3 h-3" /> : 
                   type === 'pharmacy' ? <Pill className="w-3 h-3" /> : 
                   type === 'fuel' ? <Fuel className="w-3 h-3" /> : 
                   type === 'ngo' ? <HandHeart className="w-3 h-3" /> :
                   <Wrench className="w-3 h-3" />}
                  {t[type + (type === 'tools' || type === 'ngo' ? '' : 's')]}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="flex-1 relative">
          <MapComponent 
            theme={theme} alerts={alerts} services={services} activeFilter={activeFilter} routePath={routePath} 
            focusedAlertId={focusedAlertId} setFocusedAlertId={setFocusedAlertId} onBoundsChange={setMapBounds} 
            isReportingMode={isReportingMode} onMapClick={handleMapClick} lowPowerMode={lowPowerMode || activeFilter === 'airstrike'}
            searchLocation={searchLocation} onZoom={fetchCrisisData}
          />
          
          {isReportingMode && (
            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 border-2 border-danger rounded-full animate-ping" />
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-danger" />
                <div className="absolute left-1/2 top-0 w-0.5 h-full bg-danger" />
              </div>
            </div>
          )}

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-[1000]">
            <div className={`p-6 rounded-[2.5rem] border shadow-2xl backdrop-blur-2xl ${theme === 'dark' ? 'bg-black/60 border-white/10' : 'bg-white/80 border-zinc-200'}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{t.startPoint}</label>
                  <select value={startDistrict} onChange={(e) => setStartDistrict(e.target.value)} className={`w-full border rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-safety/50 appearance-none ${theme === 'dark' ? 'bg-black border-white/10 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`}>
                    <option value="">{t.selectDistrict}</option>
                    {districts.map(d => <option key={d.id} value={d.id}>{getDistrictName(d.id)}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{t.destination}</label>
                  <select value={endDistrict} onChange={(e) => setEndDistrict(e.target.value)} className={`w-full border rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-safety/50 appearance-none ${theme === 'dark' ? 'bg-black border-white/10 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`}>
                    <option value="">{t.selectDistrict}</option>
                    {districts.map(d => <option key={d.id} value={d.id}>{getDistrictName(d.id)}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setIsReportingMode(true)} className="flex-1 flex items-center justify-center gap-2 bg-danger text-black font-bold px-6 py-4 rounded-2xl hover:bg-danger/90 transition-all shadow-lg"><AlertTriangle className="w-5 h-5" />{t.report}</motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={calculateSafestRoute} disabled={!startDistrict || !endDistrict || isRouting} className={`flex-1 flex items-center justify-center gap-2 font-bold px-8 py-4 rounded-2xl transition-all shadow-lg ${startDistrict && endDistrict && !isRouting ? 'bg-safety text-black hover:bg-safety/90' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}>{isRouting ? <><Activity className="w-5 h-5 animate-spin" />{t.routing}</> : <><Navigation className="w-5 h-5" />{t.findSafestPath}</>}</motion.button>
                {routePath.length > 0 && <motion.button whileTap={{ scale: 0.95 }} onClick={handleShare} className="bg-zinc-800 text-white p-4 rounded-2xl hover:bg-zinc-700 transition-all shadow-lg"><Share2 className="w-5 h-5" /></motion.button>}
              </div>
            </div>
          </div>
        </div>
      </main>

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
