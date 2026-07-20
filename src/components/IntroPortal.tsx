import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Shield, Compass, BookOpen, Star, Sparkles, Send, CheckCircle2 } from "lucide-react";

interface IntroPortalProps {
  onLoginSuccess: (user: any) => void;
  onClose: () => void;
  isOpen: boolean;
}

// Preset avatars
const PRESET_AVATARS = [
  { id: "avatar_1", name: "Eco Advocate", emoji: "🌱", color: "from-emerald-400 to-green-600" },
  { id: "avatar_2", name: "Climate Scientist", emoji: "🔬", color: "from-cyan-400 to-blue-600" },
  { id: "avatar_3", name: "Urban Planner", emoji: "📐", color: "from-amber-400 to-orange-600" },
  { id: "avatar_4", name: "Green Architect", emoji: "🏢", color: "from-teal-400 to-emerald-600" },
  { id: "avatar_5", name: "Sustainability Lead", emoji: "🌍", color: "from-purple-400 to-indigo-600" },
  { id: "avatar_6", name: "Citizen Activist", emoji: "✊", color: "from-rose-400 to-red-600" },
];

export default function IntroPortal({ onLoginSuccess, onClose, isOpen }: IntroPortalProps) {
  const [activeTab, setActiveTab] = useState<"onboarding" | "login" | "register">("onboarding");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Registration Form Fields (Standardized 5 Fields)
  const [regForm, setRegForm] = useState({
    name: "",
    phone: "",
    age: "",
    occupation: "",
    avatar: "avatar_1",
  });

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setSuccessMsg("OTP Verification code sent successfully!");
        if (data.debugCode) {
          setDebugOtp(data.debugCode);
        }
      } else {
        setErrorMsg(data.message || "Failed to send OTP.");
      }
    } catch (err) {
      setErrorMsg("Could not connect to the authentication server.");
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    if (!otpCode || otpCode.length < 5) {
      setErrorMsg("Please enter a valid OTP code.");
      return;
    }

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otpCode }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.registrationRequired) {
          setSuccessMsg("Verification success! Please register your sustainability profile.");
          setActiveTab("register");
        } else {
          setSuccessMsg("Authentication successful! Welcome back.");
          onLoginSuccess(data.user);
          setTimeout(() => {
            onClose();
          }, 1000);
        }
      } else {
        setErrorMsg(data.message || "Invalid or expired verification code.");
      }
    } catch (err) {
      setErrorMsg("Verification request failed.");
    }
  };

  const registerProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const { name, phone, age, occupation } = regForm;
    if (!name || !phone || !age || !occupation) {
      setErrorMsg("All registration fields are mandatory.");
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          age,
          occupation,
          avatar: regForm.avatar,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Sustainability profile registered successfully!");
        onLoginSuccess(data.user);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMsg(data.message || "Registration failed.");
      }
    } catch (err) {
      setErrorMsg("Profile registration failed.");
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=2000&auto=format&fit=crop')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <div className="absolute inset-0 bg-[#050505]/70 backdrop-blur-md" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative z-10 w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden border border-[#2D2D35] flex flex-col md:flex-row my-8 bg-[#0E0F14]/95 backdrop-blur-xl"
      >
        {/* Left Side: Onboarding & Explanations (60% width on large screens) */}
        <div className="md:w-7/12 p-6 md:p-8 border-b md:border-b-0 md:border-r border-[#2D2D35] bg-[#0E0F14] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#3B82F6] mb-4">
              <Compass className="w-5 h-5 animate-spin-slow" />
              <span className="text-[11px] font-mono tracking-wider uppercase font-bold">ORIENTATION PORTAL</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight mb-2 uppercase">
              Chennai Sustainability Intelligence
            </h1>
            <p className="text-sm text-[#71717A] leading-relaxed mb-6">
              Empowering urban researchers, community groups, and citizens with real-time CPCB and TNPCB environmental sensor data across Chennai's 16 dynamic zones.
            </p>

            {/* Baseline Data Types List */}
            <div className="space-y-4 mb-6">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#E0E0E0] flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-green-400" />
                Baseline Sensor Architecture
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#16171D] p-3 rounded border border-[#2D2D35]">
                  <div className="text-xs font-bold text-white uppercase tracking-wide">Air Quality (AQI)</div>
                  <div className="text-[10px] text-[#71717A] mt-1 leading-normal">
                    Aggregated real-time PM2.5, PM10, NO₂ metrics direct from CPCB CAAQMS terminals.
                  </div>
                </div>

                <div className="bg-[#16171D] p-3 rounded border border-[#2D2D35]">
                  <div className="text-xs font-bold text-white uppercase tracking-wide">Microclimate</div>
                  <div className="text-[10px] text-[#71717A] mt-1 leading-normal">
                    Localized temperature, relative humidity, and real-time precipitation indices.
                  </div>
                </div>

                <div className="bg-[#16171D] p-3 rounded border border-[#2D2D35]">
                  <div className="text-xs font-bold text-white uppercase tracking-wide">Urban Mobility</div>
                  <div className="text-[10px] text-[#71717A] mt-1 leading-normal">
                    Estimated vehicle counts to evaluate correlations between transit density and particulate spikes.
                  </div>
                </div>

                <div className="bg-[#16171D] p-3 rounded border border-[#2D2D35]">
                  <div className="text-xs font-bold text-white uppercase tracking-wide">Ecological Cover</div>
                  <div className="text-[10px] text-[#71717A] mt-1 leading-normal">
                    Tree canopy metrics and major urban water body connectivity tracking heat islands.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#2D2D35] text-[10px] text-[#52525B] font-mono">
            <span>CPCB CAAQMS Network v2.6</span>
          </div>
        </div>

        {/* Right Side: Security, Authentication, Profiles (40% width) */}
        <div className="md:w-5/12 p-6 md:p-8 flex flex-col justify-center bg-[#111218]">
          <div className="w-full">
            {/* Header / Tab selectors */}
            <div className="flex gap-4 mb-6 border-b border-[#2D2D35] pb-3">
              <button
                onClick={() => {
                  setActiveTab("onboarding");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className={`text-[10px] font-bold tracking-widest uppercase pb-1 cursor-pointer transition-colors relative ${
                  activeTab === "onboarding" ? "text-[#3B82F6]" : "text-[#71717A] hover:text-[#E0E0E0]"
                }`}
              >
                FEATURES
                {activeTab === "onboarding" && (
                  <span className="absolute bottom-[-13px] left-0 w-full h-[2px] bg-[#3B82F6]"></span>
                )}
              </button>
              <button
                onClick={() => {
                  setActiveTab("login");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className={`text-xs font-bold tracking-wider uppercase pb-1 cursor-pointer transition-colors ${
                  activeTab === "login" || activeTab === "register" ? "text-cyan-400 border-b-2 border-cyan-400" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Secure Login
              </button>
            </div>

            {/* Tab 1: Onboarding Features Carousel Info */}
            {activeTab === "onboarding" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">Platform Capabilities</h3>

                <div className="space-y-3.5">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                      <Star className="w-3.5 h-3.5 text-green-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wide">Durable Cloud Logging</h4>
                      <p className="text-[10px] text-[#71717A] mt-0.5 leading-normal">
                        User analytics and historical zone comparisons are securely stored and updated.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <Shield className="w-3.5 h-3.5 text-[#3B82F6]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wide">Passwordless Security</h4>
                      <p className="text-[10px] text-[#71717A] mt-0.5 leading-normal">
                        No memorized credentials. Input email, receive instant authentication pin, and authenticate.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wide">AI Policy Advisor</h4>
                      <p className="text-[10px] text-[#71717A] mt-0.5 leading-normal">
                        Engage in conversation with our server-side LLM grounded in active Chennai telemetry data.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab("login")}
                  className="w-full mt-6 py-2.5 px-4 rounded bg-[#3B82F6] hover:bg-blue-600 text-xs font-bold tracking-widest text-white transition-all flex items-center justify-center gap-2 cursor-pointer uppercase"
                >
                  <User className="w-4 h-4" />
                  ACCESS SECURE PORTAL
                </button>
              </div>
            )}

            {/* Tab 2: Passwordless OTP Authentication Form */}
            {activeTab === "login" && (
              <div>
                <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-wide">Sign In via Passwordless OTP</h3>
                <p className="text-[10px] text-[#71717A] mb-4 leading-normal">
                  Enter your email address. We will transmit a strict security verification code.
                </p>

                <AnimatePresence mode="wait">
                  {!otpSent ? (
                    <motion.form
                      key="send-otp-form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={sendOtp}
                      className="space-y-3"
                    >
                      <div>
                        <label className="block text-[10px] font-mono text-[#71717A] uppercase mb-1">Email Address</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="w-full bg-[#1C1D24] border border-[#2D2D35] rounded py-2 px-3 text-xs text-white focus:outline-none focus:border-[#3B82F6] transition-colors"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 px-4 rounded bg-[#16171D] hover:bg-[#2D2D35] border border-[#2D2D35] text-[11px] font-bold tracking-widest text-[#E0E0E0] transition-all flex items-center justify-center gap-2 cursor-pointer uppercase"
                      >
                        <Send className="w-3.5 h-3.5 text-[#3B82F6]" />
                        SEND VERIFICATION CODE
                      </button>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="verify-otp-form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={verifyOtp}
                      className="space-y-3"
                    >
                      <div>
                        <label className="block text-[10px] font-mono text-[#71717A] uppercase mb-1">Enter Verification Code</label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="123456"
                          className="w-full bg-[#1C1D24] border border-[#2D2D35] rounded py-2 px-3 text-center text-lg font-mono tracking-widest text-white focus:outline-none focus:border-[#3B82F6] transition-colors"
                        />
                      </div>

                      {debugOtp && (
                        <div className="p-2.5 rounded bg-yellow-500/10 border border-yellow-500/25 text-[10px] text-yellow-500">
                          <span className="font-bold">Sandbox OTP Dispatch:</span> Enter code{" "}
                          <strong className="font-mono text-white text-xs px-1 bg-[#1C1D24] border border-[#2D2D35] rounded">{debugOtp}</strong> to authenticate immediately in the preview.
                        </div>
                      )}

                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setOtpSent(false)}
                          className="flex-1 py-2 px-3 rounded bg-[#1C1D24] hover:bg-[#2D2D35] border border-[#2D2D35] text-[10px] font-bold tracking-widest text-[#71717A] hover:text-white transition-all cursor-pointer text-center uppercase"
                        >
                          CHANGE EMAIL
                        </button>
                        <button
                          type="submit"
                          className="flex-[2] py-2 px-3 rounded bg-[#3B82F6] hover:bg-blue-600 text-[10px] font-bold tracking-widest text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          VERIFY & ENTER
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Tab 3: Mandatory 5-field Profile Registration Form */}
            {activeTab === "register" && (
              <form onSubmit={registerProfile} className="space-y-3 max-h-[450px] overflow-y-auto no-scrollbar pr-1">
                <h3 className="text-xs font-bold text-white mb-0.5 uppercase tracking-wide">Profile Registration Required</h3>
                <p className="text-[10px] text-[#71717A] leading-normal mb-3">
                  Please complete the following standardized profile fields to initialize your account.
                </p>

                <div>
                  <label className="block text-[9px] font-mono text-[#71717A] uppercase mb-1">1. Full Name</label>
                  <input
                    type="text"
                    required
                    value={regForm.name}
                    onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full bg-[#1C1D24] border border-[#2D2D35] rounded py-1.5 px-3 text-xs text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-[#71717A] uppercase mb-1">2. Contact Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={regForm.phone}
                    onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full bg-[#1C1D24] border border-[#2D2D35] rounded py-1.5 px-3 text-xs text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-mono text-[#71717A] uppercase mb-1">3. Age</label>
                    <input
                      type="number"
                      required
                      min={10}
                      max={120}
                      value={regForm.age}
                      onChange={(e) => setRegForm({ ...regForm, age: e.target.value })}
                      placeholder="e.g. 28"
                      className="w-full bg-[#1C1D24] border border-[#2D2D35] rounded py-1.5 px-3 text-xs text-white focus:outline-none focus:border-[#3B82F6]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono text-[#71717A] uppercase mb-1">4. Occupation</label>
                    <input
                      type="text"
                      required
                      value={regForm.occupation}
                      onChange={(e) => setRegForm({ ...regForm, occupation: e.target.value })}
                      placeholder="e.g. Researcher"
                      className="w-full bg-[#1C1D24] border border-[#2D2D35] rounded py-1.5 px-3 text-xs text-white focus:outline-none focus:border-[#3B82F6]"
                    />
                  </div>
                </div>

                {/* 5. Avatar Selection (Visual Personalization System) */}
                <div>
                  <label className="block text-[9px] font-mono text-[#71717A] uppercase mb-1">5. Choose Avatar Archetype</label>
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {PRESET_AVATARS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setRegForm({ ...regForm, avatar: av.id })}
                        className={`p-1.5 rounded border text-center transition-all cursor-pointer relative flex flex-col items-center justify-center ${
                          regForm.avatar === av.id
                            ? "border-[#3B82F6] bg-blue-500/10"
                            : "border-[#2D2D35] bg-[#16171D] hover:border-[#71717A]"
                        }`}
                      >
                        <div className="text-base mb-0.5">{av.emoji}</div>
                        <span className="text-[8px] text-[#E0E0E0] truncate w-full text-center">{av.name}</span>
                        {regForm.avatar === av.id && (
                          <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#3B82F6]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-4 rounded bg-[#3B82F6] hover:bg-blue-600 text-[11px] font-bold tracking-widest text-white transition-all mt-4 cursor-pointer uppercase"
                >
                  CREATE & INITIALIZE PROFILE
                </button>
              </form>
            )}

            {/* Error and Success Banners */}
            {errorMsg && (
              <div className="mt-4 p-2.5 rounded bg-red-500/10 border border-red-500/20 text-[10px] text-red-400 font-bold tracking-wide">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="mt-4 p-2.5 rounded bg-green-500/10 border border-green-500/20 text-[10px] text-green-400 font-bold tracking-wide">
                {successMsg}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
