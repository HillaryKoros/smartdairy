'use client';

import { useEffect, useState } from 'react';
import { FiPlus, FiCheckCircle, FiCircle, FiClock, FiUsers, FiRepeat, FiCalendar } from 'react-icons/fi';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input, Select, Textarea } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Badge } from '@/components/Badge';
import { PageLoading } from '@/components/Loading';
import { formatDate, getTodayDate } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

interface TaskTemplate {
  id: number;
  name: string;
  description: string;
  frequency: string;
  frequency_display: string;
  priority: string;
  is_active: boolean;
}

interface TaskInstance {
  id: number;
  template_name: string;
  assigned_to_name: string;
  scheduled_date: string;
  due_time: string | null;
  status: string;
  status_display: string;
  priority: string;
  completed_at: string | null;
  completed_by_name: string | null;
}

interface Worker {
  id: number;
  full_name: string;
  phone: string;
}

const FREQUENCIES = [
  { value: 'once', label: 'One-time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'done', label: 'Done' },
  { value: 'skipped', label: 'Skipped' },
];

export default function TasksPage() {
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [tasks, setTasks] = useState<TaskInstance[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const templateForm = useForm({
    defaultValues: {
      frequency: 'daily',
      priority: 'medium',
      is_active: true,
    },
  });

  const assignForm = useForm({
    defaultValues: {
      scheduled_date: getTodayDate(),
    },
  });

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;

      const [templatesRes, tasksRes, workersRes] = await Promise.all([
        api.getTaskTemplates(),
        api.getTaskInstances(params),
        api.getWorkers(),
      ]);
      setTemplates(templatesRes.results || templatesRes);
      setTasks(tasksRes.results || tasksRes);
      setWorkers(workersRes.results || workersRes);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTemplate = async (data: any) => {
    setSubmitting(true);
    try {
      await api.createTaskTemplate(data);
      toast.success('Task template created');
      setShowTemplateModal(false);
      templateForm.reset({ frequency: 'daily', priority: 'medium', is_active: true });
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssign = async (data: any) => {
    if (!selectedTemplate) return;
    setSubmitting(true);
    try {
      await api.createTaskInstance({
        ...data,
        template: selectedTemplate.id,
        assigned_to: data.assigned_to ? parseInt(data.assigned_to) : null,
      });
      toast.success('Task assigned');
      setShowAssignModal(false);
      setSelectedTemplate(null);
      assignForm.reset({ scheduled_date: getTodayDate() });
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openAssignModal = (template: TaskTemplate) => {
    setSelectedTemplate(template);
    setShowAssignModal(true);
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'done');
  const todayTasks = tasks.filter(t => t.scheduled_date === getTodayDate());

  if (loading) return <Layout role="owner"><PageLoading /></Layout>;

  return (
    <Layout role="owner">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Work Plans & Tasks</h1>
            <p className="text-gray-500">Manage task templates and assignments</p>
          </div>
          <Button onClick={() => setShowTemplateModal(true)}>
            <FiPlus className="mr-2" /> New Template
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <FiCalendar className="text-3xl text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{todayTasks.length}</p>
              <p className="text-sm text-gray-500">Today's Tasks</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <FiCircle className="text-3xl text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{pendingTasks.length}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <FiCheckCircle className="text-3xl text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{completedTasks.length}</p>
              <p className="text-sm text-gray-500">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <FiRepeat className="text-3xl text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{templates.filter(t => t.is_active).length}</p>
              <p className="text-sm text-gray-500">Active Templates</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FiRepeat className="text-purple-500" />
                Task Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              {templates.length === 0 ? (
                <div className="text-center py-8">
                  <FiRepeat className="text-5xl text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No task templates yet</p>
                  <Button variant="outline" className="mt-4" onClick={() => setShowTemplateModal(true)}>
                    Create Template
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-4 rounded-lg border ${template.is_active ? 'border-gray-200 bg-gray-50' : 'border-gray-100 bg-gray-50 opacity-60'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-800">{template.name}</h3>
                            {template.priority === 'high' && (
                              <Badge variant="danger">High Priority</Badge>
                            )}
                            {!template.is_active && (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </div>
                          {template.description && (
                            <p className="text-sm text-gray-500">{template.description}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            <FiClock className="inline mr-1" />
                            {template.frequency_display}
                          </p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => openAssignModal(template)}>
                          Assign
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Task Instances */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FiUsers className="text-blue-500" />
                  Assigned Tasks
                </CardTitle>
                <Select
                  options={STATUSES}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-32"
                />
              </div>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <div className="text-center py-8">
                  <FiCheckCircle className="text-5xl text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No tasks assigned</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {tasks.slice(0, 15).map((task) => (
                    <div
                      key={task.id}
                      className={`p-3 rounded-lg border ${
                        task.status === 'done' ? 'border-green-200 bg-green-50' :
                        task.status === 'skipped' ? 'border-gray-200 bg-gray-50' :
                        'border-yellow-200 bg-yellow-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            {task.status === 'done' ? (
                              <FiCheckCircle className="text-green-500" />
                            ) : task.status === 'skipped' ? (
                              <FiCircle className="text-gray-400" />
                            ) : (
                              <FiCircle className="text-yellow-500" />
                            )}
                            <span className={`font-medium ${task.status === 'done' ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                              {task.template_name}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {task.assigned_to_name || 'Unassigned'} • {formatDate(task.scheduled_date)}
                            {task.due_time && ` • Due: ${task.due_time}`}
                          </p>
                        </div>
                        <Badge status={task.status}>{task.status_display}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Add Template Modal */}
        <Modal isOpen={showTemplateModal} onClose={() => setShowTemplateModal(false)} title="Create Task Template">
          <form onSubmit={templateForm.handleSubmit(handleAddTemplate)} className="space-y-4">
            <Input
              label="Task Name *"
              {...templateForm.register('name', { required: 'Name is required' })}
              error={templateForm.formState.errors.name?.message as string}
              placeholder="e.g., Morning Milking"
            />
            <Textarea
              label="Description"
              {...templateForm.register('description')}
              placeholder="Task description..."
              rows={2}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Frequency *"
                {...templateForm.register('frequency', { required: true })}
                options={FREQUENCIES}
              />
              <Select
                label="Priority *"
                {...templateForm.register('priority', { required: true })}
                options={PRIORITIES}
              />
            </div>
            <Input
              label="Default Time"
              type="time"
              {...templateForm.register('default_time')}
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                {...templateForm.register('is_active')}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <label htmlFor="is_active" className="text-sm text-gray-700">Active (auto-generate tasks)</label>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowTemplateModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1" isLoading={submitting}>
                Create Template
              </Button>
            </div>
          </form>
        </Modal>

        {/* Assign Task Modal */}
        <Modal isOpen={showAssignModal} onClose={() => { setShowAssignModal(false); setSelectedTemplate(null); }} title="Assign Task">
          <form onSubmit={assignForm.handleSubmit(handleAssign)} className="space-y-4">
            {selectedTemplate && (
              <div className="p-3 bg-gray-50 rounded-lg mb-4">
                <p className="font-medium text-gray-800">{selectedTemplate.name}</p>
                {selectedTemplate.description && (
                  <p className="text-sm text-gray-500">{selectedTemplate.description}</p>
                )}
              </div>
            )}
            <Select
              label="Assign To"
              {...assignForm.register('assigned_to')}
              options={[
                { value: '', label: 'Unassigned' },
                ...workers.map(w => ({ value: w.id.toString(), label: w.full_name })),
              ]}
            />
            <Input
              label="Scheduled Date *"
              type="date"
              {...assignForm.register('scheduled_date', { required: true })}
            />
            <Input
              label="Due Time"
              type="time"
              {...assignForm.register('due_time')}
            />
            <Textarea
              label="Notes"
              {...assignForm.register('notes')}
              placeholder="Any special instructions..."
              rows={2}
            />
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => { setShowAssignModal(false); setSelectedTemplate(null); }} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1" isLoading={submitting}>
                Assign Task
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
}
