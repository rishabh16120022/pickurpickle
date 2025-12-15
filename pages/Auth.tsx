import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Mail, Lock, ArrowRight, Flower, Sparkles } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const { login } = useStore();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
        login(email, isAdmin ? 'admin' : 'customer');
        navigate(isAdmin ? '/admin' : '/');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <div className="flex w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden h-[600px] md:h-[550px]">
        
        {/* Left Side Info Panel - The Brand Side */}
        <div className="hidden md:flex flex-col justify-between w-[40%] bg-primary p-10 text-white relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/food.png')] opacity-10"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl"></div>

            <div className="relative z-10">
                <h2 className="text-4xl font-serif font-bold mb-4">{isLogin ? 'Welcome Back!' : 'Join the Family'}</h2>
                <p className="text-lg text-orange-100 font-light leading-relaxed">
                    {isLogin 
                        ? 'Log in to access your saved recipes, track orders, and reorder your favorites.' 
                        : 'Sign up today to get exclusive access to seasonal pickles and grandma\'s secret recipes.'}
                </p>
            </div>
            
            {/* Custom Brand Logo Area */}
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

        {/* Right Side Form */}
        <div className="w-full md:w-[60%] p-10 flex flex-col justify-center bg-white relative">
            <form className="space-y-8 max-w-sm mx-auto w-full" onSubmit={handleSubmit}>
                <div className="text-center md:text-left mb-8">
                    <h3 className="text-2xl font-bold text-gray-800 font-serif">
                        {isLogin ? "Login to your account" : "Create an account"}
                    </h3>
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
                            id="email"
                        />
                        <label htmlFor="email" className="absolute left-8 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-primary peer-focus:text-sm">Email Address</label>
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
                            id="password" 
                        />
                         <label htmlFor="password" className="absolute left-8 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-primary peer-focus:text-sm">Password</label>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                     <label className="flex items-center text-sm text-gray-600 select-none cursor-pointer hover:text-primary transition-colors">
                        <input type="checkbox" checked={isAdmin} onChange={e => setIsAdmin(e.target.checked)} className="mr-2 accent-primary w-4 h-4" />
                        Admin Access
                    </label>
                    <a href="#" className="text-sm font-medium text-primary hover:underline">Forgot Password?</a>
                </div>

                <button type="submit" className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-dark transition transform hover:-translate-y-1 flex items-center justify-center gap-2">
                    {isLogin ? 'Login Securely' : 'Create Account'}
                    <ArrowRight size={20} />
                </button>
                
                <div className="text-center mt-6">
                    <p className="text-sm text-gray-500">
                        {isLogin ? "New to Pick Your Pickle? " : "Already have an account? "}
                        <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-primary font-bold hover:underline">
                            {isLogin ? "Sign Up" : "Log In"}
                        </button>
                    </p>
                </div>
            </form>
            
            {/* Disclaimer */}
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