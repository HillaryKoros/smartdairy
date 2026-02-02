'use client';

import { useEffect, useState } from 'react';
import { FiCheckCircle, FiCircle, FiClock, FiSkipForward } from 'react-icons/fi';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { PageLoading } from '@/components/Loading';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Task {
  id: number;
  name: string;
  description: string;
  status: string;
  status_display: string;
  due_time: string | null;
  priority: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<number | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await api.getTodayTasks();
      setTasks(response.results || response);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (taskId: number) => {
    setCompleting(taskId);
    try {
      await api.completeTask(taskId);
      toast.success('Task completed!');
      loadTasks();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCompleting(null);
    }
  };

  const handleSkip = async (taskId: number) => {
    try {
      await api.skipTask(taskId);
      toast.success('Task skipped');
      loadTasks();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'done');
  const skippedTasks = tasks.filter(t => t.status === 'skipped');

  if (loading) return <Layout role="worker"><PageLoading /></Layout>;

  return (
    <Layout role="worker">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Today's Tasks</h1>
          <p className="text-gray-500">
            {completedTasks.length} of {tasks.length} completed
          </p>
        </div>

        {/* Progress */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${tasks.length ? (completedTasks.length / tasks.length) * 100 : 0}%` }}
          />
        </div>

        {/* Pending Tasks */}
        {pendingTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FiCircle className="text-yellow-500" />
                Pending ({pendingTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-100"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-800">{task.name}</h3>
                        {task.priority === 'high' && (
                          <Badge variant="danger">High Priority</Badge>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                      )}
                      {task.due_time && (
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <FiClock /> Due: {task.due_time}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSkip(task.id)}
                      >
                        <FiSkipForward />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleComplete(task.id)}
                        isLoading={completing === task.id}
                      >
                        <FiCheckCircle className="mr-1" /> Done
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FiCheckCircle className="text-green-500" />
                Completed ({completedTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 bg-green-50 rounded-lg"
                  >
                    <FiCheckCircle className="text-green-500 flex-shrink-0" />
                    <span className="text-gray-600 line-through">{task.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Skipped Tasks */}
        {skippedTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-500">
                <FiSkipForward />
                Skipped ({skippedTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {skippedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <FiSkipForward className="text-gray-400 flex-shrink-0" />
                    <span className="text-gray-400">{task.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {tasks.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <FiCheckCircle className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No tasks scheduled for today</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
