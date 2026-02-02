'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GiCow, GiFarmTractor, GiMilkCarton, GiWheat, GiMeat } from 'react-icons/gi';
import { FiDroplet, FiHeart, FiPhone, FiShoppingCart, FiX, FiMenu } from 'react-icons/fi';

// Animal data with detailed characteristics
const SHOWCASE_ANIMALS = [
  // Cows (3): 2 milking, 1 pregnant
  { id: 1, tag: 'KD001', name: 'Malkia', breed: 'Friesian', type: 'cow', status: 'milking', image: '/images/cows/IMG-20240527-WA0009.jpg', avgMilk: 18.5, age: '4 years', weight: '450 kg', lastCalving: '2024-01-15', healthStatus: 'Excellent' },
  { id: 2, tag: 'KD002', name: 'Zawadi', breed: 'Holstein', type: 'cow', status: 'milking', image: '/images/cows/istockphoto-1072682504-612x612.jpg', avgMilk: 16.2, age: '3 years', weight: '420 kg', lastCalving: '2024-03-20', healthStatus: 'Good' },
  { id: 3, tag: 'KD003', name: 'Baraka', breed: 'Ayrshire', type: 'cow', status: 'pregnant', image: '/images/cows/cow_calf_field-900x450.jpg', avgMilk: 0, age: '5 years', weight: '480 kg', dueDate: '2024-08-10', healthStatus: 'Excellent' },
  // Sheep (6): 3 ewes (mothers), 1 ram, 2 lambs
  { id: 4, tag: 'KS001', name: 'Neema', breed: 'Dorper', type: 'sheep', status: 'ewe', image: '/images/sheeps/GBZAMN3XwAA0jB-.jpg', age: '3 years', weight: '55 kg', lambsProduced: 4, healthStatus: 'Excellent' },
  { id: 5, tag: 'KS002', name: 'Tumaini', breed: 'Dorper', type: 'sheep', status: 'ewe', image: '/images/sheeps/images.jpeg', age: '2 years', weight: '48 kg', lambsProduced: 2, healthStatus: 'Good' },
  { id: 6, tag: 'KS003', name: 'Faraja', breed: 'Dorper', type: 'sheep', status: 'ewe', image: '/images/sheeps/images (1).jpeg', age: '4 years', weight: '52 kg', lambsProduced: 6, healthStatus: 'Excellent' },
  { id: 7, tag: 'KS004', name: 'Simba', breed: 'Dorper', type: 'sheep', status: 'ram', image: '/images/sheeps/images2.jpeg', age: '3 years', weight: '75 kg', healthStatus: 'Excellent' },
  { id: 8, tag: 'KS005', name: 'Kidogo', breed: 'Dorper', type: 'sheep', status: 'lamb', image: '/images/sheeps/images (2).jpeg', age: '4 months', weight: '18 kg', healthStatus: 'Good' },
  { id: 9, tag: 'KS006', name: 'Mdogo', breed: 'Dorper', type: 'sheep', status: 'lamb', image: '/images/sheeps/images (3).jpeg', age: '3 months', weight: '15 kg', healthStatus: 'Good' },
];

// Sales history for sheep
const SHEEP_SALES_HISTORY = [
  { date: '2024-06', count: 2, type: 'Lambs', revenue: 24000 },
  { date: '2024-03', count: 1, type: 'Ram', revenue: 18000 },
  { date: '2023-12', count: 3, type: 'Ewes', revenue: 36000 },
  { date: '2023-09', count: 2, type: 'Lambs', revenue: 20000 },
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
  { name: 'Live Sheep', price: 'From KES 8,000', icon: () => <span className="text-4xl">🐑</span>, description: 'Healthy Dorper sheep for breeding or meat' },
  { name: 'Dairy Calves', price: 'From KES 25,000', icon: GiCow, description: 'Quality dairy breed calves' },
];

