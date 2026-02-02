'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiCheckCircle, FiCircle, FiDroplet, FiPackage, FiHeart, FiClock } from 'react-icons/fi';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, StatCard } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { PageLoading } from '@/components/Loading';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface WorkerDashboardData {
  kpis: {
    tasks_done: number;
    tasks_total: number;
    tasks_progress: string;
    milk_sessions_logged: number;
    feed_entries_today: number;
  };
  today_tasks: Array<{
    id: number;
    name: string;
    status: string;
    due_time: string | null;
  }>;
}

export default function WorkerDashboard() {
  const [data, setData] = useState<WorkerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<number | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await api.getWorkerDashboard();
      setData(response);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: number) => {
    setCompleting(taskId);
    try {
      await api.completeTask(taskId);
      toast.success('Task completed!');
      loadDashboard();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCompleting(null);
    }
  };

  if (loading) return <Layout role="worker"><PageLoading /></Layout>;
  if (!data) return null;

  const { kpis, today_tasks } = data;
  const progressPercent = kpis.tasks_total > 0 ? (kpis.tasks_done / kpis.tasks_total) * 100 : 0;

  return (
    <Layout role="worker">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Good day!</h1>
          <p className="text-gray-500">Here's your work for today</p>
        </div>

        {/* Progress Card */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Today's Progress</span>
              <span className="text-sm text-gray-500">{kpis.tasks_progress}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-primary-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {kpis.tasks_done} of {kpis.tasks_total} tasks completed
            </p>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            title="Milk Sessions"
            value={kpis.milk_sessions_logged}
            subtitle="logged today"
            icon={<FiDroplet className="text-xl" />}
            color="blue"
          />
          <StatCard
            title="Feed Entries"
            value={kpis.feed_entries_today}
            subtitle="recorded"
            icon={<FiPackage className="text-xl" />}
            color="green"
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/worker/milk">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <FiDroplet className="text-blue-500" />
                  Log Milk
                </Button>
              </Link>
              <Link href="/worker/feeds">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <FiPackage className="text-green-500" />
                  Log Feed
                </Button>
              </Link>
              <Link href="/worker/health">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <FiHeart className="text-red-500" />
                  Health Event
                </Button>
              </Link>
              <Link href="/worker/tasks">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <FiCheckCircle className="text-purple-500" />
                  All Tasks
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Today's Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Today's Tasks</CardTitle>
            <Link href="/worker/tasks" className="text-sm text-primary-600 hover:text-primary-700">
              View All
            </Link>
          </CardHeader>
          <CardContent>
            {today_tasks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No tasks for today</p>
            ) : (
              <div className="space-y-3">
                {today_tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {task.status === 'done' ? (
                        <FiCheckCircle className="text-green-500 text-xl" />
                      ) : (
                        <FiCircle className="text-gray-400 text-xl" />
                      )}
                      <div>
                        <p className={`font-medium ${task.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                          {task.name}
                        </p>
                        {task.due_time && (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <FiClock className="text-xs" />
                            {task.due_time}
                          </p>
                        )}
                      </div>
                    </div>
                    {task.status !== 'done' && (
                      <Button
                        size="sm"
                        onClick={() => handleCompleteTask(task.id)}
                        isLoading={completing === task.id}
                      >
                        Done
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
