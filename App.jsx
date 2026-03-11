import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import { 
  AlertTriangle, 
  Navigation, 
  Phone, 
  Info, 
  Settings, 
  Shield, 
  Map as MapIcon, 
  Search, 
  Menu, 
  X, 
  Globe,
  Flame,
  HeartHandshake
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// --- CONFIGURATION & TRANSLATIONS ---
const TRANSLATIONS = {
  en: {
    title: "GUARDIAN", // Locked as requested
    airstrikes: "Airstrikes",
    ngos: "NGOs/Aid",
    hospitals: "Hospitals",
    report: "REPORT DANGER",
    searchPlaceholder: "Search village or street...",
    reported: "Reported",
    ago: "ago",
    emergency: "Emergency",
    aidType: "Aid Type",
    status: "Status"
  },
  ar: {
    title: "GUARDIAN", // Locked as requested
    airstrikes: "غارات جوية",
    ngos: "منظمات/مساعدات",
    hospitals: "مستشفيات",
    report: "تبليغ عن خطر",
    searchPlaceholder: "ابحث عن قرية أو شارع...",
    reported: "تم التبليغ",
    ago: "منذ",
    emergency: "طوارئ",
    aidType: "نوع المساعدة",
    status: "الحالة"
  },
  fr: {
    title: "GUARDIAN", // Locked as requested
    airstrikes: "Frappes",
    ngos: "ONG/Aide",
    hospitals: "Hôpitaux",
    report: "SIGNALER DANGER",
    searchPlaceholder: "Chercher village ou rue...",
    reported: "Signalé",
    ago: "il y a",
    emergency: "Urgence",
    aidType: "Type d'aide",
    status: "Statut"
  }
};

// --- MOCK DATA FOR 2026 CRISIS ---
const NGO_CENTERS = [
  { id: 1, name: "Lebanese Red Cross", type: "Medical/Ambulance", lat: 33.8938, lng: 35.5018, phone: "140" },
  { id: 2, name: "Amel Association", type: "Community Health", lat: 33.8489, lng: 35.5197, phone: "01 273 316" },
  { id: 3, name: "UNRWA Siblin", type: "Shelter/Food", lat: 33.6264, lng: 35.4144, phone: "07 720 117" }
];

const AIRSTRIKES = [
  { id: 101, location: "Haret Hreik", lat: 33.8547, lng: 35.5097, time: "12m" },
  { id: 102, location: "Nabatiyeh", lat: 33.3772, lng: 35.4833, time: "45m" }
];

// --- MAIN APPLICATION COMPONENT ---
export default function GuardianApp() {
  const [lang, setLang] = useState('en');
  const [activeLayer, setActiveLayer] = useState('airstrikes');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const t = TRANSLATIONS[lang];

  const isRTL = lang === 'ar';

  return (
    <div className={`flex h-screen w-full bg-slate-900 text-white font-sans ${isRTL ? 'flex-row-reverse' : 'flex-row'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* SIDEBAR */}
      <div className={`w-80 bg-slate-800 flex flex-col shadow-2xl transition-all z-[1000] ${sidebarOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')}`}>
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h1 className="text-2xl font-black tracking-tighter text-red-500">GUARDIAN</h1>
          <button onClick={() => setSidebarOpen(false)}><X size={20}/></button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Language Switcher */}
          <div className="flex gap-2 p-1 bg-slate-900 rounded-lg">
            {['en', 'ar', 'fr'].map(l => (
              <button 
                key={l} 
                onClick={() => setLang(l)}
                className={`flex-1 py-1 text-xs rounded ${lang === l ? 'bg-red-600 text-white' : 'text-slate-400'}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder={t.searchPlaceholder}
              className={`w-full bg-slate-900 border-none rounded-lg py-2 ${isRTL ? 'pr-10' : 'pl-10'} text-sm focus:ring-2 focus:ring-red-500`}
            />
          </div>

          {/* Crisis Feed */}
          <div className="space-y-3 pt-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t.airstrikes}</h3>
            {AIRSTRIKES.map(strike => (
              <div key={strike.id} className="bg-slate-900 p-3 rounded-lg border-l-4 border-red-600">
                <div className="flex justify-between items-start">
                  <span className="font-bold">{strike.location}</span>
                  <span className="text-[10px] bg-red-900/50 text-red-400 px-2 py-0.5 rounded-full">{strike.time} {t.ago}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4 bg-slate-900">
          <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-red-900/20">
            <AlertTriangle size={20} />
            {t.report}
          </button>
        </div>
      </div>

      {/* MAP AREA */}
      <div className="flex-1 relative">
        <MapContainer center={[33.8938, 35.5018]} zoom={10} style={{ height: '100%', width: '100%' }}>
          <TileLayer 
             url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
             attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Airstrike Layer */}
          {activeLayer === 'airstrikes' && AIRSTRIKES.map(strike => (
            <React.Fragment key={strike.id}>
              <Circle 
                center={[strike.lat, strike.lng]} 
                radius={2000} 
                pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.2 }} 
              />
              <Marker position={[strike.lat, strike.lng]}>
                <Popup>
                  <div className="text-slate-900 p-1">
                    <p className="font-bold flex items-center gap-2"><Flame size={16} color="red"/> {t.airstrikes}</p>
                    <p className="text-sm">{strike.location} - {strike.time} {t.ago}</p>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          ))}

          {/* NGO Layer */}
          {NGO_CENTERS.map(center => (
            <Marker key={center.id} position={[center.lat, center.lng]}>
              <Popup>
                <div className="text-slate-900 p-1">
                  <p className="font-bold flex items-center gap-2 text-blue-600"><HeartHandshake size={16}/> {center.name}</p>
                  <p className="text-xs"><b>{t.aidType}:</b> {center.type}</p>
                  <a href={`tel:${center.phone}`} className="text-blue-600 font-bold block mt-2">📞 {center.phone}</a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Layer Controls (Floating) */}
        <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex bg-slate-800/90 backdrop-blur-md p-1.5 rounded-2xl shadow-2xl border border-white/10 z-[1001]`}>
          <button 
            onClick={() => setActiveLayer('airstrikes')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeLayer === 'airstrikes' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Flame size={18} /> {t.airstrikes}
          </button>
          <button 
            onClick={() => setActiveLayer('ngos')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeLayer === 'ngos' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <HeartHandshake size={18} /> {t.ngos}
          </button>
        </div>

        {!sidebarOpen && (
          <button 
            onClick={() => setSidebarOpen(true)}
            className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} bg-slate-800 p-3 rounded-xl z-[1001] shadow-lg`}
          >
            <Menu size={24} />
          </button>
        )}
      </div>
    </div>
  );
}