export default function PublicShowcase() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedAnimal, setSelectedAnimal] = useState<typeof SHOWCASE_ANIMALS[0] | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const farmImages = [
    '/images/cows/IMG-20240527-WA0009.jpg',
    '/images/cows/Richard 2_FIN.png',
    '/images/sheeps/GBZAMN3XwAA0jB-.jpg',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % farmImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
        className="relative h-[60vh] md:h-[70vh] flex items-center justify-center pt-14"
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
              View Our Herd
            </a>
          </div>
        </div>
      </section>

      {/* Our Herd Section */}
      <section id="herd" className="py-12 md:py-16 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Our Herd</h2>
            <p className="text-gray-600 text-sm md:text-base">Click on any animal to view details</p>
          </div>

          {/* Animals Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
            {SHOWCASE_ANIMALS.map((animal) => (
              <div
                key={animal.id}
                onClick={() => setSelectedAnimal(animal)}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1"
              >
                <div className="h-24 md:h-32 overflow-hidden relative">
                  <img src={animal.image} alt={animal.name} className="w-full h-full object-cover" />
                  <div className="absolute top-1 right-1">
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] md:text-xs font-medium ${
                      animal.status === 'milking' ? 'bg-green-500 text-white' :
                      animal.status === 'pregnant' ? 'bg-blue-500 text-white' :
                      animal.status === 'ewe' ? 'bg-pink-500 text-white' :
                      animal.status === 'ram' ? 'bg-indigo-600 text-white' :
                      animal.status === 'lamb' ? 'bg-orange-400 text-white' :
                      'bg-gray-500 text-white'
                    }`}>
                      {animal.status}
                    </span>
                  </div>
                </div>
                <div className="p-2">
                  <p className="font-bold text-xs md:text-sm text-gray-800">{animal.tag}</p>
                  <p className="text-gray-500 text-[10px] md:text-xs">{animal.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Animal Detail Modal */}
      {selectedAnimal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedAnimal(null)}>
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="relative">
              <img src={selectedAnimal.image} alt={selectedAnimal.name} className="w-full h-48 object-cover" />
              <button onClick={() => setSelectedAnimal(null)} className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full">
                <FiX />
              </button>
              <div className="absolute bottom-2 left-2 flex gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedAnimal.type === 'cow' ? 'bg-green-600' : 'bg-amber-600'} text-white`}>
                  {selectedAnimal.type === 'cow' ? '🐄 Cow' : '🐑 Sheep'}
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedAnimal.name}</h3>
                  <p className="text-gray-500">{selectedAnimal.tag} • {selectedAnimal.breed}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedAnimal.healthStatus === 'Excellent' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {selectedAnimal.healthStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-500">Age</p>
                  <p className="font-semibold">{selectedAnimal.age}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-500">Weight</p>
                  <p className="font-semibold">{selectedAnimal.weight}</p>
                </div>
                {selectedAnimal.avgMilk && selectedAnimal.avgMilk > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg col-span-2">
                    <p className="text-blue-600">Daily Milk Production</p>
                    <p className="font-semibold text-blue-800">{selectedAnimal.avgMilk} Liters/day</p>
                  </div>
                )}
                {selectedAnimal.lambsProduced && (
                  <div className="bg-pink-50 p-3 rounded-lg col-span-2">
                    <p className="text-pink-600">Lambs Produced</p>
                    <p className="font-semibold text-pink-800">{selectedAnimal.lambsProduced} lambs</p>
                  </div>
                )}
                {selectedAnimal.dueDate && (
                  <div className="bg-blue-50 p-3 rounded-lg col-span-2">
                    <p className="text-blue-600">Expected Calving</p>
                    <p className="font-semibold text-blue-800">{selectedAnimal.dueDate}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sheep Sales History */}
      <section className="py-12 bg-amber-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Sheep & Meat Sales</h2>
            <p className="text-gray-600 text-sm">Quality Dorper sheep available for purchase</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <GiMeat className="text-red-500" /> Recent Sales
              </h3>
              <div className="space-y-3">
                {SHEEP_SALES_HISTORY.map((sale, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{sale.count} {sale.type}</p>
                      <p className="text-sm text-gray-500">{sale.date}</p>
                    </div>
                    <p className="text-green-600 font-semibold">KES {sale.revenue.toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-gray-500">Total sold: {FARM_STATS.sheepSold} sheep</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow">
              <h3 className="font-bold text-lg mb-4">Available Now</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span>Mature Ewes</span>
                  <span className="font-semibold text-green-700">KES 12,000 - 15,000</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span>Breeding Ram</span>
                  <span className="font-semibold text-green-700">KES 18,000 - 25,000</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span>Lambs (3-6 months)</span>
                  <span className="font-semibold text-green-700">KES 8,000 - 12,000</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span>Mutton (per kg)</span>
                  <span className="font-semibold text-red-700">KES 600/kg</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Our Products</h2>
            <p className="text-gray-600 text-sm">Fresh from our farm to your table</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PRODUCTS.map((product, idx) => (
              <div key={idx} className="bg-green-50 rounded-xl p-4 text-center hover:shadow-lg transition">
                <product.icon className="text-4xl text-green-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800">{product.name}</h3>
                <p className="text-green-600 font-semibold text-sm">{product.price}</p>
                <p className="text-xs text-gray-500 mt-1">{product.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Farm Layout with Image */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Our Farm</h2>
            <p className="text-gray-600 text-sm">Chepalungu, Bomet County, Kenya</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="rounded-xl overflow-hidden shadow-lg">
              <img src="/images/cows/Richard 2_FIN.png" alt="Koimeret Farm" className="w-full h-64 md:h-80 object-cover" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow text-center">
                <p className="text-2xl font-bold text-green-600">4,775 m²</p>
                <p className="text-sm text-gray-600">Total Area</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow text-center">
                <p className="text-2xl font-bold text-green-600">140 m²</p>
                <p className="text-sm text-gray-600">Cow Shed</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow text-center">
                <p className="text-2xl font-bold text-green-600">3,000 m²</p>
                <p className="text-sm text-gray-600">Fodder Field</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow text-center">
                <p className="text-2xl font-bold text-green-600">150 m²</p>
                <p className="text-sm text-gray-600">Water Pan</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Quality, Feed, Health */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4">
              <GiMilkCarton className="text-3xl text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm text-gray-800">Quality Milk</h3>
              <p className="text-xs text-gray-500">Fresh daily</p>
            </div>
            <div className="text-center p-4">
              <GiWheat className="text-3xl text-yellow-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm text-gray-800">Quality Feed</h3>
              <p className="text-xs text-gray-500">Balanced nutrition</p>
            </div>
            <div className="text-center p-4">
              <FiHeart className="text-3xl text-red-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm text-gray-800">Health Tracking</h3>
              <p className="text-xs text-gray-500">Regular checkups</p>
            </div>
            <div className="text-center p-4">
              <GiFarmTractor className="text-3xl text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm text-gray-800">Modern Farm</h3>
              <p className="text-xs text-gray-500">Best practices</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section id="contact" className="py-12 bg-green-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Order Fresh Milk & Meat</h2>
          <p className="text-green-100 mb-6">Call us for orders, bulk supply, or farm visits</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+254700000000" className="bg-white text-green-700 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-green-50">
              <FiPhone /> Call: 0700 000 000
            </a>
            <a href="https://wa.me/254700000000" className="bg-green-600 hover:bg-green-500 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
              WhatsApp Order
            </a>
          </div>
        </div>
      </section>

      {/* Footer - Compact */}
      <footer className="bg-gray-900 text-gray-400 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-xs">
          <div className="flex items-center gap-2 mb-2 md:mb-0">
            <GiCow className="text-lg text-green-500" />
            <span className="text-white font-medium">Koimeret Dairies</span>
            <span className="text-gray-500">• Chepalungu, Bomet</span>
          </div>
          <p>&copy; 2024 Koimeret Enterprise. Smart Dairy Farm.</p>
        </div>
      </footer>
    </div>
  );
}
