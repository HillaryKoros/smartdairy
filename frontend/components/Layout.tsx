'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FiHome, FiUsers, FiDroplet, FiPackage, FiHeart, FiCheckSquare,
  FiDollarSign, FiBell, FiMenu, FiX, FiLogOut, FiUser
} from 'react-icons/fi';
import { GiCow, GiSheep, GiChicken } from 'react-icons/gi';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';

const workerNavItems = [
  { href: '/worker', label: 'Dashboard', icon: FiHome },
  { href: '/worker/tasks', label: 'Tasks', icon: FiCheckSquare },
  { href: '/worker/milk', label: 'Milk Log', icon: FiDroplet },
  { href: '/worker/feeds', label: 'Feed Usage', icon: FiPackage },
  { href: '/worker/health', label: 'Health', icon: FiHeart },
];

const ownerNavItems = [
  { href: '/owner', label: 'Dashboard', icon: FiHome },
  { href: '/owner/cows', label: 'Cows', icon: GiCow },
  { href: '/owner/sheep', label: 'Sheep', icon: GiSheep },
  { href: '/owner/chickens', label: 'Chickens', icon: GiChicken },
  { href: '/owner/milk', label: 'Production', icon: FiDroplet },
  { href: '/owner/feeds', label: 'Inventory', icon: FiPackage },
  { href: '/owner/health', label: 'Health', icon: FiHeart },
  { href: '/owner/tasks', label: 'Tasks', icon: FiCheckSquare },
  { href: '/owner/sales', label: 'Sales', icon: FiDollarSign },
  { href: '/owner/alerts', label: 'Alerts', icon: FiBell },
];

interface LayoutProps {
  children: React.ReactNode;
  role?: 'worker' | 'owner';
}

export default function Layout({ children, role = 'owner' }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const navItems = role === 'worker' ? workerNavItems : ownerNavItems;

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // Ignore errors
    }
    clearAuth();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-primary-800 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-primary-700">
          <div className="flex items-center gap-2">
            <GiCow className="text-3xl" />
            <span className="font-bold text-lg">Koimeret</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 hover:bg-primary-700 rounded"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-primary-100 hover:bg-primary-700'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="text-xl" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary-700">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
              <FiUser className="text-xl" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.full_name || 'User'}</p>
              <p className="text-sm text-primary-200 truncate">{user?.phone}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-primary-100 hover:bg-primary-700 rounded-lg transition-colors"
          >
            <FiLogOut className="text-xl" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <FiMenu className="text-xl" />
            </button>
            <div className="flex-1 lg:flex-none">
              <h1 className="text-lg font-semibold text-gray-800 lg:hidden text-center">
                Koimeret Dairies
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={role === 'worker' ? '/owner' : '/worker'}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Switch to {role === 'worker' ? 'Owner' : 'Worker'}
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
