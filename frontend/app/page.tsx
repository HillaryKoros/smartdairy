'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GiCow, GiFarmTractor, GiMilkCarton, GiWheat, GiMeat, GiSheep } from 'react-icons/gi';
import { FiDroplet, FiHeart, FiPhone, FiShoppingCart, FiX, FiMenu, FiCalendar, FiActivity } from 'react-icons/fi';

// Animal data with detailed characteristics
const SHOWCASE_ANIMALS = [
  // Cows (3): 2 milking, 1 pregnant
  {
    id: 1, tag: 'KD001', name: 'Malkia', breed: 'Friesian', type: 'cow', status: 'milking',
    image: '/images/cows/IMG-20240527-WA0009.jpg', avgMilk: 18.5, age: '4 years', weight: '450 kg',
    lastCalving: '2024-01-15', healthStatus: 'Excellent', color: 'Black & White',
    description: 'Our top milk producer, known for her calm temperament and consistent milk yield.'
  },
  {
    id: 2, tag: 'KD002', name: 'Zawadi', breed: 'Holstein', type: 'cow', status: 'milking',
    image: '/images/cows/istockphoto-1072682504-612x612.jpg', avgMilk: 16.2, age: '3 years', weight: '420 kg',
    lastCalving: '2024-03-20', healthStatus: 'Good', color: 'Black & White',
    description: 'A young and healthy cow with excellent genetic potential.'
  },
  {
    id: 3, tag: 'KD003', name: 'Baraka', breed: 'Ayrshire', type: 'cow', status: 'pregnant',
    image: '/images/cows/cow_calf_field-900x450.jpg', avgMilk: 0, age: '5 years', weight: '480 kg',
    dueDate: '2024-08-10', healthStatus: 'Excellent', color: 'Red & White',
    description: 'Experienced mother, currently expecting her 4th calf.'
  },
  // Sheep (6): 3 ewes (mothers), 1 ram, 2 lambs
  {
    id: 4, tag: 'KS001', name: 'Neema', breed: 'Dorper', type: 'sheep', status: 'ewe',
    image: '/images/sheeps/GBZAMN3XwAA0jB-.jpg', age: '3 years', weight: '55 kg', lambsProduced: 4,
    healthStatus: 'Excellent', color: 'White with black head',
    description: 'Our most productive ewe, excellent mother instincts.'
  },
  {
    id: 5, tag: 'KS002', name: 'Tumaini', breed: 'Dorper', type: 'sheep', status: 'ewe',
    image: '/images/sheeps/images.jpeg', age: '2 years', weight: '48 kg', lambsProduced: 2,
    healthStatus: 'Good', color: 'White with black head',
    description: 'Young ewe showing great breeding potential.'
  },
  {
    id: 6, tag: 'KS003', name: 'Faraja', breed: 'Dorper', type: 'sheep', status: 'ewe',
    image: '/images/sheeps/images (1).jpeg', age: '4 years', weight: '52 kg', lambsProduced: 6,
    healthStatus: 'Excellent', color: 'White with black head',
    description: 'Seasoned mother with consistent twin births.'
  },
  {
    id: 7, tag: 'KS004', name: 'Simba', breed: 'Dorper', type: 'sheep', status: 'ram',
    image: '/images/sheeps/images2.jpeg', age: '3 years', weight: '75 kg',
    healthStatus: 'Excellent', color: 'White with black head',
    description: 'Strong breeding ram with excellent genetics.'
  },
  {
    id: 8, tag: 'KS005', name: 'Kidogo', breed: 'Dorper', type: 'sheep', status: 'lamb',
    image: '/images/sheeps/images (2).jpeg', age: '4 months', weight: '18 kg',
    healthStatus: 'Good', color: 'White with black markings',
    description: 'Growing lamb from Neema, healthy and active.'
  },
  {
    id: 9, tag: 'KS006', name: 'Mdogo', breed: 'Dorper', type: 'sheep', status: 'lamb',
    image: '/images/sheeps/images (3).jpeg', age: '3 months', weight: '15 kg',
    healthStatus: 'Good', color: 'White with black markings',
    description: 'Youngest lamb, twin from Faraja.'
  },
];

const FARM_STATS = {
  totalCows: 3,
  totalSheep: 6,
  milkingCows: 2,
  dailyProduction: 34.7,
  sheepSold: 8,
};

