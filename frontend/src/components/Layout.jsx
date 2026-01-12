import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Users, Bell, LogOut, Menu, X, User, Briefcase } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  const navItems = [
    { path: '/employees', label: 'Employees', icon: Users },
    { path: '/projects', label: 'Projects', icon: Briefcase },
    ...(isAdmin ? [{ path: '/notifications', label: 'Notifications', icon: Bell }] : []),
    { path: '/profile', label: 'My Profile', icon: User },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-[#f6f8fa]">
      {/* Header */}
      <header className="bg-[#24292f] text-white border-b border-[#d0d7de]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Users className="h-6 w-6 text-white mr-2" />
                <span className="text-lg font-semibold text-white">Employee Management</span>
              </div>

              {/* Desktop Navigation - GitHub style tabs */}
              <nav className="hidden md:flex items-center space-x-2 ml-6">
                {navItems.map((item) => (
                  <Link key={item.path} to={item.path} className="relative">
                    <button
                      className={`flex items-center px-4 py-2 text-sm font-medium transition-colors ${
                        isActive(item.path)
                          ? 'text-white'
                          : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </button>
                    {isActive(item.path) && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-active-tab)]" />
                    )}
                  </Link>
                ))}
              </nav>
            </div>

            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="text-sm text-right">
                <p className="font-medium text-white">{user?.firstName} {user?.lastName}</p>
                <p className="text-gray-300 text-xs">{user?.role}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="px-3 py-1.5 text-sm font-medium text-white border border-gray-500 rounded-md hover:bg-gray-700 transition-colors"
              >
                <LogOut className="inline h-4 w-4 mr-1" />
                Logout
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-600">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <button
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive(item.path)
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </button>
                </Link>
              ))}
              <div className="pt-4 pb-2 border-t border-gray-600">
                <div className="px-3 mb-2">
                  <p className="font-medium text-white">{user?.firstName} {user?.lastName}</p>
                  <p className="text-sm text-gray-300">{user?.role}</p>
                </div>
                <button
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <Toaster />
    </div>
  );
}
