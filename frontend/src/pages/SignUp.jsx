import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authAPI from '../api/AuthCalls';
import { Loader2, UserPlus, AlertTriangle, CheckCircle, Lock, Mail, User } from 'lucide-react'; // Import lucide icons
import { useDispatch } from 'react-redux';

// --- Form Input Component ---
const FormInput = ({ id, label, value, onChange, placeholder, type = 'text', disabled, Icon }) => (
    <div>
        <label className="block text-sm sm:text-base text-gray-300 mb-2" htmlFor={id}>{label}</label>
        <div className="relative">
            {Icon && (
                <Icon size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            )}
            <input
                type={type}
                id={id}
                value={value}
                onChange={onChange}
                className="w-full p-3 pl-10 rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 border border-transparent focus:border-teal-400 text-sm sm:text-base transition-colors"
                placeholder={placeholder}
                required
                disabled={disabled}
            />
        </div>
    </div>
);

// --- SignUp Component ---
export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const dispatch = useDispatch();

  // State for loading and inline feedback
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, message: null }); // {type: 'error' | 'success', message: '...'}

  const navigate = useNavigate();

  useEffect(() => {
    // Basic check for existing session via cookie is in the original file, we retain this logic
    const token = document.cookie.split('; ').find(row => row.startsWith('token='));
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setFeedback({ type: null, message: null }); // Clear previous feedback

    if (password !== confirmPassword) {
      setFeedback({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    setLoading(true);

    try {
      await authAPI.signUp({ name, email, password, confirmPassword }, dispatch);
      setFeedback({ type: 'success', message: 'Account created! Redirecting to sign in...' });
      
      // Redirect to sign in page after success
      setTimeout(() => {
        navigate('/signin'); 
      }, 1000); 

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An unknown sign-up error occurred. Please try again.';
      setFeedback({ type: 'error', message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const isFormDisabled = loading || feedback.type === 'success';

  return (
    // Main container: full screen, simple dark background
    <div className="relative overflow-hidden text-gray-200 antialiased font-sans flex items-center justify-center min-h-screen p-4 md:p-8">
      
      {/* Navigation - simple text in the corner */}
      <nav className="fixed top-0 left-0 w-full p-4 sm:p-6 lg:p-8 z-20 flex justify-start">
        <div
          onClick={() => navigate('/')}
          className="text-2xl sm:text-3xl font-bold cursor-pointer transition-transform transform hover:scale-105 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-600"
        >
          FIARY
        </div>
      </nav>

      {/* Main content area */}
      <main className="z-10 w-full max-w-md mt-16 sm:mt-0">
        
        {/* Glassy Card for the form */}
        <div className="w-full mx-auto p-6 sm:p-8 rounded-3xl bg-white/10 backdrop-blur-lg shadow-2xl border border-white/20">
          <h2 className="text-3xl font-bold text-center mb-6 flex items-center justify-center gap-2 text-white">
            <UserPlus size={28} className="text-teal-400" /> Create Account
          </h2>
          
          <form onSubmit={handleSignUp} className="space-y-4">
            
            {/* Inline Feedback Messages */}
            {feedback.message && (
              <div className={`flex items-center gap-3 p-4 rounded-lg text-sm transition-opacity duration-300 ${
                feedback.type === 'error' ? 'bg-red-900/50 border border-red-500 text-red-300' : 
                'bg-green-900/50 border border-green-500 text-green-300'
              }`}>
                {feedback.type === 'error' ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
                <p className="font-medium">{feedback.message}</p>
              </div>
            )}

            <FormInput 
                id="name-signup" 
                label="Name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="John Doe"
                disabled={isFormDisabled}
                Icon={User}
            />
            <FormInput 
                id="email-signup" 
                label="Email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                type="email" 
                placeholder="name@example.com"
                disabled={isFormDisabled}
                Icon={Mail}
            />
            <FormInput 
                id="password-signup" 
                label="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                type="password" 
                placeholder="••••••••"
                disabled={isFormDisabled}
                Icon={Lock}
            />
            <FormInput 
                id="confirm-password-signup" 
                label="Confirm Password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                type="password" 
                placeholder="••••••••"
                disabled={isFormDisabled}
                Icon={Lock}
            />
            
            <button
              type="submit"
              disabled={isFormDisabled}
              className={`w-full bg-gradient-to-r from-teal-500 to-indigo-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-base mt-6`}
            >
              {loading ? (
                <>
                  <Loader2 size={24} className="animate-spin mr-2" /> Signing Up...
                </>
              ) : feedback.type === 'success' ? (
                <>
                  <CheckCircle size={24} className="mr-2" /> Success!
                </>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center border-t border-gray-700/50 pt-6">
            <p className="text-gray-300 text-sm sm:text-base">
              Already have an account?
              <a
                onClick={() => !isFormDisabled && navigate('/signin')}
                className={`font-semibold text-teal-400 hover:text-teal-300 ml-1 ${isFormDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              >
                Sign In
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}