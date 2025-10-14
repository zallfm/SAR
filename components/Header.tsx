import React, { useState, useRef, useEffect } from 'react';
import type { User } from '../types';
import { SystemIcon } from './icons/SystemIcon';
import { BellIcon } from './icons/BellIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  return (
    <header className="bg-white shadow-sm flex items-center justify-between px-6 py-3 border-b border-gray-200">
      <div className="flex items-center">
        <SystemIcon className="w-9 h-9 text-[#0F3460]" />
        <h1 className="text-xl font-bold text-[#0F3460] ml-3 tracking-wide">
          SYSTEM AUTHORIZATION REVIEW
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative text-gray-500 hover:text-gray-700" aria-label="Notifications">
          <BellIcon className="w-6 h-6" />
          <span className="absolute top-0 right-0 flex h-4 w-4">
             <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 items-center justify-center text-white text-xs">1</span>
          </span>
        </button>
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2" aria-haspopup="true" aria-expanded={dropdownOpen}>
            <img 
              className="w-9 h-9 rounded-full" 
              src="https://i.pravatar.cc/40?u=hesti" 
              alt="User avatar" 
            />
            <div className="text-left hidden md:block">
              <p className="text-sm font-semibold text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
            <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              <button
                onClick={onLogout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
