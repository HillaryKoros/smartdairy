'use client';

import { useEffect, useState } from 'react';
import { FiPlus, FiDroplet, FiSun, FiMoon } from 'react-icons/fi';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input, Select } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { PageLoading } from '@/components/Loading';
import { formatNumber, getTodayDate } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

interface MilkLog {
  id: number;
  cow_tag: string;
  cow_name: string;
  session: string;
  session_display: string;
  liters: number;
  date: string;
}

interface Cow {
  id: number;
  tag_number: string;
  name: string;
  status: string;
}

const SESSIONS = [
  { value: 'morning', label: 'Morning' },
  { value: 'evening', label: 'Evening' },
  { value: 'once_daily', label: 'Once Daily' },
];

export default function MilkLogPage() {
  const [logs, setLogs] = useState<MilkLog[]>([]);
  const [cows, setCows] = useState<Cow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      date: getTodayDate(),
      session: 'morning',
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [logsRes, cowsRes] = await Promise.all([
        api.getTodayMilkLogs(),
        api.getCows({ status: 'milking' }),
      ]);
      setLogs(logsRes.results || logsRes);
      setCows(cowsRes.results || cowsRes);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLog = async (data: any) => {
    setSubmitting(true);
    try {
      await api.createMilkLog({
        ...data,
        liters: parseFloat(data.liters),
      });
      toast.success('Milk log added');
      setShowModal(false);
      reset({ date: getTodayDate(), session: 'morning' });
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const totalLiters = logs.reduce((sum, log) => sum + log.liters, 0);
  const morningLiters = logs.filter(l => l.session === 'morning').reduce((sum, log) => sum + log.liters, 0);
  const eveningLiters = logs.filter(l => l.session === 'evening').reduce((sum, log) => sum + log.liters, 0);

  if (loading) return <Layout role="worker"><PageLoading /></Layout>;

  return (
    <Layout role="worker">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Milk Log</h1>
            <p className="text-gray-500">Today's milk production</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <FiPlus className="mr-2" /> Add Entry
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <FiDroplet className="text-2xl text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{formatNumber(totalLiters)} L</p>
              <p className="text-sm text-gray-500">Total Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <FiSun className="text-2xl text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{formatNumber(morningLiters)} L</p>
              <p className="text-sm text-gray-500">Morning</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <FiMoon className="text-2xl text-indigo-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{formatNumber(eveningLiters)} L</p>
              <p className="text-sm text-gray-500">Evening</p>
            </CardContent>
          </Card>
        </div>

        {/* Logs List */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Entries ({logs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No entries yet. Add your first milk log!</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-gray-800">
                        {log.cow_tag} {log.cow_name && `(${log.cow_name})`}
                      </p>
                      <p className="text-sm text-gray-500">{log.session_display}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary-600">{formatNumber(log.liters)} L</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Log Modal */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Milk Log">
          <form onSubmit={handleSubmit(handleAddLog)} className="space-y-4">
            <Select
              label="Cow *"
              {...register('cow', { required: 'Select a cow' })}
              error={errors.cow?.message as string}
              options={[
                { value: '', label: 'Select cow...' },
                ...cows.map(c => ({ value: c.id.toString(), label: `${c.tag_number} ${c.name ? `(${c.name})` : ''}` })),
              ]}
            />
            <Input
              label="Date *"
              type="date"
              {...register('date', { required: true })}
            />
            <Select
              label="Session *"
              {...register('session', { required: true })}
              options={SESSIONS}
            />
            <Input
              label="Liters *"
              type="number"
              step="0.1"
              min="0"
              {...register('liters', { required: 'Enter liters', min: { value: 0, message: 'Must be positive' } })}
              error={errors.liters?.message as string}
              placeholder="e.g., 12.5"
            />
            <Input
              label="Notes"
              {...register('notes')}
              placeholder="Any observations..."
            />
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1" isLoading={submitting}>
                Add Log
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
}
