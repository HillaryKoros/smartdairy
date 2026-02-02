'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { GiSheep, GiMeat } from 'react-icons/gi';
import { FiPlus, FiDollarSign } from 'react-icons/fi';

// Static sheep data (will be replaced with API when backend supports sheep)
const SHEEP_DATA = [
  { id: 1, tag: 'KS001', name: 'Neema', breed: 'Dorper', status: 'ewe', age: '3 years', weight: '55 kg', healthStatus: 'Excellent', lambsProduced: 4 },
  { id: 2, tag: 'KS002', name: 'Tumaini', breed: 'Dorper', status: 'ewe', age: '2 years', weight: '48 kg', healthStatus: 'Good', lambsProduced: 2 },
  { id: 3, tag: 'KS003', name: 'Faraja', breed: 'Dorper', status: 'ewe', age: '4 years', weight: '52 kg', healthStatus: 'Excellent', lambsProduced: 6 },
  { id: 4, tag: 'KS004', name: 'Simba', breed: 'Dorper', status: 'ram', age: '3 years', weight: '75 kg', healthStatus: 'Excellent' },
  { id: 5, tag: 'KS005', name: 'Kidogo', breed: 'Dorper', status: 'lamb', age: '4 months', weight: '18 kg', healthStatus: 'Good' },
  { id: 6, tag: 'KS006', name: 'Mdogo', breed: 'Dorper', status: 'lamb', age: '3 months', weight: '15 kg', healthStatus: 'Good' },
];

const SALES_HISTORY = [
  { date: '2024-06', count: 2, type: 'Lambs', revenue: 24000 },
  { date: '2024-03', count: 1, type: 'Ram', revenue: 18000 },
  { date: '2023-12', count: 3, type: 'Ewes', revenue: 36000 },
  { date: '2023-09', count: 2, type: 'Lambs', revenue: 20000 },
];

const PRICING = [
  { type: 'Mature Ewes', price: 'KES 12,000 - 15,000' },
  { type: 'Breeding Ram', price: 'KES 18,000 - 25,000' },
  { type: 'Lambs (3-6 months)', price: 'KES 8,000 - 12,000' },
  { type: 'Mutton (per kg)', price: 'KES 600/kg' },
];

export default function SheepPage() {
  const [selectedSheep, setSelectedSheep] = useState<typeof SHEEP_DATA[0] | null>(null);

  const stats = {
    total: SHEEP_DATA.length,
    ewes: SHEEP_DATA.filter(s => s.status === 'ewe').length,
    rams: SHEEP_DATA.filter(s => s.status === 'ram').length,
    lambs: SHEEP_DATA.filter(s => s.status === 'lamb').length,
    totalSold: SALES_HISTORY.reduce((sum, s) => sum + s.count, 0),
    totalRevenue: SALES_HISTORY.reduce((sum, s) => sum + s.revenue, 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ewe': return 'bg-pink-100 text-pink-700';
      case 'ram': return 'bg-indigo-100 text-indigo-700';
      case 'lamb': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Layout role="owner">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <GiSheep className="text-amber-600" /> Sheep Management
            </h1>
            <p className="text-gray-500">{stats.total} total sheep</p>
          </div>
          <button className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700">
            <FiPlus /> Add Sheep
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{stats.ewes}</p>
                <p className="text-sm text-gray-500">Ewes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">{stats.rams}</p>
                <p className="text-sm text-gray-500">Rams</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{stats.lambs}</p>
                <p className="text-sm text-gray-500">Lambs</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.totalSold}</p>
                <p className="text-sm text-gray-500">Sold (YTD)</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sheep Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Flock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {SHEEP_DATA.map((sheep) => (
                <div
                  key={sheep.id}
                  onClick={() => setSelectedSheep(sheep)}
                  className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <GiSheep className="text-amber-600 text-xl" />
                    </div>
                    <div>
                      <p className="font-bold">{sheep.tag}</p>
                      <p className="text-sm text-gray-500">{sheep.name}</p>
                    </div>
                    <span className={`ml-auto px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sheep.status)}`}>
                      {sheep.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Breed: {sheep.breed}</p>
                  <p className="text-sm text-gray-600">Weight: {sheep.weight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sales & Pricing */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GiMeat className="text-red-500" /> Sales History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {SALES_HISTORY.map((sale, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{sale.count} {sale.type}</p>
                      <p className="text-sm text-gray-500">{sale.date}</p>
                    </div>
                    <p className="text-green-600 font-semibold">KES {sale.revenue.toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between font-bold">
                  <span>Total Revenue</span>
                  <span className="text-green-600">KES {stats.totalRevenue.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FiDollarSign className="text-green-500" /> Current Pricing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {PRICING.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span>{item.type}</span>
                    <span className="font-semibold text-green-700">{item.price}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sheep Detail Modal */}
        {selectedSheep && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedSheep(null)}>
            <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                  <GiSheep className="text-amber-600 text-3xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedSheep.name}</h3>
                  <p className="text-gray-500">{selectedSheep.tag} • {selectedSheep.breed}</p>
                </div>
                <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedSheep.status)}`}>
                  {selectedSheep.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="font-semibold">{selectedSheep.age}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Weight</p>
                  <p className="font-semibold">{selectedSheep.weight}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Health</p>
                  <p className="font-semibold">{selectedSheep.healthStatus}</p>
                </div>
                {selectedSheep.lambsProduced && (
                  <div className="bg-pink-50 p-3 rounded-lg">
                    <p className="text-sm text-pink-600">Lambs Produced</p>
                    <p className="font-semibold text-pink-800">{selectedSheep.lambsProduced}</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedSheep(null)}
                className="mt-6 w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
