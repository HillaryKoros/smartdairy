'use client';

import { useEffect, useState } from 'react';
import { FiPlus, FiSearch, FiFilter } from 'react-icons/fi';
import { GiCow } from 'react-icons/gi';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input, Select } from '@/components/Input';
import { Badge } from '@/components/Badge';
import { Modal } from '@/components/Modal';
import { PageLoading } from '@/components/Loading';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

interface Cow {
  id: number;
  tag_number: string;
  name: string;
  breed: string;
  status: string;
  status_display: string;
}

const COW_STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'heifer', label: 'Heifer' },
  { value: 'milking', label: 'Milking' },
  { value: 'dry', label: 'Dry' },
  { value: 'pregnant', label: 'Pregnant' },
  { value: 'sick', label: 'Sick' },
  { value: 'sold', label: 'Sold' },
  { value: 'dead', label: 'Dead' },
];

export default function CowsPage() {
  const [cows, setCows] = useState<Cow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    loadCows();
  }, [statusFilter]);

  const loadCows = async () => {
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      const response = await api.getCows(params);
      setCows(response.results || response);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCow = async (data: any) => {
    try {
      await api.createCow(data);
      toast.success('Cow added successfully');
      setShowModal(false);
      reset();
      loadCows();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const filteredCows = cows.filter(cow =>
    cow.tag_number.toLowerCase().includes(search.toLowerCase()) ||
    cow.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Layout role="owner"><PageLoading /></Layout>;

  return (
    <Layout role="owner">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Cows</h1>
            <p className="text-gray-500">{cows.length} total cows</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <FiPlus className="mr-2" /> Add Cow
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by tag or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <Select
            options={COW_STATUSES}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48"
          />
        </div>

        {/* Cows Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCows.map((cow) => (
            <Card key={cow.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <GiCow className="text-2xl text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{cow.tag_number}</h3>
                      {cow.name && <p className="text-sm text-gray-500">{cow.name}</p>}
                    </div>
                  </div>
                  <Badge status={cow.status}>{cow.status_display}</Badge>
                </div>
                {cow.breed && (
                  <p className="text-sm text-gray-500">Breed: {cow.breed}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCows.length === 0 && (
          <div className="text-center py-12">
            <GiCow className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No cows found</p>
          </div>
        )}

        {/* Add Cow Modal */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Cow">
          <form onSubmit={handleSubmit(handleAddCow)} className="space-y-4">
            <Input
              label="Tag Number *"
              {...register('tag_number', { required: 'Tag number is required' })}
              error={errors.tag_number?.message as string}
              placeholder="e.g., KD001"
            />
            <Input
              label="Name"
              {...register('name')}
              placeholder="e.g., Malkia"
            />
            <Input
              label="Breed"
              {...register('breed')}
              placeholder="e.g., Friesian"
            />
            <Select
              label="Status *"
              {...register('status', { required: true })}
              options={COW_STATUSES.filter(s => s.value)}
            />
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Add Cow
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
}
