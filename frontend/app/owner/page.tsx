'use client';

import { useEffect, useState } from 'react';
import { FiDroplet, FiDollarSign, FiAlertTriangle, FiCheckSquare, FiTrendingUp } from 'react-icons/fi';
import { GiCow } from 'react-icons/gi';
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

  return (
    <Layout role="owner">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{farm.name}</h1>
          <p className="text-gray-500">Dashboard Overview</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Today's Production"
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
            title="Total Cows"
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

        {/* Alerts Section */}
        {(kpis.low_stock_items > 0 || kpis.active_withdrawals > 0 || kpis.vaccines_due_7days > 0 || kpis.tasks_missed_today > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Attention Required</CardTitle>
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

        {/* Cow Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Herd Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 lg:grid-cols-7 gap-3">
              {Object.entries(cow_stats).map(([status, count]) => (
                <div
                  key={status}
                  className="text-center p-3 bg-gray-50 rounded-lg"
                >
                  <Badge status={status} className="mb-2">
                    {status}
                  </Badge>
                  <p className="text-2xl font-bold text-gray-800">{count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>7-Day Average</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="p-4 bg-primary-50 rounded-lg">
                  <FiTrendingUp className="text-3xl text-primary-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-800">
                    {formatNumber(kpis.avg_7day_liters_per_cow)} L
                  </p>
                  <p className="text-gray-500">per cow per day</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tasks Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <FiCheckSquare className="text-3xl text-green-600" />
                </div>
                <div>
                  <p className="text-gray-500">
                    {kpis.tasks_missed_today === 0 ? (
                      <span className="text-green-600 font-medium">All tasks on track</span>
                    ) : (
                      <span className="text-orange-600 font-medium">
                        {kpis.tasks_missed_today} task(s) need attention
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
