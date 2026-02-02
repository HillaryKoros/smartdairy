'use client';

import { useEffect, useState } from 'react';
import { FiPlus, FiPackage } from 'react-icons/fi';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input, Select } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Badge } from '@/components/Badge';
import { PageLoading } from '@/components/Loading';
import { getTodayDate } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

interface FeedItem {
  id: number;
  name: string;
  category: string;
  category_display: string;
  unit: string;
  current_stock: {
    quantity: number;
    unit: string;
    is_low: boolean;
    days_remaining: number | null;
  } | null;
}

export default function FeedUsagePage() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      date: getTodayDate(),
      scan_method: 'manual',
    },
  });

  useEffect(() => {
    loadFeedItems();
  }, []);

  const loadFeedItems = async () => {
    try {
      const response = await api.getFeedItems();
      setFeedItems(response.results || response);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUsage = async (data: any) => {
    setSubmitting(true);
    try {
      const feedItem = feedItems.find(f => f.id === parseInt(data.feed_item));
      await api.createFeedUsage({
        ...data,
        feed_item: parseInt(data.feed_item),
        quantity: parseFloat(data.quantity),
        unit: feedItem?.unit || 'kg',
      });
      toast.success('Feed usage logged');
      setShowModal(false);
      reset({ date: getTodayDate(), scan_method: 'manual' });
      loadFeedItems();
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
            <h1 className="text-2xl font-bold text-gray-800">Feed Usage</h1>
            <p className="text-gray-500">Log feed distribution</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <FiPlus className="mr-2" /> Log Usage
          </Button>
        </div>

        {/* Feed Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {feedItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FiPackage className="text-xl text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.category_display}</p>
                    </div>
                  </div>
                  {item.current_stock?.is_low && (
                    <Badge variant="danger">Low Stock</Badge>
                  )}
                </div>
                {item.current_stock && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Current Stock:</span>
                      <span className="font-medium text-gray-800">
                        {item.current_stock.quantity} {item.current_stock.unit}
                      </span>
                    </div>
                    {item.current_stock.days_remaining !== null && (
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-500">Days Remaining:</span>
                        <span className={`font-medium ${item.current_stock.days_remaining < 7 ? 'text-red-600' : 'text-gray-800'}`}>
                          ~{item.current_stock.days_remaining} days
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {feedItems.length === 0 && (
          <div className="text-center py-12">
            <FiPackage className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No feed items configured</p>
          </div>
        )}

        {/* Add Usage Modal */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Log Feed Usage">
          <form onSubmit={handleSubmit(handleAddUsage)} className="space-y-4">
            <Select
              label="Feed Item *"
              {...register('feed_item', { required: 'Select a feed item' })}
              error={errors.feed_item?.message as string}
              options={[
                { value: '', label: 'Select feed...' },
                ...feedItems.map(f => ({
                  value: f.id.toString(),
                  label: `${f.name} (${f.current_stock?.quantity || 0} ${f.unit} available)`
                })),
              ]}
            />
            <Input
              label="Date *"
              type="date"
              {...register('date', { required: true })}
            />
            <Input
              label="Quantity *"
              type="number"
              step="0.1"
              min="0"
              {...register('quantity', { required: 'Enter quantity', min: { value: 0.1, message: 'Must be positive' } })}
              error={errors.quantity?.message as string}
              placeholder="e.g., 50"
            />
            <Input
              label="Notes"
              {...register('notes')}
              placeholder="Any notes..."
            />
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1" isLoading={submitting}>
                Log Usage
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
}
