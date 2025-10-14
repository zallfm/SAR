
import React, { useState } from 'react';
import type { User } from '../types';
import { MOCK_USERS } from '../constants';
import { SystemIcon } from '../src/components/icons/SystemIcon';
import { EyeIcon } from '../src/components/icons/EyeIcon';
import { EyeSlashIcon } from '../src/components/icons/EyeSlashIcon';
import { ExclamationCircleIcon } from '../src/components/icons/ExclamationCircleIcon';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Username and password are required.');
      return;
    }

    const foundUser = MOCK_USERS.find(
      (user) => user.username === username && user.password === password
    );

    if (foundUser) {
      const { password, ...userToLogin } = foundUser;
      onLoginSuccess(userToLogin);
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl grid md:grid-cols-2 overflow-hidden">
        {/* Left Panel: Branding */}
        <div className="hidden md:flex flex-col items-center justify-center p-12 bg-stone-50 text-center">
          <SystemIcon className="w-48 h-48" />
          <h1 className="mt-8 text-4xl font-bold tracking-wider text-[#0F3460]">
            SYSTEM
            <br />
            AUTHORIZATION
            <br />
            REVIEW
          </h1>
        </div>

        {/* Right Panel: Login Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-800">Login to Account</h2>
          <p className="mt-3 text-sm text-gray-500">
            Please enter username and password to continue
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label
                htmlFor="username"
                className="text-sm font-semibold text-gray-700 block"
              >
                Username <span className="text-red-500">*</span>
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter the username"
                className="mt-2 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm font-semibold text-gray-700 block"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-2">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center p-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-300" role="alert">
                <ExclamationCircleIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
