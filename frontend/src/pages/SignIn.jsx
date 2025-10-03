import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authAPI from '../api/AuthCalls';
import { useDispatch } from 'react-redux';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch()

  useEffect(() => {
    // Check if a user is already logged in
    const token = document.cookie.split('; ').find(row => row.startsWith('token='));
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      await authAPI.signIn({ email, password }, dispatch);
      navigate('/');
    } catch (error) {
      alert(`Authentication failed: ${error.message}`);
    }
  };

  return (
    <div className="bg-transparent min-h-screen flex flex-col">
      <style>{`
        .font-sans {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
      <nav className="flex items-center justify-between p-4 md:p-6 lg:p-8">
        <div
          onClick={() => navigate('/')}
          className="text-white text-2xl font-bold cursor-pointer transition-transform transform hover:scale-105"
        >
          FIARY
        </div>
      </nav>
      <div className="flex-grow flex items-center justify-center text-gray-200 antialiased font-sans px-4">
        <div className="w-full max-w-md mx-auto p-8 rounded-2xl bg-white/20 backdrop-blur-md shadow-xl border border-gray-200">
          <h2 className="text-3xl font-bold text-center mb-6 text-white">Welcome Back!</h2>
          <form onSubmit={handleSignIn} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2" htmlFor="email-signin">Email</label>
                <input
                  type="email"
                  id="email-signin"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-2" htmlFor="password-signin">Password</label>
                <input
                  type="password"
                  id="password-signin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-500 to-indigo-600 text-white font-semibold py-3 rounded-md shadow-lg hover:shadow-xl transition-transform transform hover:-translate-y-1"
            >
              Sign In
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-gray-300">
              Don't have an account?
              <a
                onClick={() => navigate('/signup')}
                className="font-semibold text-indigo-400 hover:text-indigo-300 ml-1 cursor-pointer"
              >
                Sign Up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