// Products available for order
const PRODUCTS = [
  { name: 'Fresh Milk', price: 'KES 60/L', icon: GiMilkCarton, description: 'Daily fresh milk from our healthy cows' },
  { name: 'Mutton', price: 'KES 600/kg', icon: GiMeat, description: 'Quality Dorper sheep meat' },
  { name: 'Live Sheep', price: 'From KES 8,000', icon: GiSheep, description: 'Healthy Dorper sheep for breeding or meat' },
  { name: 'Dairy Calves', price: 'From KES 25,000', icon: GiCow, description: 'Quality dairy breed calves' },
];

export default function PublicShowcase() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedAnimal, setSelectedAnimal] = useState<typeof SHOWCASE_ANIMALS[0] | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'cows' | 'sheep'>('all');

  // Hero background images - farm scenes
  const farmImages = [
    '/images/cows/IMG-20240527-WA0009.jpg',
    '/images/cows/Richard 2_FIN.png',
    '/images/maize/Silage-on-maize-green-stems-unripe-on-field_Getty-Images-Large.jpeg',
    '/images/maize/header-1900-800-px-1-848x600.jpg',
    '/images/sheeps/GBZAMN3XwAA0jB-.jpg',
    '/images/maize/sustainables.jpg',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % farmImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredAnimals = SHOWCASE_ANIMALS.filter(animal => {
    if (filter === 'all') return true;
    if (filter === 'cows') return animal.type === 'cow';
    if (filter === 'sheep') return animal.type === 'sheep';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'milking': return 'bg-green-500';
      case 'pregnant': return 'bg-blue-500';
      case 'ewe': return 'bg-pink-500';
      case 'ram': return 'bg-indigo-600';
      case 'lamb': return 'bg-orange-400';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-green-800/95 backdrop-blur z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14 md:h-16">
            <div className="flex items-center gap-2">
              <GiCow className="text-2xl md:text-3xl text-green-300" />
              <span className="font-bold text-white text-sm md:text-lg">Koimeret Dairies</span>
            </div>

            {/* Desktop Stats */}
            <div className="hidden md:flex items-center gap-6 text-white text-sm">
              <span>🐄 {FARM_STATS.totalCows} Cows</span>
              <span>🐑 {FARM_STATS.totalSheep} Sheep</span>
              <span>🥛 {FARM_STATS.dailyProduction}L/day</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-4">
              <a href="#herd" className="text-white hover:text-green-300 text-sm">Our Herd</a>
              <a href="#products" className="text-white hover:text-green-300 text-sm">Products</a>
              <a href="#contact" className="text-white hover:text-green-300 text-sm">Contact</a>
              <Link href="/login" className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
                Farm Portal
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white p-2">
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-green-700">
              <div className="flex flex-col gap-3">
                <a href="#herd" className="text-white hover:text-green-300" onClick={() => setMobileMenuOpen(false)}>Our Herd</a>
                <a href="#products" className="text-white hover:text-green-300" onClick={() => setMobileMenuOpen(false)}>Products</a>
                <a href="#contact" className="text-white hover:text-green-300" onClick={() => setMobileMenuOpen(false)}>Contact</a>
                <Link href="/login" className="bg-green-600 text-white px-4 py-2 rounded-lg text-center">Farm Portal</Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section - Smaller */}
      <section
        className="relative h-[55vh] md:h-[60vh] flex items-center justify-center pt-14"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${farmImages[currentImageIndex]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'background-image 1s ease-in-out'
        }}
      >
        <div className="text-center text-white z-10 px-4">
          <h1 className="text-3xl md:text-5xl font-bold mb-3">Koimeret Dairies</h1>
          <p className="text-base md:text-xl text-gray-200 mb-6 max-w-xl mx-auto">
            Quality Milk & Meat Production in Chepalungu, Bomet, Kenya
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="#products" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
              <FiShoppingCart /> Order Products
            </a>
            <a href="#herd" className="bg-white/20 hover:bg-white/30 backdrop-blur text-white px-6 py-3 rounded-lg font-semibold">
              Meet Our Herd
            </a>
          </div>
        </div>
      </section>

      {/* Our Herd Section - Larger Cards */}
      <section id="herd" className="py-12 md:py-20 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">Our Herd</h2>
            <p className="text-gray-600 md:text-lg">Click on any animal to learn more about them</p>
          </div>

          {/* Filter Buttons */}
          <div className="flex justify-center gap-3 mb-8">
            <button
              onClick={() => setFilter('all')}
              className={`px-5 py-2 rounded-full font-medium transition ${
                filter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({SHOWCASE_ANIMALS.length})
            </button>
            <button
              onClick={() => setFilter('cows')}
              className={`px-5 py-2 rounded-full font-medium transition flex items-center gap-2 ${
                filter === 'cows' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🐄 Cows ({FARM_STATS.totalCows})
            </button>
            <button
              onClick={() => setFilter('sheep')}
              className={`px-5 py-2 rounded-full font-medium transition flex items-center gap-2 ${
                filter === 'sheep' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🐑 Sheep ({FARM_STATS.totalSheep})
            </button>
          </div>

          {/* Animals Grid - Larger Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnimals.map((animal) => (
              <div
                key={animal.id}
                onClick={() => setSelectedAnimal(animal)}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1 group"
              >
                <div className="h-48 md:h-56 overflow-hidden relative">
                  <img
                    src={animal.image}
                    alt={animal.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(animal.status)}`}>
                      {animal.status}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{animal.type === 'cow' ? '🐄' : '🐑'}</span>
                      <div>
                        <p className="font-bold text-white text-lg">{animal.name}</p>
                        <p className="text-gray-200 text-sm">{animal.tag} • {animal.breed}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                    <span>Age: {animal.age}</span>
                    <span>Weight: {animal.weight}</span>
                  </div>
                  {animal.avgMilk && animal.avgMilk > 0 && (
                    <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                      <FiDroplet />
                      <span className="font-semibold">{animal.avgMilk} L/day</span>
                    </div>
                  )}
                  {animal.lambsProduced && (
                    <div className="flex items-center gap-2 text-pink-600 bg-pink-50 px-3 py-2 rounded-lg">
                      <FiHeart />
                      <span className="font-semibold">{animal.lambsProduced} lambs produced</span>
                    </div>
                  )}
                  {animal.status === 'pregnant' && animal.dueDate && (
                    <div className="flex items-center gap-2 text-purple-600 bg-purple-50 px-3 py-2 rounded-lg">
                      <FiCalendar />
                      <span className="font-semibold">Due: {animal.dueDate}</span>
                    </div>
                  )}
                  {animal.status === 'ram' && (
                    <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg">
                      <FiActivity />
                      <span className="font-semibold">Breeding Ram</span>
                    </div>
                  )}
                  {animal.status === 'lamb' && (
                    <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                      <span className="font-semibold">Growing Lamb</span>
                    </div>
                  )}
                  <p className="mt-3 text-sm text-gray-500 line-clamp-2">{animal.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Animal Detail Modal */}
      {selectedAnimal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelectedAnimal(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="relative">
              <img src={selectedAnimal.image} alt={selectedAnimal.name} className="w-full h-56 md:h-64 object-cover" />
              <button onClick={() => setSelectedAnimal(null)} className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition">
                <FiX size={20} />
              </button>
              <div className="absolute bottom-3 left-3 flex gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${selectedAnimal.type === 'cow' ? 'bg-green-600' : 'bg-amber-600'}`}>
                  {selectedAnimal.type === 'cow' ? '🐄 Cow' : '🐑 Sheep'}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(selectedAnimal.status)}`}>
                  {selectedAnimal.status}
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{selectedAnimal.name}</h3>
                  <p className="text-gray-500">{selectedAnimal.tag} • {selectedAnimal.breed}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedAnimal.healthStatus === 'Excellent' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {selectedAnimal.healthStatus}
                </span>
              </div>

              <p className="text-gray-600 mb-6">{selectedAnimal.description}</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-gray-500 text-sm">Age</p>
                  <p className="font-bold text-lg text-gray-800">{selectedAnimal.age}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-gray-500 text-sm">Weight</p>
                  <p className="font-bold text-lg text-gray-800">{selectedAnimal.weight}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-gray-500 text-sm">Breed</p>
                  <p className="font-bold text-lg text-gray-800">{selectedAnimal.breed}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-gray-500 text-sm">Color</p>
                  <p className="font-bold text-lg text-gray-800">{selectedAnimal.color}</p>
                </div>

                {selectedAnimal.avgMilk && selectedAnimal.avgMilk > 0 && (
                  <div className="bg-blue-50 p-4 rounded-xl col-span-2">
                    <p className="text-blue-600 text-sm">Daily Milk Production</p>
                    <p className="font-bold text-2xl text-blue-800">{selectedAnimal.avgMilk} Liters/day</p>
                  </div>
                )}
                {selectedAnimal.lastCalving && (
                  <div className="bg-green-50 p-4 rounded-xl col-span-2">
                    <p className="text-green-600 text-sm">Last Calving Date</p>
                    <p className="font-bold text-lg text-green-800">{selectedAnimal.lastCalving}</p>
                  </div>
                )}
                {selectedAnimal.lambsProduced && (
                  <div className="bg-pink-50 p-4 rounded-xl col-span-2">
                    <p className="text-pink-600 text-sm">Total Lambs Produced</p>
                    <p className="font-bold text-2xl text-pink-800">{selectedAnimal.lambsProduced} lambs</p>
                  </div>
                )}
                {selectedAnimal.dueDate && (
                  <div className="bg-purple-50 p-4 rounded-xl col-span-2">
                    <p className="text-purple-600 text-sm">Expected Calving Date</p>
                    <p className="font-bold text-lg text-purple-800">{selectedAnimal.dueDate}</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedAnimal(null)}
                className="mt-6 w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Section */}
      <section id="products" className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">Our Products</h2>
            <p className="text-gray-600 md:text-lg">Fresh from our farm to your table</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {PRODUCTS.map((product, idx) => (
              <div key={idx} className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 text-center hover:shadow-lg transition group">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                  <product.icon className="text-green-600 mx-auto" />
                </div>
                <h3 className="font-bold text-gray-800 text-lg">{product.name}</h3>
                <p className="text-green-600 font-bold text-lg my-2">{product.price}</p>
                <p className="text-sm text-gray-500">{product.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Farm Layout with Image */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">Our Farm</h2>
            <p className="text-gray-600 md:text-lg">Chepalungu, Bomet County, Kenya</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="rounded-xl overflow-hidden shadow-lg">
              <img src="/images/cows/Richard 2_FIN.png" alt="Koimeret Farm" className="w-full h-64 md:h-80 object-cover" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-xl shadow text-center">
                <p className="text-3xl font-bold text-green-600">4,775 m²</p>
                <p className="text-gray-600">Total Area</p>
              </div>
              <div className="bg-white p-5 rounded-xl shadow text-center">
                <p className="text-3xl font-bold text-green-600">140 m²</p>
                <p className="text-gray-600">Cow Shed</p>
              </div>
              <div className="bg-white p-5 rounded-xl shadow text-center">
                <p className="text-3xl font-bold text-green-600">3,000 m²</p>
                <p className="text-gray-600">Fodder Field</p>
              </div>
              <div className="bg-white p-5 rounded-xl shadow text-center">
                <p className="text-3xl font-bold text-green-600">150 m²</p>
                <p className="text-gray-600">Water Pan</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Quality, Feed, Health */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <GiMilkCarton className="text-4xl text-blue-500 mx-auto mb-3" />
              <h3 className="font-bold text-gray-800">Quality Milk</h3>
              <p className="text-sm text-gray-500">Fresh daily delivery</p>
            </div>
            <div className="text-center p-6 bg-yellow-50 rounded-xl">
              <GiWheat className="text-4xl text-yellow-500 mx-auto mb-3" />
              <h3 className="font-bold text-gray-800">Quality Feed</h3>
              <p className="text-sm text-gray-500">Balanced nutrition</p>
            </div>
            <div className="text-center p-6 bg-red-50 rounded-xl">
              <FiHeart className="text-4xl text-red-500 mx-auto mb-3" />
              <h3 className="font-bold text-gray-800">Health Tracking</h3>
              <p className="text-sm text-gray-500">Regular checkups</p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-xl">
              <GiFarmTractor className="text-4xl text-green-500 mx-auto mb-3" />
              <h3 className="font-bold text-gray-800">Modern Farm</h3>
              <p className="text-sm text-gray-500">Best practices</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section id="contact" className="py-12 md:py-16 bg-green-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Order Fresh Milk & Meat</h2>
          <p className="text-green-100 text-lg mb-8">Call us for orders, bulk supply, or farm visits</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+254700000000" className="bg-white text-green-700 px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-green-50 transition text-lg">
              <FiPhone /> Call: 0700 000 000
            </a>
            <a href="https://wa.me/254700000000" className="bg-green-600 hover:bg-green-500 px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition text-lg">
              WhatsApp Order
            </a>
          </div>
        </div>
      </section>

      {/* Footer - Compact */}
      <footer className="bg-gray-900 text-gray-400 py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-sm">
          <div className="flex items-center gap-2 mb-3 md:mb-0">
            <GiCow className="text-xl text-green-500" />
            <span className="text-white font-medium">Koimeret Dairies</span>
            <span className="text-gray-500">• Chepalungu, Bomet</span>
          </div>
          <p>&copy; 2024 Koimeret Enterprise. Smart Dairy Farm.</p>
        </div>
      </footer>
    </div>
  );
}
