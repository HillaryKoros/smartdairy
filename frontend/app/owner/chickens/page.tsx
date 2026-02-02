'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card';
import { GiChicken, GiNestEggs } from 'react-icons/gi';
import { FiPlus, FiDollarSign, FiTrendingUp } from 'react-icons/fi';

// Static chicken data (will be replaced with API when backend supports chickens)
const CHICKEN_DATA = [
  { id: 1, tag: 'KC001', name: 'Jogoo', breed: 'Kienyeji', status: 'cockerel', age: '1 year', weight: '3.5 kg', healthStatus: 'Excellent', eggsPerWeek: 0 },
  { id: 2, tag: 'KC002', name: 'Koikoi', breed: 'Kienyeji', status: 'cockerel', age: '10 months', weight: '3.2 kg', healthStatus: 'Good', eggsPerWeek: 0 },
  { id: 3, tag: 'KC003', name: 'Mama Yai', breed: 'Kienyeji', status: 'layer', age: '1.5 years', weight: '2.5 kg', healthStatus: 'Excellent', eggsPerWeek: 5 },
  { id: 4, tag: 'KC004', name: 'Njano', breed: 'Kienyeji', status: 'layer', age: '1 year', weight: '2.3 kg', healthStatus: 'Good', eggsPerWeek: 4 },
  { id: 5, tag: 'KC005', name: 'Kuku Mama', breed: 'Kienyeji', status: 'layer', age: '2 years', weight: '2.8 kg', healthStatus: 'Excellent', eggsPerWeek: 4 },
  { id: 6, tag: 'KC006', name: 'Cheusi', breed: 'Kienyeji', status: 'layer', age: '1.5 years', weight: '2.4 kg', healthStatus: 'Good', eggsPerWeek: 5 },
  { id: 7, tag: 'KC007', name: 'Kifaranga 1', breed: 'Kienyeji', status: 'chick', age: '6 weeks', weight: '0.3 kg', healthStatus: 'Good', eggsPerWeek: 0 },
  { id: 8, tag: 'KC008', name: 'Kifaranga 2', breed: 'Kienyeji', status: 'chick', age: '6 weeks', weight: '0.3 kg', healthStatus: 'Good', eggsPerWeek: 0 },
  { id: 9, tag: 'KC009', name: 'Kifaranga 3', breed: 'Kienyeji', status: 'chick', age: '4 weeks', weight: '0.2 kg', healthStatus: 'Good', eggsPerWeek: 0 },
  { id: 10, tag: 'KC010', name: 'Kifaranga 4', breed: 'Kienyeji', status: 'chick', age: '5 weeks', weight: '0.25 kg', healthStatus: 'Good', eggsPerWeek: 0 },
];

const SALES_HISTORY = [
  { date: '2024-06', count: 5, type: 'Layers', revenue: 5000 },
  { date: '2024-05', count: 10, type: 'Chicks', revenue: 3000 },
  { date: '2024-04', count: 3, type: 'Cockerels', revenue: 3600 },
  { date: '2024-03', count: 8, type: 'Layers', revenue: 8000 },
  { date: '2024-02', count: 15, type: 'Chicks', revenue: 4500 },
  { date: '2024-01', count: 2, type: 'Cockerels', revenue: 2400 },
];

const EGG_PRODUCTION = [
  { month: 'Jan', eggs: 85 },
  { month: 'Feb', eggs: 92 },
  { month: 'Mar', eggs: 88 },
  { month: 'Apr', eggs: 95 },
  { month: 'May', eggs: 102 },
  { month: 'Jun', eggs: 98 },
];

const PRICING = [
  { type: 'Kienyeji Cockerel', price: 'KES 1,000 - 1,500' },
  { type: 'Kienyeji Layer', price: 'KES 800 - 1,200' },
  { type: 'Chicks (4-8 weeks)', price: 'KES 250 - 400' },
  { type: 'Eggs (per tray - 30)', price: 'KES 450' },
  { type: 'Eggs (single)', price: 'KES 15' },
];

const YEARLY_STATS = {
  totalEggsYTD: 560,
  eggRevenueYTD: 8400,
  chickensSoldYTD: 43,
  chickenRevenueYTD: 26500,
  hatchRate: 78,
  mortalityRate: 5,
};

