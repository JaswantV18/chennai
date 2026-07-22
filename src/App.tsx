import React, { useState, useEffect, FormEvent } from "react";
import { motion } from "motion/react";
import Markdown from "react-markdown";
import {
  ZoneData,
  SelectedMetric,
  User,
  SystemStatus,
  HistoryRecord,
} from "./types";
import ChennaiMap from "./components/ChennaiMap";
import IntroPortal from "./components/IntroPortal";
import SitePlannerModal from "./components/SitePlannerModal";
import ZoneDetailsCard from "./components/ZoneDetailsCard";
import {
  MapPin, Map,
  AlertTriangle,
  Wind,
  Thermometer,
  Droplets,
  Car,
  Users,
  RefreshCw,
  User as UserIcon,
  Sparkles,
  CheckCircle2,
  MessageSquare,
  Clock,
  ArrowUpRight,
  Activity,
  Compass,
  HelpCircle,
  Database,
  Mail,
  Zap,
} from "lucide-react";

export default function App() {
  // Global Metrics state
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<SelectedMetric>("aqi");
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>("Z01");
  const [timeOfDay, setTimeOfDay] = useState<"Morning" | "Afternoon" | "Evening" | "Night">("Morning");
  const [compareZoneId, setCompareZoneId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(900);
  const [refreshing, setRefreshing] = useState(false);

  // Authenticated user state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("chennai_sustainability_user");
    return saved ? JSON.parse(saved) : null;
  });

  // UI Modals state
  const [introPortalOpen, setIntroPortalOpen] = useState(true);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [sitePlannerOpen, setSitePlannerOpen] = useState(false);

  // System status and logs
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [historicalLogs, setHistoricalLogs] = useState<any[]>([]);

  // AI Assistant chat state
  const [chatPrompt, setChatPrompt] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string; sources?: {uri: string, title: string}[] }>>([
    {
      sender: "ai",
      text: "Greetings! I am the Chennai Sustainability AI Advisor. Click any zone to explore active environmental telemetry, and ask me custom urban planning or policy questions below.",
    },
  ]);

  // Profile Form state (for updating profile)
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    age: "",
    occupation: "",
    avatar: "avatar_1",
  });

  // Fetch live metrics from Node backend
  const fetchLiveData = async () => {
    try {
      const res = await fetch("/api/data", { headers: { "Accept": "application/json" } });
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        throw new Error("Received HTML instead of JSON. The preview proxy might have intercepted the request.");
      }
      const data = await res.json();
      if (data.success) {
        setZones(data.zones);
        setCountdown(data.countdown);
        localStorage.setItem("chennai_zones_cache", JSON.stringify(data.zones));
        localStorage.setItem("chennai_zones_cache_timestamp", Date.now().toString());
      }
    } catch (err) {
      console.error("Failed to fetch live data:", err);
      // Fallback to offline cache
      const cached = localStorage.getItem("chennai_zones_cache");
      if (cached) {
        console.log("Serving offline cached zones data");
        setZones(JSON.parse(cached));
      }
    }
  };

  // Fetch status and logs
  const fetchSystemMetrics = async () => {
    try {
      const statusRes = await fetch("/api/status", { headers: { "Accept": "application/json" } });
      if (statusRes.headers.get("content-type")?.includes("text/html")) throw new Error("Proxy");
      const statusData = await statusRes.json();
      if (statusData.success) {
        setSystemStatus(statusData);
        localStorage.setItem("chennai_status_cache", JSON.stringify(statusData));
      }
    } catch (err) {
      console.error("Failed to fetch status metrics:", err);
      const cachedStatus = localStorage.getItem("chennai_status_cache");
      if (cachedStatus) {
        setSystemStatus(JSON.parse(cachedStatus));
      }
    }

    try {
      const historyRes = await fetch("/api/history", { headers: { "Accept": "application/json" } });
      if (historyRes.headers.get("content-type")?.includes("text/html")) throw new Error("Proxy");
      const historyData = await historyRes.json();
      if (historyData.success) {
        setHistoricalLogs(historyData.history);
        localStorage.setItem("chennai_history_cache", JSON.stringify(historyData.history));
      }
    } catch (err) {
      console.error("Failed to fetch history metrics:", err);
      const cachedHistory = localStorage.getItem("chennai_history_cache");
      if (cachedHistory) {
        setHistoricalLogs(JSON.parse(cachedHistory));
      }
    }
  };

  useEffect(() => {
    fetchLiveData();
    fetchSystemMetrics();

    // Poll live data and status every 4 seconds to sync countdowns and random variations
    const interval = setInterval(() => {
      fetchLiveData();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Update profile form state when user changes
  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.name,
        phone: currentUser.phone,
        age: currentUser.age.toString(),
        occupation: currentUser.occupation,
        avatar: currentUser.avatar,
      });
    }
  }, [currentUser]);

  // Manual trigger refresh
  const triggerManualRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/refresh", { method: "POST", headers: { "Accept": "application/json" } });
      if (res.headers.get("content-type")?.includes("text/html")) throw new Error("Proxy");
      const data = await res.json();
      if (data.success) {
        setZones(data.zones);
        setCountdown(data.countdown);
        fetchSystemMetrics(); // update history too
      }
    } catch (err) {
      console.error("Refresh triggered failed:", err);
    } finally {
      setTimeout(() => setRefreshing(false), 800);
    }
  };

  // Profile Registration or login success callback
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("chennai_sustainability_user", JSON.stringify(user));
  };

  // Logout
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("chennai_sustainability_user");
    localStorage.removeItem("authToken");
  };

  // Update user profile profile details
  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/auth/profile/update", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          email: currentUser.email,
          name: profileForm.name,
          phone: profileForm.phone,
          age: parseInt(profileForm.age),
          occupation: profileForm.occupation,
          avatar: profileForm.avatar,
        }),
      });
      if (res.headers.get("content-type")?.includes("text/html")) throw new Error("Proxy error");
      const data = await res.json();
      if (data.success) {
        handleLoginSuccess(data.user);
        setProfileModalOpen(false);
      }
    } catch (err) {
      console.error("Profile update failed", err);
    }
  };

  // Send message to Gemini AI chatbot
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatPrompt.trim()) return;

    const userMsg = chatPrompt;
    setChatMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setChatPrompt("");
    setChatLoading(true);

    const activeZone = zones.find((z) => z.id === selectedZoneId);

    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          prompt: userMsg,
          selectedZoneId: selectedZoneId,
          contextMetrics: activeZone,
        }),
      });
      if (res.headers.get("content-type")?.includes("text/html")) throw new Error("Proxy error");
      const data = await res.json();
      if (data.success) {
        setChatMessages((prev) => [...prev, { sender: "ai", text: data.text, sources: data.sources }]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: "My apologies. I lost connection to our neural nodes. Please ensure your Gemini key is configured correctly in Secrets.",
          },
        ]);
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Failed to reach AI nodes. Serving regional offline backup policy: We highly recommend implementing active biomining pipelines in trash corridors.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Helpers to select active details
  
  const getSimulatedZone = (z: ZoneData) => {
    let tMult = 1, vMult = 1, aMult = 1;
    if (timeOfDay === "Morning") { tMult = 0.9; vMult = 1.2; aMult = 1.1; }
    else if (timeOfDay === "Afternoon") { tMult = 1.15; vMult = 0.8; aMult = 1.0; }
    else if (timeOfDay === "Evening") { tMult = 1.0; vMult = 1.3; aMult = 1.2; }
    else if (timeOfDay === "Night") { tMult = 0.8; vMult = 0.2; aMult = 0.8; }
    
    return {
      ...z,
      temp: z.temp * tMult,
      vehicles: z.vehicles * vMult,
      aqi: Math.round(z.aqi * aMult),
      pm25: Math.round(z.pm25 * aMult),
      pm10: Math.round(z.pm10 * aMult),
    };
  };

  const simulatedZones = zones.map(getSimulatedZone);
  const activeZone = simulatedZones.find((z) => z.id === selectedZoneId) || simulatedZones[0];
  const compareZone = compareZoneId ? simulatedZones.find((z) => z.id === compareZoneId) : null;


  if (zones.length === 0) return <div className="min-h-screen flex items-center justify-center bg-[#09090B] text-white">Loading live environmental data...</div>;

  // Compute city-wide averages
  const avgTemp = zones.length ? zones.reduce((acc, z) => acc + z.temp, 0) / zones.length : 33.1;
  const avgRainfall = zones.length ? zones.reduce((acc, z) => acc + z.rainfall, 0) / zones.length : 5.2;
  const avgHumidity = zones.length ? zones.reduce((acc, z) => acc + z.humidity, 0) / zones.length : 71.5;
  const avgAqi = zones.length ? Math.round(zones.reduce((acc, z) => acc + z.aqi, 0) / zones.length) : 98;

  // Sorted list for sorting sidebars based on active metric
  const sortedZones = [...zones].sort((a, b) => {
    let valA = 0;
    let valB = 0;
    switch (selectedMetric) {
      case "aqi":
        valA = a.aqi;
        valB = b.aqi;
        break;
      case "temp":
        valA = a.temp;
        valB = b.temp;
        break;
      case "humidity":
        valA = a.humidity;
        valB = b.humidity;
        break;
      case "rainfall":
        valA = a.rainfall;
        valB = b.rainfall;
        break;
      case "vehicles":
        valA = a.vehicles;
        valB = b.vehicles;
        break;
      case "population":
        valA = a.pop;
        valB = b.pop;
        break;
      case "density":
        valA = a.density;
        valB = b.density;
        break;
    }
    return valB - valA; // Descending order
  });

  // Avatar presets mapping
  const AVATAR_MAP: Record<string, { emoji: string; name: string; bg: string }> = {
    avatar_1: { emoji: "🌱", name: "Eco Advocate", bg: "from-emerald-400 to-green-600" },
    avatar_2: { emoji: "🔬", name: "Climate Scientist", bg: "from-cyan-400 to-blue-600" },
    avatar_3: { emoji: "📐", name: "Urban Planner", bg: "from-amber-400 to-orange-600" },
    avatar_4: { emoji: "🏢", name: "Green Architect", bg: "from-teal-400 to-emerald-600" },
    avatar_5: { emoji: "🌍", name: "Sustainability Lead", bg: "from-purple-400 to-indigo-600" },
    avatar_6: { emoji: "✊", name: "Citizen Activist", bg: "from-rose-400 to-red-600" },
  };

  return (
    <div className="w-full min-h-screen bg-[#0A0B10] text-[#E0E0E0] flex flex-col font-sans select-none antialiased">
      {/* 1. HEADER / UNIFIED NAVBAR */}
      <header className="sticky top-0 z-40 bg-[#111218] border-b border-[#2D2D35] px-6 py-3 flex flex-col sm:flex-row justify-between items-center gap-3">
        {/* Title Brand */}
        <div className="flex items-center gap-4">
          <div
            onClick={() => setIntroPortalOpen(true)}
            className="w-8 h-8 rounded bg-[#3B82F6] flex items-center justify-center font-bold text-white italic cursor-pointer hover:scale-105 transition-transform"
          >
            CH
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-none">
              PROJECT BLUEPRINT: <span className="text-[#3B82F6]">CHENNAI SUSTAINABILITY</span>
            </h1>
          </div>
        </div>

        {/* Global Metric Select Dropdown */}
        <div className="flex items-center gap-6">
          <div className="relative mt-3">
            <label className="text-[10px] uppercase text-[#71717A] absolute -top-4 left-0">Global View Metric</label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as SelectedMetric)}
              className="bg-[#1C1D24] border border-[#2D2D35] text-sm rounded px-3 py-1.5 w-48 focus:outline-none focus:ring-1 focus:ring-[#3B82F6] cursor-pointer"
            >
              <option value="aqi">Air Quality Index (AQI)</option>
              <option value="temp">Ambient Temperature</option>
              <option value="humidity">Relative Humidity</option>
              <option value="rainfall">Precipitation Index</option>
              <option value="vehicles">Active Vehicle Count</option>
              <option value="population">Total Population</option>
              <option value="density">Population Density (/km2)</option>
            </select>
          </div>
          <div className="relative mt-3">
            <label className="text-[10px] uppercase text-[#71717A] absolute -top-4 left-0">Time of Day (Sim)</label>
            <select
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value as any)}
              className="bg-[#1C1D24] border border-[#2D2D35] text-sm rounded px-3 py-1.5 w-32 focus:outline-none focus:ring-1 focus:ring-[#3B82F6] cursor-pointer"
            >
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Evening">Evening</option>
              <option value="Night">Night</option>
            </select>
          </div>


          {/* User Identity & Admin Panel buttons */}
          <div className="flex items-center gap-3 pr-6">
            <button
              onClick={() => setSitePlannerOpen(true)}
              className="px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/30 text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Map className="w-4 h-4" />
              Site Planner
            </button>
          </div>
          <div className="flex items-center gap-3 pl-6 border-l border-[#2D2D35]">
            <button
              onClick={() => setFaqModalOpen(true)}
              className="p-1.5 rounded bg-[#1C1D24] hover:bg-[#2D2D35] text-[#71717A] hover:text-white border border-[#2D2D35] transition-colors cursor-pointer"
              title="System Architecture FAQ"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-medium text-white">{currentUser.name}</p>
                  <p className="text-[10px] text-green-400">Verified • OTP Active</p>
                </div>
                <button
                  onClick={() => setProfileModalOpen(true)}
                  className="w-10 h-10 rounded-full border-2 border-[#3B82F6] overflow-hidden bg-[#2D2D35] flex items-center justify-center cursor-pointer hover:opacity-90"
                >
                  <div
                    className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${
                      AVATAR_MAP[currentUser.avatar]?.bg || "from-blue-500 to-indigo-600"
                    } font-bold text-white text-xs`}
                  >
                    {AVATAR_MAP[currentUser.avatar]?.emoji || "👤"}
                  </div>
                </button>
                <button
                  onClick={handleLogout}
                  className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wider pl-1.5 cursor-pointer"
                >
                  Exit
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIntroPortalOpen(true)}
                className="flex items-center gap-1.5 bg-[#3B82F6] hover:bg-blue-600 text-white font-semibold text-xs px-3.5 py-1.5 rounded transition-all cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5" />
                Secure Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Climate Canvas Overlay (Top visual feedback) */}
      <div className="h-1 bg-gradient-to-r from-blue-500/20 via-blue-400 to-blue-500/20 w-full relative z-30">
        <div className="absolute top-0 left-0 w-full h-full flex justify-around opacity-40">
          <div className="w-px h-full bg-blue-300"></div>
          <div className="w-px h-full bg-blue-300"></div>
          <div className="w-px h-full bg-blue-300"></div>
        </div>
      </div>

      {/* 2. CORE SYSTEM LAYOUT GRID */}
      <main className="flex-1 relative w-full h-full overflow-hidden">
        {/* Fullscreen 3D Map Background */}
        <div className="absolute inset-0 z-0 bg-[#050505]">
          {zones.length > 0 ? (
            <ChennaiMap
              zones={simulatedZones}
              selectedMetric={selectedMetric}
              selectedZoneId={selectedZoneId}
              onSelectZone={(id) => setSelectedZoneId(id)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[#71717A] font-mono text-xs">
              Rendering WebGL Map Canvas...
            </div>
          )}
        </div>

        {/* BOTTOM STRIP: 16 ZONES HORIZONTAL MENU */}
        <aside className="absolute bottom-4 left-4 right-[380px] h-[100px] border border-[#2D2D35] bg-[#0E0F14]/90 backdrop-blur-md flex flex-row shrink-0 rounded z-10 shadow-2xl overflow-hidden pointer-events-auto hidden lg:flex">
          {/* Refresh/Sync Controls */}
          <div className="w-[120px] flex flex-col justify-center items-center border-r border-[#2D2D35] p-2 shrink-0 bg-[#0A0B10]">
            <div className="text-[9px] text-[#71717A] mb-1">AUTO-RECOUNT</div>
            <div className="font-mono text-white font-bold mb-2 text-xs">
              {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}
            </div>
            <button
              onClick={triggerManualRefresh}
              disabled={refreshing}
              className="w-full py-1 rounded bg-[#1C1D24] border border-[#2D2D35] hover:border-blue-500 font-mono text-[9px] text-white transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
              SYNC
            </button>
          </div>

          {/* Scrolling Horizontal Ranked List */}
          <div className="flex-1 overflow-x-auto no-scrollbar flex flex-row p-2 gap-2 items-center">
            {sortedZones.map((z, idx) => {
              const isSelected = z.id === selectedZoneId;
              const isNew = z.oldAqi === null;

              // Render active value beautifully based on selectedMetric
              let valStr = "";
              let unit = "";
              if (selectedMetric === "aqi") {
                valStr = z.aqi.toString();
              } else if (selectedMetric === "temp") {
                valStr = `${z.temp}°`;
                unit = "C";
              } else if (selectedMetric === "humidity") {
                valStr = `${z.humidity}%`;
              } else if (selectedMetric === "rainfall") {
                valStr = `${z.rainfall}`;
                unit = "mm";
              } else if (selectedMetric === "vehicles") {
                valStr = `${(z.vehicles / 1000).toFixed(0)}k`;
              } else if (selectedMetric === "population") {
                valStr = `${(z.pop / 1000).toFixed(0)}k`;
              } else if (selectedMetric === "density") {
                valStr = z.density.toLocaleString();
                unit = "/km²";
              }

              return (
                <div
                  key={z.id}
                  onClick={() => setSelectedZoneId(z.id)}
                  className={`min-w-[140px] h-full p-2 rounded-sm border transition-all cursor-pointer relative flex flex-col justify-center ${
                    isSelected
                      ? "bg-blue-900/10 border-blue-500/30 ring-1 ring-blue-500/20"
                      : "bg-[#16171D] border-[#2D2D35] hover:opacity-80"
                  }`}
                >
                  <p className="text-[9px] text-[#71717A] mb-0.5">
                    ZONE {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                  </p>
                  <p className="text-[11px] font-bold text-white mb-1 truncate" title={z.name}>{z.name}</p>
                  
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className={`text-xs font-mono font-bold ${
                      selectedMetric === "aqi" && z.aqi > 100 ? "text-red-400" :
                      selectedMetric === "aqi" && z.aqi > 50 ? "text-yellow-400" :
                      selectedMetric === "aqi" ? "text-green-400" :
                      "text-[#3B82F6]"
                    }`}>
                      {valStr}
                    </span>
                    <span className="text-[8px] text-[#71717A] uppercase">{unit || selectedMetric}</span>
                  </div>

                  {isNew && (
                    <span className="absolute top-2 right-2 bg-green-500/10 text-green-400 text-[7px] font-mono px-1 rounded border border-green-500/20">
                      NEW
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* RIGHT COLUMN: DETAIL DATA REPORT PANELS (Floating) */}
        <aside className={`absolute top-4 right-4 bottom-4 ${compareZoneId ? "w-[700px]" : "w-[350px]"} border border-[#2D2D35] bg-[#0E0F14]/90 backdrop-blur-md rounded shadow-2xl p-4 flex flex-col shrink-0 overflow-y-auto no-scrollbar z-10 pointer-events-auto hidden md:flex transition-all duration-300`}>
          
          {/* Compare Zone Selector */}
          <div className="mb-4 pb-4 border-b border-[#2D2D35] flex items-center justify-between">
            <h3 className="text-xs font-bold text-white tracking-widest uppercase">Compare Zones</h3>
            <select
              value={compareZoneId || ""}
              onChange={(e) => setCompareZoneId(e.target.value === "" ? null : e.target.value)}
              className="bg-[#1C1D24] border border-[#2D2D35] text-xs rounded px-2 py-1 w-40 focus:outline-none focus:ring-1 focus:ring-[#3B82F6] cursor-pointer"
            >
              <option value="">-- No Comparison --</option>
              {zones.filter(z => z.id !== selectedZoneId).map(z => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </div>

          <div className={`flex gap-4 mb-4 ${compareZoneId ? 'flex-row' : 'flex-col'}`}>
            {activeZone && (
              <div className={compareZoneId ? "w-1/2" : "w-full"}>
                <ZoneDetailsCard zone={activeZone} history={historicalLogs} />
              </div>
            )}
            
            {compareZoneId && compareZone && (
              <div className="w-1/2 border-l border-[#2D2D35] pl-4">
                <ZoneDetailsCard zone={compareZone} history={historicalLogs} />
              </div>
            )}
          </div>
          
{/* INTEGRATED CHENNAI SUSTAINABILITY AI CHAT */}
              <div className="bg-[#16171D] border border-[#2D2D35] rounded p-3 space-y-3.5">
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <div>
                    <h4 className="text-[11px] font-bold text-white uppercase tracking-widest">
                      AI Search Assistant
                    </h4>
                    <p className="text-[8px] font-mono text-[#52525B]">
                      Powered by Gemini & Google Search
                    </p>
                  </div>
                </div>

                {/* Conversation Scroller */}
                <div className="h-[120px] overflow-y-auto no-scrollbar space-y-2 bg-[#0A0B10] p-2 rounded border border-[#2D2D35] text-[10px] leading-relaxed">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-1.5 rounded ${
                        msg.sender === "user"
                          ? "bg-blue-900/20 text-blue-100 border border-blue-500/20 ml-4 text-right"
                          : "bg-[#1C1D24] text-[#E0E0E0] mr-4 border border-[#2D2D35]"
                      }`}
                    >
                      <Markdown>{msg.text}</Markdown>
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-[#2D2D35]/50 flex flex-col gap-1">
                          <span className="text-[8px] uppercase tracking-wider text-[#71717A]">Sources:</span>
                          {msg.sources.map((s, idx) => (
                            <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="text-[#3B82F6] hover:underline truncate">
                              {s.title || s.uri}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="text-[#52525B] font-mono text-[9px] animate-pulse">
                      Analyzing regional datasets...
                    </div>
                  )}
                </div>

                {/* Question Input */}
                <form onSubmit={handleSendMessage} className="flex gap-1.5">
                  <input
                    type="text"
                    value={chatPrompt}
                    onChange={(e) => setChatPrompt(e.target.value)}
                    placeholder="Ask anything, searching live..."
                    className="flex-1 bg-[#0A0B10] border border-[#2D2D35] rounded py-1.5 px-2.5 text-[10px] text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                  <button
                    type="submit"
                    disabled={chatLoading}
                    className="px-3 rounded bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-[10px] cursor-pointer"
                  >
                    SEND
                  </button>
                </form>
              </div>
        </aside>
      </main>

      {/* Global Status Footer */}
      <footer className="h-8 border-t border-[#2D2D35] bg-[#0E0F14] px-4 flex items-center justify-between text-[10px] text-[#71717A] font-mono shrink-0 z-40 relative">
        <div className="flex gap-6">
          <div className="flex gap-2 items-center">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            SYSTEMS NOMINAL
          </div>
          <div className="hidden sm:block">LAT: 13.0827° N | LONG: 80.2707° E</div>
          <div className="hidden sm:block">TEMP: 31°C | HUM: 74%</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#52525B]">VERSION 2.4.0-STABLE</span>
          <span className="text-[#3B82F6]">© 2024 TAMIL NADU URBAN PLANNING</span>
        </div>
      </footer>

      {/* 3. MODALS: INTRO PORTAL, PROFILE SETTINGS, SYSTEM ARCHITECTURE FAQ */}

      {/* Intro Onboarding & Passwordless Login Portal */}
      <IntroPortal
        isOpen={introPortalOpen}
        onClose={() => setIntroPortalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Edit Profile Modal */}
      {profileModalOpen && currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050505]/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded bg-[#111218] border border-[#2D2D35] p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#2D2D35] pb-2">
              <h3 className="text-[11px] font-bold text-[#E0E0E0] uppercase tracking-widest flex items-center gap-1.5">
                <UserIcon className="w-4 h-4 text-[#3B82F6]" />
                Customize User Profile
              </h3>
              <button
                onClick={() => setProfileModalOpen(false)}
                className="text-xs text-[#71717A] hover:text-white cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={updateProfile} className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono text-[#71717A] uppercase mb-1">
                  Email Address (Verified)
                </label>
                <input
                  type="email"
                  disabled
                  value={currentUser.email}
                  className="w-full bg-[#1C1D24] border border-[#2D2D35] rounded py-1.5 px-3 text-xs text-[#71717A] cursor-not-allowed focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[#71717A] uppercase mb-1">
                  1. Full Name
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                  className="w-full bg-[#0A0B10] border border-[#2D2D35] rounded py-1.5 px-3 text-xs text-white focus:outline-none focus:border-[#3B82F6]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[#71717A] uppercase mb-1">
                  2. Contact Phone
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.phone}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, phone: e.target.value })
                  }
                  className="w-full bg-[#0A0B10] border border-[#2D2D35] rounded py-1.5 px-3 text-xs text-white focus:outline-none focus:border-[#3B82F6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-mono text-[#71717A] uppercase mb-1">
                    3. Age
                  </label>
                  <input
                    type="number"
                    required
                    value={profileForm.age}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, age: e.target.value })
                    }
                    className="w-full bg-[#0A0B10] border border-[#2D2D35] rounded py-1.5 px-3 text-xs text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-[#71717A] uppercase mb-1">
                    4. Occupation
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.occupation}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        occupation: e.target.value,
                      })
                    }
                    className="w-full bg-[#0A0B10] border border-[#2D2D35] rounded py-1.5 px-3 text-xs text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>
              </div>

              {/* Preset avatar selection */}
              <div>
                <label className="block text-[10px] font-mono text-[#71717A] uppercase mb-1">
                  5. Avatar Archetype
                </label>
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {Object.entries(AVATAR_MAP).map(([id, av]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setProfileForm({ ...profileForm, avatar: id })}
                      className={`p-1.5 rounded border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                        profileForm.avatar === id
                          ? "border-[#3B82F6] bg-blue-500/10"
                          : "border-[#2D2D35] bg-[#16171D] hover:border-[#71717A]"
                      }`}
                    >
                      <div className="text-base mb-0.5">{av.emoji}</div>
                      <span className="text-[8px] text-[#E0E0E0] truncate w-full text-center">
                        {av.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  className="flex-1 py-2 px-3 rounded bg-[#1C1D24] hover:bg-[#2D2D35] text-xs font-bold text-[#E0E0E0] border border-[#2D2D35] transition-all cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 rounded bg-[#3B82F6] hover:bg-blue-600 text-xs font-bold text-white transition-all cursor-pointer"
                >
                  SAVE PROFILE
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* System Architecture FAQ Modal */}
      <SitePlannerModal isOpen={sitePlannerOpen} onClose={() => setSitePlannerOpen(false)} />
      {faqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050505]/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl rounded bg-[#111218] border border-[#2D2D35] p-6 space-y-4 max-h-[85vh] overflow-y-auto no-scrollbar"
          >
            <div className="flex items-center justify-between border-b border-[#2D2D35] pb-2">
              <h3 className="text-[11px] font-bold text-white flex items-center gap-1.5 uppercase tracking-widest">
                <Compass className="w-4 h-4 text-[#3B82F6]" />
                Engineering & Architecture Decisions
              </h3>
              <button
                onClick={() => setFaqModalOpen(false)}
                className="text-xs text-[#71717A] hover:text-white cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-[#E0E0E0]">
              <div className="bg-[#16171D] p-3 rounded border border-[#2D2D35]">
                <div className="flex items-center gap-2 text-[#3B82F6] font-bold mb-1">
                  <Mail className="w-4 h-4" />
                  <h4 className="uppercase tracking-wide text-[10px]">Q1: Email OTP Backend Infrastructure?</h4>
                </div>
                <p className="text-[11px] text-[#71717A] leading-relaxed">
                  <strong>Answer:</strong> In production deployments, standard SMTP/REST integrations via <strong>AWS SES</strong>, <strong>SendGrid</strong>, or <strong>Mailgun</strong> are implemented to guarantee deliverability. In our sandbox preview environment, codes are printed in server logs and safely exposed in debug banners, enabling 100% testable authentication in the preview container without configuring mail credentials.
                </p>
              </div>

              <div className="bg-[#16171D] p-3 rounded border border-[#2D2D35]">
                <div className="flex items-center gap-2 text-orange-400 font-bold mb-1">
                  <Zap className="w-4 h-4" />
                  <h4 className="uppercase tracking-wide text-[10px]">Q2: 3D Map Engine Choice?</h4>
                </div>
                <p className="text-[11px] text-[#71717A] leading-relaxed">
                  <strong>Answer:</strong> We leveraged an optimized, native <strong>Three.js (WebGL) Engine</strong> combined with <strong>OrbitControls</strong> and <strong>Raycasting</strong>. This avoids external Mapbox/Google billings or client tokens which fail in sandbox previews, and allows customized <strong>3x building height extrusions</strong> with smooth color/height state transitions in React.
                </p>
              </div>

              <div className="bg-[#16171D] p-3 rounded border border-[#2D2D35]">
                <div className="flex items-center gap-2 text-purple-400 font-bold mb-1">
                  <Database className="w-4 h-4" />
                  <h4 className="uppercase tracking-wide text-[10px]">Q3: Database Strategy?</h4>
                </div>
                <p className="text-[11px] text-[#71717A] leading-relaxed">
                  <strong>Answer:</strong> User profiles, active secure OTP registers, and historical comparisons are stored in a highly durable, structured, cached <strong>server-side JSON file database</strong> (<code>database.json</code>). This ensures instant container speeds, zero external database setup steps, and robust offline caching features.
                </p>
              </div>

              <div className="bg-[#16171D] p-3 rounded border border-[#2D2D35]">
                <div className="flex items-center gap-2 text-green-400 font-bold mb-1">
                  <Activity className="w-4 h-4" />
                  <h4 className="uppercase tracking-wide text-[10px]">Q4: Weather API Provider?</h4>
                </div>
                <p className="text-[11px] text-[#71717A] leading-relaxed">
                  <strong>Answer:</strong> We integrate real-time air quality data directly from the <strong>World Air Quality Index (WAQI)</strong> network. This avoids key outages and powers the <strong>Dynamic Climate Canvas</strong> (with real active raindrops, solar glows, and fog layers) perfectly.
                </p>
              </div>
            </div>

            <button
              onClick={() => setFaqModalOpen(false)}
              className="w-full py-2 px-4 rounded bg-[#1C1D24] hover:bg-[#2D2D35] text-xs font-bold text-[#E0E0E0] transition-all border border-[#2D2D35] cursor-pointer tracking-wider"
            >
              CLOSE GUIDELINES
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
