'use client';

import { useEffect, useState } from 'react';
import { FiPlus, FiHeart, FiAlertCircle } from 'react-icons/fi';
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

interface Cow {
  id: number;
  tag_number: string;
  name: string;
}

interface HealthEvent {
  id: number;
  cow_tag: string;
  cow_name: string;
  date: string;
  symptoms: string;
  severity: string;
  severity_display: string;
  is_resolved: boolean;
}

const SEVERITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export default function HealthPage() {
  const [events, setEvents] = useState<HealthEvent[]>([]);
  const [cows, setCows] = useState<Cow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      cow: '',
      date: getTodayDate(),
      symptoms: '',
      temperature: '',
      severity: 'medium',
      diagnosis: '',
      notes: '',
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [eventsRes, cowsRes] = await Promise.all([
        api.getHealthEvents({ is_resolved: 'false' }),
        api.getCows(),
      ]);
      setEvents(eventsRes.results || eventsRes);
      setCows(cowsRes.results || cowsRes);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (data: any) => {
    setSubmitting(true);
    try {
      await api.createHealthEvent({
        ...data,
        cow: parseInt(data.cow),
        temperature: data.temperature ? parseFloat(data.temperature) : null,
      });
      toast.success('Health event recorded');
      setShowModal(false);
      reset({ date: getTodayDate(), severity: 'medium' });
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Layout role="worker"><PageLoading /></Layout>;

  return (
    <Layout role="worker">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Health Events</h1>
            <p className="text-gray-500">Report health observations</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <FiPlus className="mr-2" /> Report Event
          </Button>
        </div>

        {/* Active Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiAlertCircle className="text-red-500" />
              Active Health Events ({events.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="text-center py-8">
                <FiHeart className="text-5xl text-green-300 mx-auto mb-3" />
                <p className="text-gray-500">No active health events</p>
                <p className="text-sm text-gray-400">All cows are healthy!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 bg-gray-50 rounded-lg border-l-4 border-l-red-500"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-800">
                            {event.cow_tag} {event.cow_name && `(${event.cow_name})`}
                          </h3>
                          <Badge status={event.severity}>{event.severity_display}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{event.symptoms}</p>
                        <p className="text-xs text-gray-400 mt-2">{formatDate(event.date)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Event Modal */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Report Health Event" size="lg">
          <form onSubmit={handleSubmit(handleAddEvent)} className="space-y-4">
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
            <Textarea
              label="Symptoms *"
              {...register('symptoms', { required: 'Describe the symptoms' })}
              error={errors.symptoms?.message as string}
              placeholder="Describe what you observed..."
              rows={3}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Temperature (°C)"
                type="number"
                step="0.1"
                {...register('temperature')}
                placeholder="e.g., 38.5"
              />
              <Select
                label="Severity *"
                {...register('severity', { required: true })}
                options={SEVERITIES}
              />
            </div>
            <Input
              label="Diagnosis (if known)"
              {...register('diagnosis')}
              placeholder="Initial diagnosis..."
            />
            <Textarea
              label="Notes"
              {...register('notes')}
              placeholder="Additional notes..."
              rows={2}
            />
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1" isLoading={submitting}>
                Report Event
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
}
