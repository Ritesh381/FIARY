import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authAPI from '../api/AuthCalls';
import { Loader2 } from 'lucide-react';
import { useDispatch } from 'react-redux';

// --- SignUp Component ---
export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const dispatch = useDispatch()

  // State for loading and messages
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    // Check if a user is already logged in
    const token = document.cookie.split('; ').find(row => row.startsWith('token='));
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await authAPI.signUp({ name, email, password, confirmPassword },dispatch);
      setSuccess('Sign up successful! Please sign in.');
      setTimeout(() => {
        navigate('/signin'); // Redirect to sign in page after success
      }, 500);
    } catch (error) {
      setError(error.message || 'An unknown sign-up error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Main container: full screen, simple dark background
    <div className="relative overflow-hidden text-gray-200 antialiased font-sans flex items-center justify-center p-4">
      <style>{`
        .font-sans {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
      
      {/* Removed HeroCanvas */}

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
      <main className="z-10 w-full max-w-md">
        
        {/* Simple Card for the form */}
        <div className="w-full mx-auto p-6 sm:p-8 rounded-2xl bg-gray-800/60 backdrop-blur-sm shadow-xl border border-gray-700/50">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-white">Create Account</h2>
          
          <form onSubmit={handleSignUp} className="space-y-4">
            
            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-lg text-center text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-500/20 border border-green-500 text-green-200 p-3 rounded-lg text-center text-sm">
                {success}
              </div>
            )}

            <div>
              <label className="block text-sm sm:text-base text-white mb-2" htmlFor="name-signup">Name</label>
              <input
                type="text"
                id="name-signup"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent focus:border-indigo-500 text-sm sm:text-base"
                placeholder="John Doe"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm sm:text-base text-white mb-2" htmlFor="email-signup">Email</label>
              <input
                type="email"
                id="email-signup"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent focus:border-indigo-500 text-sm sm:text-base"
                placeholder="name@example.com"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm sm:text-base text-white mb-2" htmlFor="password-signup">Password</label>
              <input
                type="password"
                id="password-signup"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent focus:border-indigo-500 text-sm sm:text-base"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm sm:text-base text-white mb-2" htmlFor="confirm-password-signup">Confirm Password</label>
              <input
                type="password"
                id="confirm-password-signup"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent focus:border-indigo-500 text-sm sm:text-base"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-gradient-to-r from-teal-500 to-indigo-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Sign Up'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-300 text-sm sm:text-base">
              Already have an account?
              <a
                onClick={() => !loading && navigate('/signin')}
                className={`font-semibold text-indigo-400 hover:text-indigo-300 ml-1 ${loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
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