export default function ChickensPage() {
  const [selectedChicken, setSelectedChicken] = useState<typeof CHICKEN_DATA[0] | null>(null);

  const stats = {
    total: CHICKEN_DATA.length,
    cockerels: CHICKEN_DATA.filter(c => c.status === 'cockerel').length,
    layers: CHICKEN_DATA.filter(c => c.status === 'layer').length,
    chicks: CHICKEN_DATA.filter(c => c.status === 'chick').length,
    weeklyEggs: CHICKEN_DATA.reduce((sum, c) => sum + c.eggsPerWeek, 0),
    totalSold: SALES_HISTORY.reduce((sum, s) => sum + s.count, 0),
    totalRevenue: SALES_HISTORY.reduce((sum, s) => sum + s.revenue, 0),
  };

  const maxEggs = Math.max(...EGG_PRODUCTION.map(m => m.eggs));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'cockerel': return 'bg-red-100 text-red-700';
      case 'layer': return 'bg-yellow-100 text-yellow-700';
      case 'chick': return 'bg-amber-100 text-amber-700';
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
              <GiChicken className="text-red-600" /> Chicken Management
            </h1>
            <p className="text-gray-500">{stats.total} total chickens • {stats.weeklyEggs} eggs/week</p>
          </div>
          <button className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
            <FiPlus /> Add Chicken
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{stats.cockerels}</p>
                <p className="text-sm text-gray-500">Cockerels</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{stats.layers}</p>
                <p className="text-sm text-gray-500">Layers</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{stats.chicks}</p>
                <p className="text-sm text-gray-500">Chicks</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.weeklyEggs}</p>
                <p className="text-sm text-gray-500">Eggs/Week</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.totalSold}</p>
                <p className="text-sm text-gray-500">Sold (YTD)</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Yearly Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiTrendingUp className="text-green-500" /> Yearly Overview (2024)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{YEARLY_STATS.totalEggsYTD}</p>
                <p className="text-xs text-yellow-700">Eggs YTD</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">KES {YEARLY_STATS.eggRevenueYTD.toLocaleString()}</p>
                <p className="text-xs text-green-700">Egg Revenue</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{YEARLY_STATS.chickensSoldYTD}</p>
                <p className="text-xs text-red-700">Chickens Sold</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">KES {YEARLY_STATS.chickenRevenueYTD.toLocaleString()}</p>
                <p className="text-xs text-blue-700">Chicken Revenue</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{YEARLY_STATS.hatchRate}%</p>
                <p className="text-xs text-purple-700">Hatch Rate</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-600">{YEARLY_STATS.mortalityRate}%</p>
                <p className="text-xs text-gray-700">Mortality</p>
              </div>
            </div>

            {/* Monthly Egg Production Chart */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-600 mb-3">Monthly Egg Production</h4>
              <div className="flex items-end gap-2 h-32">
                {EGG_PRODUCTION.map((month, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-yellow-500 rounded-t hover:bg-yellow-600 transition-colors"
                      style={{ height: `${(month.eggs / maxEggs) * 100}%` }}
                      title={`${month.month}: ${month.eggs} eggs`}
                    />
                    <span className="text-xs text-gray-500 mt-1">{month.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chicken Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Flock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {CHICKEN_DATA.map((chicken) => (
                <div
                  key={chicken.id}
                  onClick={() => setSelectedChicken(chicken)}
                  className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <GiChicken className="text-red-600 text-xl" />
                    </div>
                    <div>
                      <p className="font-bold">{chicken.tag}</p>
                      <p className="text-sm text-gray-500">{chicken.name}</p>
                    </div>
                  </div>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(chicken.status)}`}>
                    {chicken.status}
                  </span>
                  {chicken.eggsPerWeek > 0 && (
                    <p className="text-sm text-yellow-600 mt-2">🥚 {chicken.eggsPerWeek} eggs/week</p>
                  )}
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
                <FiDollarSign className="text-green-500" /> Sales History
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
                  <span>Total Revenue (YTD)</span>
                  <span className="text-green-600">KES {stats.totalRevenue.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GiNestEggs className="text-yellow-500" /> Current Pricing
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

        {/* Chicken Detail Modal */}
        {selectedChicken && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedChicken(null)}>
            <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <GiChicken className="text-red-600 text-3xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedChicken.name}</h3>
                  <p className="text-gray-500">{selectedChicken.tag} • {selectedChicken.breed}</p>
                </div>
                <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedChicken.status)}`}>
                  {selectedChicken.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="font-semibold">{selectedChicken.age}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Weight</p>
                  <p className="font-semibold">{selectedChicken.weight}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Health</p>
                  <p className="font-semibold">{selectedChicken.healthStatus}</p>
                </div>
                {selectedChicken.eggsPerWeek > 0 && (
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-sm text-yellow-600">Eggs/Week</p>
                    <p className="font-semibold text-yellow-800">{selectedChicken.eggsPerWeek}</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedChicken(null)}
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
