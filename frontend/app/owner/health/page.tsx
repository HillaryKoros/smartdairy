'use client';

import { useEffect, useState } from 'react';
import { FiPlus, FiHeart, FiAlertCircle, FiCheckCircle, FiCalendar, FiThermometer } from 'react-icons/fi';
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

interface HealthEvent {
  id: number;
  cow_tag: string;
  cow_name: string;
  date: string;
  symptoms: string;
  diagnosis: string;
  severity: string;
  severity_display: string;
  is_resolved: boolean;
  resolution_date: string | null;
  resolution_notes: string;
}

interface Cow {
  id: number;
  tag_number: string;
  name: string;
}

interface Treatment {
  id: number;
  health_event_id: number;
  medication: string;
  dosage: string;
  date: string;
  administered_by: string;
  notes: string;
}

const SEVERITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export default function HealthPage() {
  const [events, setEvents] = useState<HealthEvent[]>([]);
  const [activeEvents, setActiveEvents] = useState<HealthEvent[]>([]);
  const [cows, setCows] = useState<Cow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<HealthEvent | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const eventForm = useForm({
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

  const resolveForm = useForm({
    defaultValues: {
      resolution_date: getTodayDate(),
      diagnosis: '',
      resolution_notes: '',
    },
  });

  const treatmentForm = useForm({
    defaultValues: {
      date: getTodayDate(),
      medication: '',
      dosage: '',
      administered_by: '',
      notes: '',
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [eventsRes, activeRes, cowsRes] = await Promise.all([
        api.getHealthEvents(),
        api.getHealthEvents({ is_resolved: 'false' }),
        api.getCows(),
      ]);
      setEvents(eventsRes.results || eventsRes);
      setActiveEvents(activeRes.results || activeRes);
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
      setShowEventModal(false);
      eventForm.reset({ date: getTodayDate(), severity: 'medium' });
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async (data: any) => {
    if (!selectedEvent) return;
    setSubmitting(true);
    try {
      await api.resolveHealthEvent(selectedEvent.id, data);
      toast.success('Event resolved');
      setShowResolveModal(false);
      setSelectedEvent(null);
      resolveForm.reset({ resolution_date: getTodayDate() });
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddTreatment = async (data: any) => {
    if (!selectedEvent) return;
    setSubmitting(true);
    try {
      await api.createTreatment({
        ...data,
        health_event: selectedEvent.id,
      });
      toast.success('Treatment recorded');
      setShowTreatmentModal(false);
      setSelectedEvent(null);
      treatmentForm.reset({ date: getTodayDate() });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openResolveModal = (event: HealthEvent) => {
    setSelectedEvent(event);
    setShowResolveModal(true);
  };

  const openTreatmentModal = (event: HealthEvent) => {
    setSelectedEvent(event);
    setShowTreatmentModal(true);
  };

  const criticalEvents = activeEvents.filter(e => e.severity === 'critical');
  const highEvents = activeEvents.filter(e => e.severity === 'high');

  if (loading) return <Layout role="owner"><PageLoading /></Layout>;

  return (
    <Layout role="owner">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Health Management</h1>
            <p className="text-gray-500">Track health events and treatments</p>
          </div>
          <Button onClick={() => setShowEventModal(true)}>
            <FiPlus className="mr-2" /> Add Event
          </Button>
        </div>

        {/* Critical Alert */}
        {criticalEvents.length > 0 && (
          <Card className="border-red-300 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <FiAlertCircle className="text-3xl text-red-500" />
                <div>
                  <h3 className="font-bold text-red-800">Critical Health Events!</h3>
                  <p className="text-sm text-red-600">
                    {criticalEvents.length} cow(s) need immediate attention: {criticalEvents.map(e => e.cow_tag).join(', ')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <FiAlertCircle className="text-3xl text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{activeEvents.length}</p>
              <p className="text-sm text-gray-500">Active Events</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <FiThermometer className="text-3xl text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{criticalEvents.length + highEvents.length}</p>
              <p className="text-sm text-gray-500">Critical/High</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <FiCheckCircle className="text-3xl text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{events.filter(e => e.is_resolved).length}</p>
              <p className="text-sm text-gray-500">Resolved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <FiHeart className="text-3xl text-pink-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{events.length}</p>
              <p className="text-sm text-gray-500">Total Events</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiAlertCircle className="text-red-500" />
              Active Health Events ({activeEvents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeEvents.length === 0 ? (
              <div className="text-center py-8">
                <FiHeart className="text-5xl text-green-300 mx-auto mb-3" />
                <p className="text-gray-500">No active health events</p>
                <p className="text-sm text-gray-400">All cows are healthy!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      event.severity === 'critical' ? 'bg-red-50 border-l-red-500' :
                      event.severity === 'high' ? 'bg-orange-50 border-l-orange-500' :
                      event.severity === 'medium' ? 'bg-yellow-50 border-l-yellow-500' :
                      'bg-gray-50 border-l-gray-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-800">
                            {event.cow_tag} {event.cow_name && `(${event.cow_name})`}
                          </h3>
                          <Badge status={event.severity}>{event.severity_display}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{event.symptoms}</p>
                        {event.diagnosis && (
                          <p className="text-sm text-gray-500 mt-1">Diagnosis: {event.diagnosis}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          <FiCalendar className="inline mr-1" />
                          {formatDate(event.date)}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" variant="outline" onClick={() => openTreatmentModal(event)}>
                          Add Treatment
                        </Button>
                        <Button size="sm" variant="success" onClick={() => openResolveModal(event)}>
                          Resolve
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Resolved Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiCheckCircle className="text-green-500" />
              Recently Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            {events.filter(e => e.is_resolved).length === 0 ? (
              <p className="text-gray-500 text-center py-6">No resolved events</p>
            ) : (
              <div className="space-y-2">
                {events.filter(e => e.is_resolved).slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">
                        {event.cow_tag} {event.cow_name && `(${event.cow_name})`}
                      </p>
                      <p className="text-sm text-gray-500">{event.diagnosis || event.symptoms}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="success">Resolved</Badge>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(event.resolution_date!)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Event Modal */}
        <Modal isOpen={showEventModal} onClose={() => setShowEventModal(false)} title="Add Health Event" size="lg">
          <form onSubmit={eventForm.handleSubmit(handleAddEvent)} className="space-y-4">
            <Select
              label="Cow *"
              {...eventForm.register('cow', { required: 'Select a cow' })}
              error={eventForm.formState.errors.cow?.message as string}
              options={[
                { value: '', label: 'Select cow...' },
                ...cows.map(c => ({ value: c.id.toString(), label: `${c.tag_number} ${c.name ? `(${c.name})` : ''}` })),
              ]}
            />
            <Input
              label="Date *"
              type="date"
              {...eventForm.register('date', { required: true })}
            />
            <Textarea
              label="Symptoms *"
              {...eventForm.register('symptoms', { required: 'Describe the symptoms' })}
              error={eventForm.formState.errors.symptoms?.message as string}
              placeholder="Describe observed symptoms..."
              rows={3}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Temperature (°C)"
                type="number"
                step="0.1"
                {...eventForm.register('temperature')}
                placeholder="e.g., 38.5"
              />
              <Select
                label="Severity *"
                {...eventForm.register('severity', { required: true })}
                options={SEVERITIES}
              />
            </div>
            <Input
              label="Diagnosis"
              {...eventForm.register('diagnosis')}
              placeholder="Initial diagnosis if known..."
            />
            <Textarea
              label="Notes"
              {...eventForm.register('notes')}
              placeholder="Additional notes..."
              rows={2}
            />
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowEventModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1" isLoading={submitting}>
                Add Event
              </Button>
            </div>
          </form>
        </Modal>

        {/* Resolve Modal */}
        <Modal isOpen={showResolveModal} onClose={() => { setShowResolveModal(false); setSelectedEvent(null); }} title="Resolve Health Event">
          <form onSubmit={resolveForm.handleSubmit(handleResolve)} className="space-y-4">
            {selectedEvent && (
              <div className="p-3 bg-gray-50 rounded-lg mb-4">
                <p className="font-medium text-gray-800">{selectedEvent.cow_tag} - {selectedEvent.symptoms}</p>
              </div>
            )}
            <Input
              label="Resolution Date *"
              type="date"
              {...resolveForm.register('resolution_date', { required: true })}
            />
            <Input
              label="Final Diagnosis"
              {...resolveForm.register('diagnosis')}
              placeholder="Final diagnosis..."
            />
            <Textarea
              label="Resolution Notes"
              {...resolveForm.register('resolution_notes')}
              placeholder="How was it resolved..."
              rows={3}
            />
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => { setShowResolveModal(false); setSelectedEvent(null); }} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" variant="success" className="flex-1" isLoading={submitting}>
                Mark Resolved
              </Button>
            </div>
          </form>
        </Modal>

        {/* Treatment Modal */}
        <Modal isOpen={showTreatmentModal} onClose={() => { setShowTreatmentModal(false); setSelectedEvent(null); }} title="Add Treatment">
          <form onSubmit={treatmentForm.handleSubmit(handleAddTreatment)} className="space-y-4">
            {selectedEvent && (
              <div className="p-3 bg-gray-50 rounded-lg mb-4">
                <p className="font-medium text-gray-800">{selectedEvent.cow_tag} - {selectedEvent.symptoms}</p>
              </div>
            )}
            <Input
              label="Date *"
              type="date"
              {...treatmentForm.register('date', { required: true })}
            />
            <Input
              label="Medication *"
              {...treatmentForm.register('medication', { required: 'Enter medication name' })}
              error={treatmentForm.formState.errors.medication?.message as string}
              placeholder="e.g., Penicillin"
            />
            <Input
              label="Dosage *"
              {...treatmentForm.register('dosage', { required: 'Enter dosage' })}
              error={treatmentForm.formState.errors.dosage?.message as string}
              placeholder="e.g., 10ml IM"
            />
            <Input
              label="Administered By"
              {...treatmentForm.register('administered_by')}
              placeholder="Name of person..."
            />
            <Textarea
              label="Notes"
              {...treatmentForm.register('notes')}
              placeholder="Treatment notes..."
              rows={2}
            />
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => { setShowTreatmentModal(false); setSelectedEvent(null); }} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1" isLoading={submitting}>
                Add Treatment
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
}
