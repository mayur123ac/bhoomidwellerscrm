'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [selectedRole, setSelectedRole] = useState('employee'); 
  const [secretKey, setSecretKey] = useState(''); 
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // --- NEW STATES FOR PASSWORD VISIBILITY ---
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); 
  };

  // --- EXACT THEME CONFIGURATION PROVIDED ---
  const theme = {
    bg: isDarkMode ? 'bg-[#131314]' : 'bg-[#F0F2F5]',
    card: isDarkMode ? 'bg-[#1E1F20]' : 'bg-white',
    textMain: isDarkMode ? 'text-white' : 'text-[#202124]',
    textSub: isDarkMode ? 'text-[#9AA0A6]' : 'text-[#5F6368]',
    inputBg: isDarkMode ? 'bg-[#28292A]' : 'bg-white',
    inputBorder: isDarkMode ? 'border-[#3C4043]' : 'border-[#DADCE0]',
    inputText: isDarkMode ? 'text-white' : 'text-[#202124]',
    inputPlaceholder: isDarkMode ? 'placeholder-[#5F6368]' : 'placeholder-gray-400',
    divider: isDarkMode ? 'border-[#2D2E30]' : 'border-gray-200',
    hoverBg: isDarkMode ? 'hover:bg-[#28292A]' : 'hover:bg-gray-50',
    brandSoftBg: isDarkMode ? 'bg-purple-900/20' : 'bg-purple-50',
    brandText: isDarkMode ? 'text-purple-400' : 'text-purple-700',
    greenSoftBg: isDarkMode ? 'bg-green-900/20' : 'bg-green-50',
    greenText: isDarkMode ? 'text-green-400' : 'text-green-700',
    yellowSoftBg: isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50',
    yellowText: isDarkMode ? 'text-yellow-400' : 'text-yellow-700',
    alertBg: isDarkMode ? 'bg-[#3B1F1F]' : 'bg-red-50',
    alertText: isDarkMode ? 'text-[#F28B82]' : 'text-red-700',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { email, password, confirmPassword, name } = formData;
    let finalRole = email.endsWith('@admin.com') ? 'admin' : (email.endsWith('@bhoomidwellers.com') ? 'employee' : '');

    if (!isLoginMode && password !== confirmPassword) {
        setError('Passwords do not match.');
        setIsLoading(false);
        return;
    }

    if (isLoginMode && !finalRole) {
      setError('Invalid email domain. Use @admin.com or @bhoomidwellers.com');
      setIsLoading(false);
      return;
    }

    try {
      const endpoint = isLoginMode ? '/api/login' : '/api/users';
      const payload = isLoginMode 
        ? { email, password } 
        : { email, password, name, role: selectedRole, secretKey: secretKey.trim() };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => null);

      if (!data) {
        throw new Error("Server error: The backend returned an invalid response. Check your terminal.");
      }

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong.");
      }
      
      if (!isLoginMode) {
        alert("Account Created! You can now log in.");
        setIsLoginMode(true);
      } else {
        const userRole = data.role || finalRole;
        const userName = data.name || 'User';
        router.push(`/dashboard?role=${userRole}&name=${userName}&email=${email}`);
      }
    } catch (err: any) { 
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex items-center justify-center min-h-screen transition-colors duration-300 ${theme.bg} font-sans p-4 relative`}>
      
      {/* Theme Toggle */}
      <button onClick={() => setIsDarkMode(!isDarkMode)} className={`absolute top-6 right-6 p-2 rounded-full transition-all duration-300 cursor-pointer ${isDarkMode ? 'bg-[#28292A] text-yellow-400 hover:bg-[#3C4043]' : 'bg-white text-gray-600 shadow-md hover:bg-gray-50'}`}>
        {isDarkMode ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
        )}
      </button>

      <div className={`w-full max-w-md ${theme.card} rounded-t-3xl rounded-b-3xl overflow-hidden shadow-xl border ${theme.divider} transition-colors duration-300`}>
        
        {/* Top Header Section */}
        <div className={`pt-10 pb-6 px-8 flex flex-col items-center justify-center border-b ${theme.divider} ${isDarkMode ? 'bg-[#131314]' : 'bg-gradient-to-b from-purple-50 to-white'}`}>
          
          {!isLoginMode && (
             <button onClick={() => setIsLoginMode(true)} className="absolute top-8 left-8 text-purple-600 font-bold hover:text-purple-700 cursor-pointer">
               ←
             </button>
          )}
          {!isLoginMode && <div className="absolute top-8 text-purple-600 font-bold tracking-widest text-sm">SIGN UP</div>}

          {/* Logo Box */}
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mt-6 border ${theme.inputBg} ${theme.divider} shadow-sm transition-colors`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-purple-600">
              <path d="M4 10h3v10H4V10zm5-4h10v14H9V6zm2 2v2h2V8h-2zm4 0v2h2V8h-2zm-4 4v2h2v-2h-2zm4 0v2h2v-2h-2zm-4 4v2h2v-2h-2zm4 0v2h2v-2h-2z" />
            </svg>
          </div>
          
          <h1 className={`text-2xl font-bold mb-1 ${theme.textMain}`}>
            {isLoginMode ? 'Bhoomi Dwellers' : 'Create Account'}
          </h1>
          <p className={`text-sm ${theme.textSub}`}>
             {isLoginMode ? 'Real Estate CRM Portal' : 'Join Bhoomi Dwellers today'}
          </p>
        </div>

        {/* Form Section */}
        <div className={`px-8 pt-8 pb-10 ${theme.card}`}>
          
          {/* Employee / Admin Pill Toggle (Signup Mode) */}
          {!isLoginMode && (
            <div className={`flex rounded-lg p-1 mb-8 border transition-colors ${theme.divider} ${theme.inputBg}`}>
              {['employee', 'admin'].map((role) => (
                <button 
                  key={role} 
                  type="button" 
                  onClick={() => setSelectedRole(role)} 
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 capitalize cursor-pointer ${
                    selectedRole === role 
                      ? `${theme.card} text-purple-600 shadow-sm border ${theme.divider}` 
                      : `${theme.textSub} ${theme.hoverBg}`
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          )}

          <div className="mb-6">
            <h2 className={`text-xl font-bold ${theme.textMain}`}>
              {isLoginMode ? 'Welcome Back' : `Registering as ${selectedRole === 'admin' ? 'Admin' : 'Employee'}`}
            </h2>
            {isLoginMode && <p className={`text-sm mt-1 ${theme.textSub}`}>Sign in to manage your leads and properties.</p>}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name Input (Signup Only) */}
            {!isLoginMode && (
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? theme.textMain : 'text-purple-700'}`}>Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isDarkMode ? theme.textSub : 'text-purple-400'}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                  </div>
                  <input type="text" name="name" required value={formData.name} onChange={handleChange} className={`w-full pl-10 pr-4 py-2.5 rounded-lg border outline-none transition-all ${theme.inputBg} ${theme.inputBorder} ${theme.inputText} ${theme.inputPlaceholder} focus:ring-1 focus:ring-purple-500 focus:border-transparent`} placeholder="John Doe" />
                </div>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label className={`block text-xs font-semibold mb-1 ${theme.textMain}`}>Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${theme.textSub}`} viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                </div>
                <input type="email" name="email" required value={formData.email} onChange={handleChange} className={`w-full pl-10 pr-4 py-2.5 rounded-lg border outline-none transition-all ${theme.inputBg} ${theme.inputBorder} ${theme.inputText} ${theme.inputPlaceholder} focus:ring-1 focus:ring-purple-500 focus:border-transparent`} placeholder={!isLoginMode ? (selectedRole === 'admin' ? "name@admin.com" : "name@bhoomidwellers.com") : "name@company.com"} />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between mb-1">
                 <label className={`block text-xs font-semibold ${theme.textMain}`}>Password</label>
                 {isLoginMode && <a href="#" className="text-xs text-purple-600 font-semibold hover:underline cursor-pointer">Forgot Password?</a>}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${theme.textSub}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                </div>
                {/* Dynamically change type based on showPassword state */}
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  required 
                  value={formData.password} 
                  onChange={handleChange} 
                  className={`w-full pl-10 pr-10 py-2.5 rounded-lg border outline-none transition-all ${theme.inputBg} ${theme.inputBorder} ${theme.inputText} ${theme.inputPlaceholder} focus:ring-1 focus:ring-purple-500 focus:border-transparent`} 
                  placeholder={isLoginMode ? "Enter your password" : "••••••••"} 
                />
                
                {/* Clickable toggle icon */}
                <div 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer hover:text-purple-500 transition-colors"
                >
                  {showPassword ? (
                    // Open Eye Icon
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${theme.textSub} hover:text-purple-500`} viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    // Closed Eye Icon
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${theme.textSub} hover:text-purple-500`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </div>
              </div>
            </div>

             {/* Confirm Password Input (Signup Only) */}
             {!isLoginMode && (
              <div>
                <label className={`block text-xs font-semibold mb-1 ${theme.textMain}`}>Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isDarkMode ? theme.textSub : 'text-purple-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  </div>
                  {/* Dynamically change type based on showConfirmPassword state */}
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    name="confirmPassword" 
                    required 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    className={`w-full pl-10 pr-10 py-2.5 rounded-lg border outline-none transition-all ${theme.inputBg} ${theme.inputBorder} ${theme.inputText} ${theme.inputPlaceholder} focus:ring-1 focus:ring-purple-500 focus:border-transparent`} 
                    placeholder="••••••••" 
                  />

                  {/* Clickable toggle icon */}
                  <div 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer hover:text-purple-500 transition-colors"
                  >
                    {showConfirmPassword ? (
                      // Open Eye Icon
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${theme.textSub} hover:text-purple-500`} viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      // Closed Eye Icon
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${theme.textSub} hover:text-purple-500`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Admin Secret Key (Signup Only) */}
            {!isLoginMode && selectedRole === 'admin' && (
              <div className={`p-4 rounded-lg border animate-fadeIn ${theme.alertBg}`}>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme.alertText}`}>Admin Secret Key Required</label>
                <input type="password" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} className={`w-full px-4 py-2 rounded border outline-none transition-colors ${theme.inputBg} ${theme.inputBorder} ${theme.inputText} ${theme.inputPlaceholder} focus:border-red-400 focus:ring-1 focus:ring-red-400`} placeholder="Enter secret key..." />
              </div>
            )}

            {error && (
              <div className={`p-3 text-sm rounded-lg border flex items-center ${theme.alertBg} ${theme.alertText}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {error}
              </div>
            )}

            {/* Terms and conditions checkbox (Signup only) */}
            {!isLoginMode && (
                <div className="flex items-center mt-4">
                  <input type="checkbox" required className={`h-4 w-4 cursor-pointer text-purple-600 focus:ring-purple-500 rounded border ${theme.inputBorder} ${theme.inputBg}`} />
                  <label className={`ml-2 block text-xs ${theme.textSub}`}>
                    I agree to the <span className="text-purple-600 font-semibold cursor-pointer hover:underline">Terms</span> and <span className="text-purple-600 font-semibold cursor-pointer hover:underline">Privacy Policy</span>
                  </label>
                </div>
            )}

            {/* Submit Button */}
            <button type="submit" disabled={isLoading} className={`w-full py-3 text-white font-medium rounded-lg transition-all duration-200 mt-2 bg-purple-600 hover:bg-purple-700 shadow-md ${!isDarkMode && 'shadow-purple-200'} cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center`}>
              {isLoading ? 'Processing...' : (isLoginMode ? <>Log In <span className="ml-2">→</span></> : 'Create Account')}
            </button>
          </form>

          {/* Footer toggle text */}
          <div className={`mt-8 text-center text-sm ${theme.textSub}`}>
            {isLoginMode ? "New Employee? " : "Already have an account? "}
            <button onClick={() => { setIsLoginMode(!isLoginMode); setError(''); setSecretKey(''); }} className="font-bold text-purple-600 hover:text-purple-700 hover:underline transition-colors ml-1 cursor-pointer">
              {isLoginMode ? 'Create Account' : 'Log In'}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}