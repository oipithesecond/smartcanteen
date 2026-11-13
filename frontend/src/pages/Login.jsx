// frontend/src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ArrowRight,
  Shield, 
  ChefHat, 
  Building2,
  User,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Clean Preset Role Accounts (Zero Emojis, Authentic Personnel Names)
const DEMO_PRESETS = [
  {
    roleName: 'Statewide Admin',
    personName: 'K. S. Rao',
    department: 'Statewide Access',
    email: 'admin@smartcanteen.ap.gov',
    password: 'Admin@SC2026',
    role: 'ADMIN',
    icon: Shield,
    badgeColor: 'text-[#506354] bg-[#d0e5d2]/60 border-[#506354]/20'
  },
  {
    roleName: 'Amaravati Floor',
    personName: 'Lakshmi Priya',
    department: 'Secretariat Core',
    email: 'amaravati@smartcanteen.ap.gov',
    password: 'Floor@SC2026',
    role: 'OUTLET_MANAGER',
    icon: ChefHat,
    badgeColor: 'text-[#474741] bg-[#ebe7e6] border-[#e5e2e1]'
  },
  {
    roleName: 'Guntur Central',
    personName: 'Suresh Reddy',
    department: 'Central Dining Floor',
    email: 'guntur@smartcanteen.ap.gov',
    password: 'Floor@SC2026',
    role: 'OUTLET_MANAGER',
    icon: ChefHat,
    badgeColor: 'text-[#c76c00] bg-[#ffdcc3]/70 border-[#c76c00]/20'
  },
  {
    roleName: 'Vijayawada Hub',
    personName: 'K. Venkatesh',
    department: 'Transit Kitchen Floor',
    email: 'vijayawada@smartcanteen.ap.gov',
    password: 'Floor@SC2026',
    role: 'OUTLET_MANAGER',
    icon: ChefHat,
    badgeColor: 'text-[#474741] bg-[#ebe7e6] border-[#e5e2e1]'
  }
];

