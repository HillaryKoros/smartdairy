'use client';

import { useEffect, useState } from 'react';
import { FiDroplet, FiDollarSign, FiAlertTriangle, FiCheckSquare, FiTrendingUp, FiTrendingDown, FiCalendar, FiActivity } from 'react-icons/fi';
import { GiCow, GiSheep, GiMeat } from 'react-icons/gi';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, StatCard } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { PageLoading, CardSkeleton } from '@/components/Loading';
import { formatCurrency, formatNumber } from '@/lib/utils';
import api from '@/lib/api';

interface DashboardData {
  kpis: {
    total_liters_today: number;
    liters_per_cow_today: number;
    avg_7day_liters_per_cow: number;
    sales_this_month: number;
    low_stock_items: number;
    vaccines_due_7days: number;
    active_withdrawals: number;
    tasks_missed_today: number;
    open_alerts: number;
  };
  cow_stats: Record<string, number>;
  farm: {
    name: string;
    total_cows: number;
    milking_cows: number;
  };
}

// Static yearly data for demonstration (will be replaced with API)
const YEARLY_STATS = {
  totalMilkYTD: 28450,
  totalSalesYTD: 1707000,
  sheepSoldYTD: 8,
  sheepRevenueYTD: 98000,
  avgDailyMilk: 78,
  healthEventsYTD: 12,
  healthResolved: 11,
  tasksCompletedYTD: 2190,
  feedCostYTD: 145000,
};

const MONTHLY_MILK = [
  { month: 'Jan', liters: 2180 },
  { month: 'Feb', liters: 2050 },
  { month: 'Mar', liters: 2320 },
  { month: 'Apr', liters: 2410 },
  { month: 'May', liters: 2580 },
  { month: 'Jun', liters: 2650 },
  { month: 'Jul', liters: 2720 },
  { month: 'Aug', liters: 2490 },
  { month: 'Sep', liters: 2380 },
  { month: 'Oct', liters: 2450 },
  { month: 'Nov', liters: 2320 },
  { month: 'Dec', liters: 2100 },
];

const MONTHLY_REVENUE = [
  { month: 'Jan', milk: 130800, livestock: 12000 },
  { month: 'Feb', milk: 123000, livestock: 0 },
  { month: 'Mar', milk: 139200, livestock: 18000 },
  { month: 'Apr', milk: 144600, livestock: 0 },
  { month: 'May', milk: 154800, livestock: 24000 },
  { month: 'Jun', milk: 159000, livestock: 15000 },
];

