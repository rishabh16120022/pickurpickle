import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Mail, Lock, ArrowRight, Flower, Sparkles, Key, ChevronLeft, CheckCircle, AlertCircle, Loader, User } from 'lucide-react';

const Auth = () => {
  // View State: 'login' | 'signup-step1' | 'signup-step2' | 'forgot-email' | 'forgot-otp' | 'forgot-reset'
  const [view, setView] = useState('login');
  
  // Form Data
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  
  const { login, initiateSignup, completeSignup } = useStore();
  const navigate = useNavigate();

  const showMessage = (text: string, type: 'success' | 'error') => {
      setMessage({ text, type });
      if (type === 'error') setTimeout(() => setMessage(null), 5000);
  };

  // --- API HANDLERS ---

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
        setLoading(true);
        const success = await login(email, password);
        setLoading(false);
        if (success) {
            navigate('/');
        }
    }
  };

  const handleSignupStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
        setLoading(true);
        const success = await initiateSignup(name, email);
        setLoading(false);
        if (success) {
            setView('signup-step2');
        }
    }
  };

  const handleSignupStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && otp && password) {
        setLoading(true);
        const success = await completeSignup(name, email, otp, password);
        setLoading(false);
        if (success) {
            navigate('/');
        }
    }
  };

  // --- PASSWORD RESET HANDLERS ---
  const handleSendForgotOTP = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
          const res = await fetch('/api/auth/send-otp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, purpose: 'forgot-password' })
          });
          const data = await res.json();
          if (res.ok) {
              setView('forgot-otp');
              showMessage(data.message, 'success');
          } else {
              showMessage(data.message, 'error');
          }
      } catch (err) {
          showMessage('Unable to connect to server.', 'error');
      }
      setLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
          const res = await fetch('/api/auth/verify-otp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, otp })
          });
          const data = await res.json();
          if (res.ok) {
              setView('forgot-reset');
              showMessage(data.message, 'success');
          } else {
              showMessage(data.message, 'error');
          }
      } catch (err) {
          showMessage('Verification failed.', 'error');
      }
      setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
          const res = await fetch('/api/auth/reset-password', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, otp, newPassword })
          });
          const data = await res.json();
          if (res.ok) {
              setView('login');
              setPassword('');
              setOtp('');
              setNewPassword('');
              showMessage("Password reset successfully. Please login.", 'success');
          } else {
              showMessage(data.message, 'error');
          }
      } catch (err) {
          showMessage('Reset failed.', 'error');
      }
      setLoading(false);
  };


  // --- RENDER HELPERS ---
  
  const BrandPanel = () => (
    <div className="hidden md:flex flex-col justify-between w-[40%] bg-primary p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/food.png')] opacity-10"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl"></div>

        <div className="relative z-10">
            <h2 className="text-4xl font-serif font-bold mb-4">
                {view === 'login' ? 'Welcome Back!' : view.includes('signup') ? 'Join the Family' : 'Secure Reset'}
            </h2>
            <p className="text-lg text-orange-100 font-light leading-relaxed">
                {view === 'login' 
                    ? 'Log in to access your saved recipes, track orders, and reorder your favorites.' 
                    : view.includes('signup')
                        ? 'Sign up today to get exclusive access to seasonal pickles and grandma\'s secret recipes.'
                        : 'Don\'t worry, we\'ll help you get back to your spicy cravings in no time.'}
            </p>
        </div>
        
        <div className="flex justify-center relative z-10 my-auto">
             <div className="w-56 h-56 bg-white/10 rounded-full flex flex-col items-center justify-center border-4 border-white/20 backdrop-blur-sm relative shadow-2xl group transition-transform hover:scale-105 duration-500">
                <Sparkles className="absolute top-8 right-8 text-accent animate-pulse" size={24} />
                <Flower size={72} className="text-accent mb-3 animate-spin-slow shadow-sm" />
                <div className="text-center">
                    <span className="block font-serif text-2xl font-bold leading-none tracking-tight text-white/90">Pick Your</span>
                    <span className="block font-serif text-4xl font-bold text-accent leading-none mt-1 drop-shadow-md">Pickle</span>
                </div>
                <div className="absolute bottom-6 text-[10px] uppercase tracking-[0.3em] text-white/60">Est. 2024</div>
             </div>
        </div>
    </div>
  );

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <div className="flex w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden h-[600px] md:h-[550px]">
        
        <BrandPanel />

        {/* Right Side Form Container */}
        <div className="w-full md:w-[60%] p-10 flex flex-col justify-center bg-white relative">
            
            {/* Notification Banner */}
            {message && (
                <div className={`absolute top-0 left-0 w-full px-6 py-3 text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-full ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {message.text}
                </div>
            )}

            {/* VIEW: LOGIN */}
            {view === 'login' && (
                <form className="space-y-8 max-w-sm mx-auto w-full" onSubmit={handleLogin}>
                    <div className="text-center md:text-left mb-8">
                        <h3 className="text-2xl font-bold text-gray-800 font-serif">Login to your account</h3>
                        <p className="text-sm text-gray-500 mt-2">Enter your details below</p>
                    </div>

                    <div className="space-y-6">
                        <div className="relative group">
                            <Mail className="absolute left-0 top-3 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                            <input 
                                type="email" 
                                required 
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full border-b border-gray-300 py-2 pl-8 text-gray-900 focus:outline-none focus:border-primary placeholder-transparent transition-all bg-transparent" 
                                placeholder="Email address"
                            />
                            <label className="absolute left-8 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-primary peer-focus:text-sm">Email Address</label>
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-0 top-3 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                            <input 
                                type="password" 
                                required 
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full border-b border-gray-300 py-2 pl-8 text-gray-900 focus:outline-none focus:border-primary placeholder-transparent transition-all bg-transparent" 
                                placeholder="Password"
                            />
                            <label className="absolute left-8 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-primary peer-focus:text-sm">Password</label>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button type="button" onClick={() => setView('forgot-email')} className="text-sm font-medium text-primary hover:underline">
                            Forgot Password?
                        </button>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-dark transition transform hover:-translate-y-1 flex items-center justify-center gap-2">
                        {loading ? <Loader className="animate-spin" size={20} /> : 'Login Securely'}
                        {!loading && <ArrowRight size={20} />}
                    </button>
                    
                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-500">
                            New to Pick Your Pickle? <button type="button" onClick={() => setView('signup-step1')} className="text-primary font-bold hover:underline">Sign Up</button>
                        </p>
                    </div>
                </form>
            )}

            {/* VIEW: SIGNUP STEP 1 (Name & Email) */}
            {view === 'signup-step1' && (
                <form className="space-y-8 max-w-sm mx-auto w-full" onSubmit={handleSignupStep1}>
                     <div className="text-center md:text-left mb-8">
                        <h3 className="text-2xl font-bold text-gray-800 font-serif">Create an account</h3>
                        <p className="text-sm text-gray-500 mt-2">Step 1: Verification</p>
                    </div>

                    <div className="space-y-6">
                        <div className="relative group">
                            <User className="absolute left-0 top-3 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                            <input 
                                type="text" 
                                required 
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full border-b border-gray-300 py-2 pl-8 text-gray-900 focus:outline-none focus:border-primary placeholder-transparent transition-all bg-transparent" 
                                placeholder="Full Name"
                            />
                            <label className="absolute left-8 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-primary peer-focus:text-sm">Full Name</label>
                        </div>
                        <div className="relative group">
                            <Mail className="absolute left-0 top-3 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                            <input 
                                type="email" 
                                required 
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full border-b border-gray-300 py-2 pl-8 text-gray-900 focus:outline-none focus:border-primary placeholder-transparent transition-all bg-transparent" 
                                placeholder="Email address"
                            />
                            <label className="absolute left-8 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-primary peer-focus:text-sm">Email Address</label>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg hover:bg-primary-dark transition flex items-center justify-center gap-2">
                        {loading ? <Loader className="animate-spin" size={20} /> : 'Send Verification OTP'}
                    </button>

                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-500">
                            Already have an account? <button type="button" onClick={() => setView('login')} className="text-primary font-bold hover:underline">Log In</button>
                        </p>
                    </div>
                </form>
            )}

            {/* VIEW: SIGNUP STEP 2 (OTP & Password) */}
            {view === 'signup-step2' && (
                <form className="space-y-8 max-w-sm mx-auto w-full" onSubmit={handleSignupStep2}>
                    <button type="button" onClick={() => setView('signup-step1')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-4">
                        <ChevronLeft size={16} /> Back
                    </button>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 font-serif">Verify & Secure</h3>
                        <p className="text-sm text-gray-500 mt-2">Enter the OTP sent to {email}</p>
                    </div>

                    <div className="space-y-6">
                         <div className="relative group">
                            <Key className="absolute left-0 top-3 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                            <input 
                                type="text" 
                                required 
                                maxLength={6}
                                value={otp}
                                onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                className="w-full border-b border-gray-300 py-2 pl-8 text-gray-900 focus:outline-none focus:border-primary placeholder-transparent transition-all bg-transparent tracking-[0.5em] font-mono text-lg" 
                                placeholder="000000"
                            />
                            <label className="absolute left-8 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-primary peer-focus:text-sm">6-Digit OTP</label>
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-0 top-3 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                            <input 
                                type="password" 
                                required 
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full border-b border-gray-300 py-2 pl-8 text-gray-900 focus:outline-none focus:border-primary placeholder-transparent transition-all bg-transparent" 
                                placeholder="Create Password"
                            />
                            <label className="absolute left-8 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-primary peer-focus:text-sm">Create Password</label>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg hover:bg-primary-dark transition flex items-center justify-center gap-2">
                        {loading ? <Loader className="animate-spin" size={20} /> : 'Complete Registration'}
                    </button>
                </form>
            )}

            {/* VIEW: FORGOT PASSWORD - STEP 1 (EMAIL) */}
            {view === 'forgot-email' && (
                <form className="space-y-8 max-w-sm mx-auto w-full" onSubmit={handleSendForgotOTP}>
                    <button type="button" onClick={() => setView('login')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-4">
                        <ChevronLeft size={16} /> Back to Login
                    </button>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 font-serif">Reset Password</h3>
                        <p className="text-sm text-gray-500 mt-2">Enter your email to receive a verification code.</p>
                    </div>

                    <div className="relative group">
                        <Mail className="absolute left-0 top-3 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                        <input 
                            type="email" 
                            required 
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full border-b border-gray-300 py-2 pl-8 text-gray-900 focus:outline-none focus:border-primary placeholder-transparent transition-all bg-transparent" 
                            placeholder="Email address"
                        />
                        <label className="absolute left-8 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-primary peer-focus:text-sm">Email Address</label>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg hover:bg-primary-dark transition flex items-center justify-center gap-2">
                        {loading ? <Loader className="animate-spin" size={20} /> : 'Send OTP'}
                    </button>
                </form>
            )}

            {/* VIEW: FORGOT PASSWORD - STEP 2 (OTP) */}
            {view === 'forgot-otp' && (
                <form className="space-y-8 max-w-sm mx-auto w-full" onSubmit={handleVerifyOTP}>
                    <button type="button" onClick={() => setView('forgot-email')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-4">
                        <ChevronLeft size={16} /> Back to Email
                    </button>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 font-serif">Enter OTP</h3>
                        <p className="text-sm text-gray-500 mt-2">We sent a code to <span className="font-bold">{email}</span></p>
                    </div>

                    <div className="relative group">
                        <Key className="absolute left-0 top-3 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                        <input 
                            type="text" 
                            required 
                            maxLength={6}
                            value={otp}
                            onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full border-b border-gray-300 py-2 pl-8 text-gray-900 focus:outline-none focus:border-primary placeholder-transparent transition-all bg-transparent tracking-[0.5em] font-mono text-lg" 
                            placeholder="000000"
                        />
                        <label className="absolute left-8 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-primary peer-focus:text-sm">6-Digit OTP</label>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg hover:bg-primary-dark transition flex items-center justify-center gap-2">
                        {loading ? <Loader className="animate-spin" size={20} /> : 'Verify Code'}
                    </button>
                </form>
            )}

             {/* VIEW: FORGOT PASSWORD - STEP 3 (NEW PASSWORD) */}
             {view === 'forgot-reset' && (
                <form className="space-y-8 max-w-sm mx-auto w-full" onSubmit={handleResetPassword}>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 font-serif">New Password</h3>
                        <p className="text-sm text-gray-500 mt-2">Create a strong password for your account.</p>
                    </div>

                    <div className="relative group">
                        <Lock className="absolute left-0 top-3 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                        <input 
                            type="password" 
                            required 
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            className="w-full border-b border-gray-300 py-2 pl-8 text-gray-900 focus:outline-none focus:border-primary placeholder-transparent transition-all bg-transparent" 
                            placeholder="New Password"
                        />
                        <label className="absolute left-8 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-primary peer-focus:text-sm">New Password</label>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg hover:bg-primary-dark transition flex items-center justify-center gap-2">
                        {loading ? <Loader className="animate-spin" size={20} /> : 'Reset Password'}
                    </button>
                </form>
            )}

            <div className="absolute bottom-4 left-0 w-full text-center px-8">
                <p className="text-[10px] text-gray-400">
                    By continuing, you agree to our <a href="#" className="underline hover:text-primary">Terms</a> and <a href="#" className="underline hover:text-primary">Privacy Policy</a>.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;