export default function Login() {
  const { login, signup, isAuthenticated, authError, setAuthError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup'
  const [selectedPresetEmail, setSelectedPresetEmail] = useState('');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('OUTLET_MANAGER');
  const [assignedDistrict, setAssignedDistrict] = useState('guntur');

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const from = location.state?.from?.pathname || '/';

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  // Sync auth context errors
  useEffect(() => {
    if (authError) setLocalError(authError);
  }, [authError]);

  function clearMessages() {
    setLocalError('');
    setSuccessMessage('');
    if (setAuthError) setAuthError(null);
  }

  function handleSelectPreset(preset) {
    clearMessages();
    setActiveTab('login');
    setSelectedPresetEmail(preset.email);
    setEmail(preset.email);
    setPassword(preset.password);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    clearMessages();

    if (activeTab === 'login') {
      if (!email.trim()) { setLocalError('Please enter your work email address.'); return; }
      if (!password) { setLocalError('Please enter your account password.'); return; }

      setIsSubmitting(true);
      const result = await login(email.trim(), password);
      setIsSubmitting(false);

      if (result.success) {
        navigate(from, { replace: true });
      }
    } else {
      // Sign up
      if (!name.trim()) { setLocalError('Please enter your full name.'); return; }
      if (!email.trim()) { setLocalError('Please enter your official work email.'); return; }
      if (!password || password.length < 6) { setLocalError('Password must be at least 6 characters.'); return; }

      setIsSubmitting(true);
      const result = await signup({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        assignedDistrict: role === 'ADMIN' ? null : assignedDistrict
      });
      setIsSubmitting(false);

      if (result.success) {
        setSuccessMessage('Staff account created. Redirecting to your workspace...');
        setTimeout(() => navigate(from, { replace: true }), 400);
      }
    }
  }

  return (
    <div className="min-h-screen text-[#1c1b1b] flex flex-col selection:bg-[#d0e5d2] relative bg-[#fdf8f7]">
      {/* Seamless Minimalist Culinary Texture Layer */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-60 transform-gpu"
        style={{
          backgroundImage: "url('/food-pattern.svg')",
          backgroundRepeat: 'repeat',
          backgroundPosition: 'top left',
          backgroundSize: '360px 360px'
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Simple Brand Header */}
        <header className="w-full border-b border-[#e5e2e1]/80 bg-[#fdf8f7]/95 backdrop-blur-sm py-3 px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img 
              src="/logo-icon.png" 
              alt="Smart Canteen" 
              className="w-8 h-8 object-contain shrink-0" 
            />
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
              <span className="font-space text-base font-bold tracking-tight text-[#1c1b1b]">
                Smart Canteen
              </span>
              <span className="text-[11px] text-[#777771] font-medium hidden sm:inline">
                Government of Andhra Pradesh
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#777771] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#506354]" />
            <span className="hidden sm:inline">Operations Portal</span>
          </div>
        </header>

        {/* Centered Main Canvas */}
        <main className="flex-1 flex items-center justify-center px-4 py-8 md:py-12">
          <div className="w-full max-w-[460px]">

            {/* Single Cohesive Editorial Card */}
            <div className="bg-white border border-[#e5e2e1] rounded-sm shadow-[0_4px_24px_rgba(26,26,24,0.035)] overflow-hidden">
              
              {/* Card Header & Brand Title */}
              <div className="p-6 pb-5 border-b border-[#e5e2e1]">
                <div className="flex items-center justify-between mb-3">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#f1edec] border border-[#e5e2e1] text-[11px] font-space text-[#474741]">
                    <Building2 className="w-3.5 h-3.5 text-[#506354]" />
                    <span>AP State Canteen Authority</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#777771]">Secure Sign-In</span>
                </div>

                <h1 className="font-space text-xl font-bold text-[#1c1b1b] tracking-tight">
                  {activeTab === 'login' ? 'Staff Sign-In' : 'Register New Staff'}
                </h1>
                <p className="text-xs text-[#777771] mt-1 leading-normal">
                  {activeTab === 'login'
                    ? 'Access kitchen batch schedules, inventory alerts, and live waste telemetry.'
                    : 'Set up an authenticated staff account with role-based access control.'}
                </p>

                {/* Subdued Inline Tabs */}
                <div className="flex items-center gap-1 mt-4 p-1 rounded bg-[#f7f3f2] border border-[#e5e2e1]">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('login'); clearMessages(); }}
                    className={`flex-1 py-1.5 text-xs font-space font-medium rounded-xs transition-all cursor-pointer text-center ${
                      activeTab === 'login'
                        ? 'bg-white text-[#1c1b1b] font-bold shadow-2xs'
                        : 'text-[#777771] hover:text-[#1c1b1b]'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('signup'); clearMessages(); }}
                    className={`flex-1 py-1.5 text-xs font-space font-medium rounded-xs transition-all cursor-pointer text-center ${
                      activeTab === 'signup'
                        ? 'bg-white text-[#1c1b1b] font-bold shadow-2xs'
                        : 'text-[#777771] hover:text-[#1c1b1b]'
                    }`}
                  >
                    Create Account
                  </button>
                </div>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">

                {/* Error Banner */}
                {localError && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xs bg-[#ffdad6]/70 border border-[#ba1a1a]/20 text-[#93000a] text-xs leading-snug">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{localError}</span>
                  </div>
                )}

                {/* Success Banner */}
                {successMessage && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xs bg-[#d0e5d2]/70 border border-[#506354]/20 text-[#28482d] text-xs leading-snug">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {/* Full Name (Sign-up only) */}
                {activeTab === 'signup' && (
                  <div className="space-y-1.5">
                    <label htmlFor="staff-name" className="block text-xs font-space font-semibold text-[#1c1b1b]">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777771]" />
                      <input
                        id="staff-name"
                        type="text"
                        value={name}
                        onChange={e => { setName(e.target.value); clearMessages(); }}
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#e5e2e1] rounded-xs text-[#1c1b1b] placeholder:text-[#c8c7bf] focus:outline-none focus:border-[#506354] focus:ring-1 focus:ring-[#506354] transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label htmlFor="staff-email" className="block text-xs font-space font-semibold text-[#1c1b1b]">
                    Work Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777771]" />
                    <input
                      id="staff-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={e => { 
                        setEmail(e.target.value); 
                        setSelectedPresetEmail('');
                        clearMessages(); 
                      }}
                      placeholder="name@smartcanteen.ap.gov"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#e5e2e1] rounded-xs text-[#1c1b1b] placeholder:text-[#c8c7bf] focus:outline-none focus:border-[#506354] focus:ring-1 focus:ring-[#506354] transition-colors font-mono"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="staff-password" className="block text-xs font-space font-semibold text-[#1c1b1b]">
                      Password
                    </label>
                    {activeTab === 'login' && (
                      <span className="text-[11px] text-[#777771]">Preset accounts provided below</span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777771]" />
                    <input
                      id="staff-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={activeTab === 'login' ? 'current-password' : 'new-password'}
                      value={password}
                      onChange={e => { 
                        setPassword(e.target.value); 
                        setSelectedPresetEmail('');
                        clearMessages(); 
                      }}
                      placeholder="Enter password"
                      className="w-full pl-9 pr-10 py-2 text-sm bg-white border border-[#e5e2e1] rounded-xs text-[#1c1b1b] placeholder:text-[#c8c7bf] focus:outline-none focus:border-[#506354] focus:ring-1 focus:ring-[#506354] transition-colors font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#777771] hover:text-[#1c1b1b] transition-colors cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Additional Sign-up Fields: Role & Branch */}
                {activeTab === 'signup' && (
                  <div className="space-y-3 pt-1">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-space font-semibold text-[#1c1b1b]">
                        Operational Role
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setRole('OUTLET_MANAGER')}
                          className={`p-2.5 rounded-xs border text-left transition-all cursor-pointer ${
                            role === 'OUTLET_MANAGER'
                              ? 'bg-[#f7f3f2] border-[#1c1b1b] text-[#1c1b1b]'
                              : 'bg-white border-[#e5e2e1] text-[#777771] hover:border-[#c8c7bf]'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <ChefHat className="w-3.5 h-3.5 text-[#c76c00]" />
                            <span className="text-xs font-space font-bold">Floor Manager</span>
                          </div>
                          <p className="text-[10px] text-[#777771] leading-tight">Kitchen operations</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setRole('ADMIN')}
                          className={`p-2.5 rounded-xs border text-left transition-all cursor-pointer ${
                            role === 'ADMIN'
                              ? 'bg-[#f7f3f2] border-[#1c1b1b] text-[#1c1b1b]'
                              : 'bg-white border-[#e5e2e1] text-[#777771] hover:border-[#c8c7bf]'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <Shield className="w-3.5 h-3.5 text-[#506354]" />
                            <span className="text-xs font-space font-bold">Statewide Admin</span>
                          </div>
                          <p className="text-[10px] text-[#777771] leading-tight">All AP districts</p>
                        </button>
                      </div>
                    </div>

                    {role === 'OUTLET_MANAGER' && (
                      <div className="space-y-1.5">
                        <label htmlFor="staff-district" className="block text-xs font-space font-semibold text-[#1c1b1b]">
                          Assigned Kitchen Branch
                        </label>
                        <select
                          id="staff-district"
                          value={assignedDistrict}
                          onChange={e => setAssignedDistrict(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-[#e5e2e1] rounded-xs text-[#1c1b1b] focus:outline-none focus:border-[#506354] focus:ring-1 focus:ring-[#506354] transition-colors"
                        >
                          <option value="guntur">Guntur Central Dining Floor</option>
                          <option value="amaravati">Amaravati Secretariat Core</option>
                          <option value="vijayawada">Vijayawada Transit Kitchen Hub</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* Primary Action Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1c1b1b] hover:bg-[#313030] text-white text-xs font-space font-bold rounded-xs transition-colors disabled:opacity-50 cursor-pointer shadow-xs mt-3"
                >
                  {isSubmitting ? (
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{activeTab === 'login' ? 'Sign In to Workspace' : 'Create Account'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Integrated Demo Roles Section (Clean & Human-Crafted) */}
              <div className="border-t border-[#e5e2e1] bg-[#fdf8f7]/70 p-5">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-space font-bold text-[#474741] uppercase tracking-wider">
                    Quick Sign-In (Demo Access)
                  </span>
                  <span className="text-[10px] text-[#777771]">Click a profile to load</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {DEMO_PRESETS.map((preset) => {
                    const Icon = preset.icon;
                    const isSelected = selectedPresetEmail === preset.email;

                    return (
                      <button
                        key={preset.email}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-2.5 rounded-xs border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white border-[#1c1b1b] shadow-2xs ring-1 ring-[#1c1b1b]'
                            : 'bg-white border-[#e5e2e1] hover:border-[#c8c7bf]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-xs font-space font-bold text-[#1c1b1b] truncate">
                            {preset.roleName}
                          </span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${preset.badgeColor}`}>
                            {preset.role === 'ADMIN' ? 'Admin' : 'Floor'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#474741] font-medium truncate">
                          {preset.personName}
                        </p>
                        <p className="text-[10px] text-[#777771] truncate">
                          {preset.department}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Card Bottom Brand Note */}
              <div className="px-6 py-3 border-t border-[#e5e2e1] bg-white text-center">
                <p className="text-[10px] text-[#777771] leading-relaxed">
                  Authorized AP State Canteen operations system.
                  <br className="hidden sm:inline" />
                  Role-Based Access Control enforced across all regional facilities.
                </p>
              </div>

            </div>

            {/* Quiet Footer */}
            <div className="mt-5 text-center space-y-1">
              <p className="text-xs text-[#777771] font-space font-medium">
                Department of Food &amp; Civil Supplies
              </p>
              <p className="text-[10px] text-[#a8a7a0]">
                State Secretariat Complex, Velagapudi, Amaravati 522238
              </p>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
