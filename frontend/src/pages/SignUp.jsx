import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authAPI from '../api/AuthCalls';
import { useDispatch } from 'react-redux';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPic, setSelectedPic] = useState('https://placehold.co/150x150/A0522D/FFFFFF?text=Astronaut');
  const navigate = useNavigate();

  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='));
    if (token) {
      navigate('/home');
    }
  }, [navigate]);

  const profilePics = [
    { id: 1, url: 'https://placehold.co/150x150/A0522D/FFFFFF?text=Astronaut' },
    { id: 2, url: 'https://placehold.co/150x150/B8860B/FFFFFF?text=Fox' },
    { id: 3, url: 'https://placehold.co/150x150/CD853F/FFFFFF?text=Owl' },
    { id: 4, url: 'https://placehold.co/150x150/D2691E/FFFFFF?text=Potato' },
    { id: 5, url: 'https://placehold.co/150x150/8B4513/FFFFFF?text=Sloth' },
    { id: 6, url: 'https://placehold.co/150x150/A0522D/FFFFFF?text=Cat' },
    { id: 7, url: 'https://placehold.co/150x150/B8860B/FFFFFF?text=Mushroom' },
    { id: 8, url: 'https://placehold.co/150x150/CD853F/FFFFFF?text=Frog' },
    { id: 9, url: 'https://placehold.co/150x150/D2691E/FFFFFF?text=Robot' },
    { id: 10, url: 'https://placehold.co/150x150/8B4513/FFFFFF?text=Human' },
  ];
  const dispatch = useDispatch()

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await authAPI.signUp({ name, email, password, profilePic: selectedPic }, dispatch);
      alert('Registration successful! Please sign in.');
      navigate('/signin');
    } catch (error) {
      alert(`Registration failed: ${error.message}`);
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
          <h2 className="text-3xl font-bold text-center mb-6 text-white">Create an Account</h2>
          <form onSubmit={handleSignUp} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2" htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Your Name"
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-2" htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-2" htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-2">Choose a Profile Pic</label>
                <div className="grid grid-cols-5 gap-2">
                  {profilePics.map((pic) => (
                    <img
                      key={pic.id}
                      src={pic.url}
                      alt={`Profile pic ${pic.id}`}
                      className={`w-14 h-14 rounded-full cursor-pointer transition-transform transform hover:scale-110 ${selectedPic === pic.url ? 'ring-4 ring-indigo-500' : ''}`}
                      onClick={() => setSelectedPic(pic.url)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-500 to-indigo-600 text-white font-semibold py-3 rounded-md shadow-lg hover:shadow-xl transition-transform transform hover:-translate-y-1"
            >
              Sign Up
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-gray-300">
              Already have an account?
              <a
                onClick={() => navigate('/signin')}
                className="font-semibold text-indigo-400 hover:text-indigo-300 ml-1 cursor-pointer"
              >
                Sign In
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
