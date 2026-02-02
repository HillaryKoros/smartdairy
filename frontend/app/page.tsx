'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GiCow, GiFarmTractor, GiMilkCarton, GiWheat } from 'react-icons/gi';
import { FiDroplet, FiHeart, FiUsers, FiBarChart2, FiArrowRight } from 'react-icons/fi';

// Farm showcase data - 3 Cows and 6 Sheep
const SHOWCASE_ANIMALS = [
  // Cows (3): 2 milking, 1 pregnant
  { id: 1, tag: 'KD001', name: 'Malkia', breed: 'Friesian', type: 'cow', status: 'milking', image: 'https://cdn.pixabay.com/photo/2016/10/11/13/29/cow-1731377_640.jpg', avgMilk: 18.5 },
  { id: 2, tag: 'KD002', name: 'Zawadi', breed: 'Holstein', type: 'cow', status: 'milking', image: 'https://cdn.pixabay.com/photo/2017/11/08/15/16/cow-2930581_640.jpg', avgMilk: 16.2 },
  { id: 3, tag: 'KD003', name: 'Baraka', breed: 'Ayrshire', type: 'cow', status: 'pregnant', image: 'https://cdn.pixabay.com/photo/2013/10/09/02/27/cow-192983_640.jpg', avgMilk: 0 },
  // Sheep (6): 3 ewes (mothers), 1 ram, 2 lambs (young)
  { id: 4, tag: 'KS001', name: 'Neema', breed: 'Dorper', type: 'sheep', status: 'ewe', image: 'https://cdn.pixabay.com/photo/2018/07/25/08/58/sheep-3560872_640.jpg', avgMilk: 0 },
  { id: 5, tag: 'KS002', name: 'Tumaini', breed: 'Dorper', type: 'sheep', status: 'ewe', image: 'https://cdn.pixabay.com/photo/2016/11/29/04/19/sheep-1867441_640.jpg', avgMilk: 0 },
  { id: 6, tag: 'KS003', name: 'Faraja', breed: 'Dorper', type: 'sheep', status: 'ewe', image: 'https://cdn.pixabay.com/photo/2019/07/22/09/24/sheep-4354153_640.jpg', avgMilk: 0 },
  { id: 7, tag: 'KS004', name: 'Simba', breed: 'Dorper', type: 'sheep', status: 'ram', image: 'https://cdn.pixabay.com/photo/2018/04/17/18/03/sheep-3327684_640.jpg', avgMilk: 0 },
  { id: 8, tag: 'KS005', name: 'Kidogo', breed: 'Dorper', type: 'sheep', status: 'lamb', image: 'https://cdn.pixabay.com/photo/2017/06/25/07/03/lamb-2441023_640.jpg', avgMilk: 0 },
  { id: 9, tag: 'KS006', name: 'Mdogo', breed: 'Dorper', type: 'sheep', status: 'lamb', image: 'https://cdn.pixabay.com/photo/2016/03/27/21/16/sheep-1284093_640.jpg', avgMilk: 0 },
];

const FARM_STATS = {
  totalCows: 3,
  totalSheep: 6,
  milkingCows: 2,
  dailyProduction: 34.7,
  monthlyRevenue: 62460,
};

export default function PublicShowcase() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Background images - verified cow/dairy farm images
  const farmImages = [
    'https://cdn.pixabay.com/photo/2017/04/03/08/47/cow-2197954_1280.jpg',
    'https://cdn.pixabay.com/photo/2016/10/11/13/29/cow-1731377_1280.jpg',
    'https://cdn.pixabay.com/photo/2015/05/04/10/03/cow-752458_1280.jpg',
    'https://cdn.pixabay.com/photo/2017/11/08/15/16/cow-2930581_1280.jpg',
    'https://cdn.pixabay.com/photo/2019/07/17/15/27/calf-4344336_1280.jpg',
    'https://cdn.pixabay.com/photo/2016/07/11/15/09/cow-1509258_1280.jpg',
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
          <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-5 gap-4 text-white text-center">
            <div>
              <GiCow className="text-3xl mx-auto mb-2 text-green-400" />
              <p className="text-3xl font-bold">{FARM_STATS.totalCows}</p>
              <p className="text-sm text-gray-300">Dairy Cows</p>
            </div>
            <div>
              <span className="text-3xl mx-auto mb-2 block">🐑</span>
              <p className="text-3xl font-bold">{FARM_STATS.totalSheep}</p>
              <p className="text-sm text-gray-300">Sheep</p>
            </div>
            <div>
              <FiDroplet className="text-3xl mx-auto mb-2 text-blue-400" />
              <p className="text-3xl font-bold">{FARM_STATS.dailyProduction}L</p>
              <p className="text-sm text-gray-300">Daily Milk</p>
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

      {/* Farm Showcase Section - Full Width */}
      <section id="showcase" className="py-20 bg-gradient-to-b from-green-50 to-white">
        <div className="px-4 md:px-8 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Herd</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Meet our healthy, well-cared-for dairy cows. Each cow is individually tracked for milk production, health, and breeding.
            </p>
          </div>

          {/* Animals Grid - Full Width */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-16">
            {SHOWCASE_ANIMALS.map((animal) => (
              <div key={animal.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={animal.image}
                    alt={animal.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium shadow-md ${
                      animal.type === 'cow' ? 'bg-green-700 text-white' : 'bg-amber-600 text-white'
                    }`}>
                      {animal.type === 'cow' ? '🐄 Cow' : '🐑 Sheep'}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium shadow-md ${
                      animal.status === 'milking' ? 'bg-green-500 text-white' :
                      animal.status === 'pregnant' ? 'bg-blue-500 text-white' :
                      animal.status === 'dry' ? 'bg-yellow-500 text-white' :
                      animal.status === 'ewe' ? 'bg-pink-500 text-white' :
                      animal.status === 'ram' ? 'bg-indigo-600 text-white' :
                      animal.status === 'lamb' ? 'bg-orange-400 text-white' :
                      'bg-purple-500 text-white'
                    }`}>
                      {animal.status.charAt(0).toUpperCase() + animal.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{animal.tag}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{animal.name} - {animal.breed}</p>
                  {animal.avgMilk > 0 && (
                    <div className="flex items-center gap-2 text-blue-600 text-sm">
                      <FiDroplet />
                      <span className="font-medium">{animal.avgMilk} L/day avg</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Farm Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        <div className="px-4 md:px-8 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Farm Layout</h2>
            <p className="text-gray-600">Our well-planned dairy farm in Chepalungu, Bomet</p>
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
