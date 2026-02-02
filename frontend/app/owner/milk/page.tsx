'use client';

import { useEffect, useState } from 'react';
import { FiDroplet, FiTrendingUp, FiCalendar, FiDownload } from 'react-icons/fi';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { Select } from '@/components/Input';
import { Button } from '@/components/Button';
import { PageLoading } from '@/components/Loading';
import { formatNumber, formatDate } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface MilkSummary {
  date: string;
  total_liters: number;
  morning_liters: number;
  evening_liters: number;
  cows_milked: number;
  average_per_cow: number;
}

interface TopProducer {
  cow_tag: string;
  cow_name: string;
  total_liters: number;
  avg_liters: number;
}

export default function MilkProductionPage() {
  const [summaries, setSummaries] = useState<MilkSummary[]>([]);
  const [topProducers, setTopProducers] = useState<TopProducer[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [summaryRes, producersRes] = await Promise.all([
        api.getMilkSummary({ period }),
        api.getTopProducers({ period }),
      ]);
      setSummaries(summaryRes.results || summaryRes || []);
      setTopProducers(producersRes.results || producersRes || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalProduction = summaries.reduce((sum, s) => sum + s.total_liters, 0);
  const avgDaily = summaries.length > 0 ? totalProduction / summaries.length : 0;

  if (loading) return <Layout role="owner"><PageLoading /></Layout>;

  return (
    <Layout role="owner">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Milk Production</h1>
            <p className="text-gray-500">Production analytics and trends</p>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              options={[
                { value: 'week', label: 'Last 7 Days' },
                { value: 'month', label: 'Last 30 Days' },
                { value: 'quarter', label: 'Last 90 Days' },
              ]}
              className="w-40"
            />
            <Button variant="outline">
              <FiDownload className="mr-2" /> Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiDroplet className="text-2xl text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Production</p>
                  <p className="text-2xl font-bold text-gray-800">{formatNumber(totalProduction)} L</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FiTrendingUp className="text-2xl text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Daily Average</p>
                  <p className="text-2xl font-bold text-gray-800">{formatNumber(avgDaily)} L</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FiCalendar className="text-2xl text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Days Recorded</p>
                  <p className="text-2xl font-bold text-gray-800">{summaries.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <FiDroplet className="text-2xl text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Avg per Cow</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {summaries.length > 0
                      ? formatNumber(summaries.reduce((sum, s) => sum + s.average_per_cow, 0) / summaries.length)
                      : 0} L
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Production Table */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Production</CardTitle>
            </CardHeader>
            <CardContent>
              {summaries.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No production data available</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Date</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">Morning</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">Evening</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">Total</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">Cows</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summaries.slice(0, 10).map((summary, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="py-3 px-2 text-sm text-gray-800">{formatDate(summary.date)}</td>
                          <td className="py-3 px-2 text-sm text-right text-gray-600">{formatNumber(summary.morning_liters)} L</td>
                          <td className="py-3 px-2 text-sm text-right text-gray-600">{formatNumber(summary.evening_liters)} L</td>
                          <td className="py-3 px-2 text-sm text-right font-medium text-gray-800">{formatNumber(summary.total_liters)} L</td>
                          <td className="py-3 px-2 text-sm text-right text-gray-600">{summary.cows_milked}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Producers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Producers</CardTitle>
            </CardHeader>
            <CardContent>
              {topProducers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No data available</p>
              ) : (
                <div className="space-y-3">
                  {topProducers.slice(0, 10).map((producer, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-amber-600' : 'bg-gray-300'
                        }`}>
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{producer.cow_tag}</p>
                          {producer.cow_name && <p className="text-sm text-gray-500">{producer.cow_name}</p>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary-600">{formatNumber(producer.total_liters)} L</p>
                        <p className="text-sm text-gray-500">avg {formatNumber(producer.avg_liters)} L/day</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
