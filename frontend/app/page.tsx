'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GiCow, GiFarmTractor, GiMilkCarton, GiWheat } from 'react-icons/gi';
import { FiDroplet, FiHeart, FiUsers, FiBarChart2, FiArrowRight } from 'react-icons/fi';

// Farm showcase data (public, no auth needed)
const SHOWCASE_COWS = [
  { id: 1, tag: 'KD001', name: 'Malkia', breed: 'Friesian', status: 'milking', image: 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=400', avgMilk: 18.5 },
  { id: 2, tag: 'KD002', name: 'Zawadi', breed: 'Friesian', status: 'milking', image: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=400', avgMilk: 16.2 },
  { id: 3, tag: 'KD003', name: 'Baraka', breed: 'Ayrshire', status: 'milking', image: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=400', avgMilk: 14.8 },
  { id: 4, tag: 'KD004', name: 'Neema', breed: 'Jersey', status: 'pregnant', image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400', avgMilk: 12.5 },
  { id: 5, tag: 'KD005', name: 'Tumaini', breed: 'Friesian', status: 'heifer', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', avgMilk: 0 },
];

const FARM_STATS = {
  totalCows: 5,
  milkingCows: 3,
  dailyProduction: 49.5,
  monthlyRevenue: 89100,
};

export default function PublicShowcase() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const farmImages = [
    'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1920',
    'https://images.unsplash.com/photo-1594761051656-c5917e299789?w=1920',
    'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=1920',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % farmImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section with Farm Background */}
      <section
        className="relative h-screen flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${farmImages[currentImageIndex]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'background-image 1s ease-in-out'
        }}
      >
        <div className="text-center text-white z-10 px-4">
          <div className="flex items-center justify-center gap-4 mb-6">
            <GiCow className="text-6xl text-green-400" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-4">Koimeret Dairies</h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Smart Dairy Farm Management System - Quality Milk Production in Chepalungu, Bomet, Kenya
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center justify-center gap-2 transition-all"
            >
              Farm Portal <FiArrowRight />
            </Link>
            <a
              href="#showcase"
              className="bg-white/20 hover:bg-white/30 backdrop-blur text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all"
            >
              View Our Farm
            </a>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-white text-center">
            <div>
              <GiCow className="text-3xl mx-auto mb-2 text-green-400" />
              <p className="text-3xl font-bold">{FARM_STATS.totalCows}</p>
              <p className="text-sm text-gray-300">Total Cows</p>
            </div>
            <div>
              <FiDroplet className="text-3xl mx-auto mb-2 text-blue-400" />
              <p className="text-3xl font-bold">{FARM_STATS.dailyProduction}L</p>
              <p className="text-sm text-gray-300">Daily Production</p>
            </div>
            <div>
              <FiHeart className="text-3xl mx-auto mb-2 text-red-400" />
              <p className="text-3xl font-bold">{FARM_STATS.milkingCows}</p>
              <p className="text-sm text-gray-300">Milking Cows</p>
            </div>
            <div>
              <FiBarChart2 className="text-3xl mx-auto mb-2 text-yellow-400" />
              <p className="text-3xl font-bold">KES {(FARM_STATS.monthlyRevenue / 1000).toFixed(0)}K</p>
              <p className="text-sm text-gray-300">Monthly Revenue</p>
            </div>
          </div>
        </div>
      </section>

      {/* Farm Showcase Section */}
      <section id="showcase" className="py-20 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Herd</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Meet our healthy, well-cared-for dairy cows. Each cow is individually tracked for milk production, health, and breeding.
            </p>
          </div>

          {/* Cows Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {SHOWCASE_COWS.map((cow) => (
              <div key={cow.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-48 overflow-hidden">
                  <img
                    src={cow.image}
                    alt={cow.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{cow.tag}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      cow.status === 'milking' ? 'bg-green-100 text-green-800' :
                      cow.status === 'pregnant' ? 'bg-blue-100 text-blue-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {cow.status.charAt(0).toUpperCase() + cow.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{cow.name} - {cow.breed}</p>
                  {cow.avgMilk > 0 && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <FiDroplet />
                      <span className="font-medium">{cow.avgMilk} L/day avg</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Farm Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <GiMilkCarton className="text-5xl text-blue-500 mx-auto mb-4" />
              <h3 className="font-bold text-gray-800 mb-2">Quality Milk</h3>
              <p className="text-sm text-gray-600">Fresh, high-quality milk from healthy cows</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <GiWheat className="text-5xl text-yellow-500 mx-auto mb-4" />
              <h3 className="font-bold text-gray-800 mb-2">Quality Feed</h3>
              <p className="text-sm text-gray-600">Balanced nutrition with silage & concentrates</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <FiHeart className="text-5xl text-red-500 mx-auto mb-4" />
              <h3 className="font-bold text-gray-800 mb-2">Health Tracking</h3>
              <p className="text-sm text-gray-600">Regular health checks & vaccinations</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <GiFarmTractor className="text-5xl text-green-500 mx-auto mb-4" />
              <h3 className="font-bold text-gray-800 mb-2">Modern Farm</h3>
              <p className="text-sm text-gray-600">4,775 m² with modern facilities</p>
            </div>
          </div>
        </div>
      </section>

      {/* Farm Layout Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Farm Layout</h2>
            <p className="text-gray-600">Our well-planned dairy farm in Eldoret</p>
          </div>

          <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-white/80 p-4 rounded-lg">
                <p className="text-2xl font-bold text-green-700">140 m²</p>
                <p className="text-sm text-gray-600">Cow Shed</p>
              </div>
              <div className="bg-white/80 p-4 rounded-lg">
                <p className="text-2xl font-bold text-green-700">120 m²</p>
                <p className="text-sm text-gray-600">Feeding Area</p>
              </div>
              <div className="bg-white/80 p-4 rounded-lg">
                <p className="text-2xl font-bold text-green-700">3,000 m²</p>
                <p className="text-sm text-gray-600">Fodder Field</p>
              </div>
              <div className="bg-white/80 p-4 rounded-lg">
                <p className="text-2xl font-bold text-green-700">150 m²</p>
                <p className="text-sm text-gray-600">Water Pan</p>
              </div>
            </div>
            <div className="mt-6 text-center">
              <p className="text-lg text-gray-700">
                <strong>Total Area:</strong> 4,775 m² | <strong>Daily Production:</strong> 45-60 L
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact / CTA Section */}
      <section
        className="py-20 text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(0,100,0,0.85), rgba(0,80,0,0.9)), url(https://images.unsplash.com/photo-1594761051656-c5917e299789?w=1920)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Fresh Milk Daily</h2>
          <p className="text-xl text-green-100 mb-8">
            Contact us for bulk orders or regular supply. Quality milk from healthy cows, delivered fresh.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+254700000000"
              className="bg-white text-green-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-50 transition"
            >
              Call: 0700 000 000
            </a>
            <Link
              href="/login"
              className="bg-green-500 hover:bg-green-400 px-8 py-4 rounded-lg text-lg font-semibold transition flex items-center justify-center gap-2"
            >
              <FiUsers /> Staff Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GiCow className="text-2xl text-green-500" />
            <span className="text-white font-bold">Koimeret Dairies</span>
          </div>
          <p className="text-sm">Chepalungu, Bomet, Kenya | Quality Dairy Farming</p>
          <p className="text-xs mt-4">&copy; 2024 Koimeret Enterprise Dairy. Smart Farm Management System.</p>
        </div>
      </footer>
    </div>
  );
}