export default function OwnerDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await api.getOwnerDashboard();
      setData(response);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout role="owner"><PageLoading /></Layout>;
  if (error) return <Layout role="owner"><div className="text-red-500">Error: {error}</div></Layout>;
  if (!data) return null;

  const { kpis, cow_stats, farm } = data;
  const maxMilk = Math.max(...MONTHLY_MILK.map(m => m.liters));

  return (
    <Layout role="owner">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{farm.name}</h1>
            <p className="text-gray-500">Farm Dashboard - Yearly Overview</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FiCalendar />
            <span>{new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Today's Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Today's Milk"
            value={`${formatNumber(kpis.total_liters_today)} L`}
            subtitle={`${formatNumber(kpis.liters_per_cow_today)} L/cow`}
            icon={<FiDroplet className="text-2xl" />}
            color="blue"
          />
          <StatCard
            title="Monthly Sales"
            value={formatCurrency(kpis.sales_this_month)}
            icon={<FiDollarSign className="text-2xl" />}
            color="green"
          />
          <StatCard
            title="Total Herd"
            value={farm.total_cows}
            subtitle={`${farm.milking_cows} milking`}
            icon={<GiCow className="text-2xl" />}
            color="purple"
          />
          <StatCard
            title="Open Alerts"
            value={kpis.open_alerts}
            icon={<FiAlertTriangle className="text-2xl" />}
            color={kpis.open_alerts > 0 ? 'red' : 'green'}
          />
        </div>

        {/* Yearly Production Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiTrendingUp className="text-blue-500" /> Yearly Production Overview (2024)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">{formatNumber(YEARLY_STATS.totalMilkYTD)}</p>
                <p className="text-sm text-blue-700">Liters YTD</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">KES {formatNumber(YEARLY_STATS.totalSalesYTD)}</p>
                <p className="text-sm text-green-700">Milk Revenue YTD</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <p className="text-3xl font-bold text-amber-600">{YEARLY_STATS.sheepSoldYTD}</p>
                <p className="text-sm text-amber-700">Sheep Sold YTD</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-3xl font-bold text-purple-600">KES {formatNumber(YEARLY_STATS.sheepRevenueYTD)}</p>
                <p className="text-sm text-purple-700">Livestock Revenue</p>
              </div>
            </div>

            {/* Monthly Milk Production Chart */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-600 mb-3">Monthly Milk Production (Liters)</h4>
              <div className="flex items-end gap-1 h-32">
                {MONTHLY_MILK.map((month, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                      style={{ height: `${(month.liters / maxMilk) * 100}%` }}
                      title={`${month.month}: ${month.liters} L`}
                    />
                    <span className="text-xs text-gray-500 mt-1">{month.month.slice(0, 1)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts Section */}
        {(kpis.low_stock_items > 0 || kpis.active_withdrawals > 0 || kpis.vaccines_due_7days > 0 || kpis.tasks_missed_today > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <FiAlertTriangle /> Attention Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.low_stock_items > 0 && (
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800 font-medium">Low Stock Items</p>
                    <p className="text-2xl font-bold text-yellow-900">{kpis.low_stock_items}</p>
                  </div>
                )}
                {kpis.active_withdrawals > 0 && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-800 font-medium">Active Withdrawals</p>
                    <p className="text-2xl font-bold text-red-900">{kpis.active_withdrawals}</p>
                  </div>
                )}
                {kpis.vaccines_due_7days > 0 && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800 font-medium">Vaccines Due</p>
                    <p className="text-2xl font-bold text-blue-900">{kpis.vaccines_due_7days}</p>
                  </div>
                )}
                {kpis.tasks_missed_today > 0 && (
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-sm text-orange-800 font-medium">Missed Tasks</p>
                    <p className="text-2xl font-bold text-orange-900">{kpis.tasks_missed_today}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Two Column Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Herd Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GiCow className="text-primary-600" /> Herd Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(cow_stats).map(([status, count]) => (
                  <div key={status} className="text-center p-3 bg-gray-50 rounded-lg">
                    <Badge status={status} className="mb-2">{status}</Badge>
                    <p className="text-2xl font-bold text-gray-800">{count}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">7-Day Avg per Cow</span>
                  <span className="text-xl font-bold text-primary-600">{formatNumber(kpis.avg_7day_liters_per_cow)} L</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sheep Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GiSheep className="text-amber-600" /> Sheep & Livestock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-700">Total Flock</p>
                  <p className="text-3xl font-bold text-amber-800">6</p>
                  <p className="text-xs text-amber-600 mt-1">3 ewes, 1 ram, 2 lambs</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">YTD Sales</p>
                  <p className="text-3xl font-bold text-green-800">{YEARLY_STATS.sheepSoldYTD}</p>
                  <p className="text-xs text-green-600 mt-1">KES {formatNumber(YEARLY_STATS.sheepRevenueYTD)}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Recent Livestock Sales</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">June - 2 Lambs</span>
                    <span className="font-medium text-green-600">KES 24,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">March - 1 Ram</span>
                    <span className="font-medium text-green-600">KES 18,000</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Yearly Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiActivity className="text-purple-500" /> Yearly Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{formatNumber(YEARLY_STATS.avgDailyMilk)}</p>
                <p className="text-xs text-gray-500">Avg Daily Milk (L)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{YEARLY_STATS.healthEventsYTD}</p>
                <p className="text-xs text-gray-500">Health Events</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">{YEARLY_STATS.healthResolved}</p>
                <p className="text-xs text-gray-500">Resolved</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{formatNumber(YEARLY_STATS.tasksCompletedYTD)}</p>
                <p className="text-xs text-gray-500">Tasks Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">KES {formatNumber(YEARLY_STATS.feedCostYTD)}</p>
                <p className="text-xs text-gray-500">Feed Costs YTD</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">92%</p>
                <p className="text-xs text-gray-500">Task Completion</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 bg-primary-50 rounded-lg">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <FiTrendingUp className="text-2xl text-primary-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {formatNumber(kpis.avg_7day_liters_per_cow)} L
                  </p>
                  <p className="text-gray-500">7-day avg per cow per day</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FiCheckSquare className="text-2xl text-green-600" />
                </div>
                <div>
                  {kpis.tasks_missed_today === 0 ? (
                    <p className="text-green-600 font-medium">All tasks on track today</p>
                  ) : (
                    <p className="text-orange-600 font-medium">
                      {kpis.tasks_missed_today} task(s) need attention
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
