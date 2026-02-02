'use client';

import { useEffect, useState } from 'react';
import { FiPlus, FiPackage, FiAlertTriangle, FiTruck, FiTrendingDown } from 'react-icons/fi';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input, Select, Textarea } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Badge } from '@/components/Badge';
import { PageLoading } from '@/components/Loading';
import { formatNumber, getTodayDate, formatDate } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

interface FeedItem {
  id: number;
  name: string;
  category: string;
  category_display: string;
  unit: string;
  minimum_stock: number;
  current_stock: {
    quantity: number;
    unit: string;
    is_low: boolean;
    days_remaining: number | null;
  } | null;
}

interface FeedPurchase {
  id: number;
  feed_item_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_cost: number;
  supplier: string;
  date: string;
}

const CATEGORIES = [
  { value: 'fodder', label: 'Fodder' },
  { value: 'concentrate', label: 'Concentrate' },
  { value: 'mineral', label: 'Mineral' },
  { value: 'supplement', label: 'Supplement' },
];

const UNITS = [
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'bale', label: 'Bales' },
  { value: 'bag', label: 'Bags' },
  { value: 'liter', label: 'Liters' },
];

export default function FeedsInventoryPage() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [purchases, setPurchases] = useState<FeedPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const itemForm = useForm({
    defaultValues: {
      category: 'fodder',
      unit: 'kg',
      minimum_stock: 100,
    },
  });

  const purchaseForm = useForm({
    defaultValues: {
      date: getTodayDate(),
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [itemsRes, purchasesRes] = await Promise.all([
        api.getFeedItems(),
        api.getFeedPurchases(),
      ]);
      setFeedItems(itemsRes.results || itemsRes);
      setPurchases(purchasesRes.results || purchasesRes);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (data: any) => {
    setSubmitting(true);
    try {
      await api.createFeedItem({
        ...data,
        minimum_stock: parseFloat(data.minimum_stock),
      });
      toast.success('Feed item added');
      setShowItemModal(false);
      itemForm.reset({ category: 'fodder', unit: 'kg', minimum_stock: 100 });
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddPurchase = async (data: any) => {
    setSubmitting(true);
    try {
      await api.createFeedPurchase({
        ...data,
        feed_item: parseInt(data.feed_item),
        quantity: parseFloat(data.quantity),
        unit_price: parseFloat(data.unit_price),
      });
      toast.success('Purchase recorded');
      setShowPurchaseModal(false);
      purchaseForm.reset({ date: getTodayDate() });
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const lowStockItems = feedItems.filter(item => item.current_stock?.is_low);
  const totalValue = purchases.reduce((sum, p) => sum + p.total_cost, 0);

  if (loading) return <Layout role="owner"><PageLoading /></Layout>;

  return (
    <Layout role="owner">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Feeds & Inventory</h1>
            <p className="text-gray-500">Manage feed stock and purchases</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowItemModal(true)}>
              <FiPlus className="mr-2" /> Add Item
            </Button>
            <Button onClick={() => setShowPurchaseModal(true)}>
              <FiTruck className="mr-2" /> Record Purchase
            </Button>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <FiAlertTriangle className="text-2xl text-red-500" />
                <div>
                  <h3 className="font-medium text-red-800">Low Stock Alert</h3>
                  <p className="text-sm text-red-600">
                    {lowStockItems.length} item(s) are running low: {lowStockItems.map(i => i.name).join(', ')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FiPackage className="text-2xl text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Items</p>
                  <p className="text-2xl font-bold text-gray-800">{feedItems.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <FiTrendingDown className="text-2xl text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Low Stock</p>
                  <p className="text-2xl font-bold text-gray-800">{lowStockItems.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiTruck className="text-2xl text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Purchases (MTD)</p>
                  <p className="text-2xl font-bold text-gray-800">KES {formatNumber(totalValue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Current Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            {feedItems.length === 0 ? (
              <div className="text-center py-8">
                <FiPackage className="text-5xl text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No feed items configured</p>
                <Button variant="outline" className="mt-4" onClick={() => setShowItemModal(true)}>
                  Add First Item
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {feedItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border ${
                      item.current_stock?.is_low ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-gray-800">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.category_display}</p>
                      </div>
                      {item.current_stock?.is_low && (
                        <Badge variant="danger">Low</Badge>
                      )}
                    </div>
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Current Stock:</span>
                        <span className="font-medium text-gray-800">
                          {item.current_stock?.quantity || 0} {item.unit}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Min Stock:</span>
                        <span className="text-gray-600">{item.minimum_stock} {item.unit}</span>
                      </div>
                      {item.current_stock?.days_remaining !== null && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Days Left:</span>
                          <span className={item.current_stock!.days_remaining < 7 ? 'text-red-600 font-medium' : 'text-gray-600'}>
                            ~{item.current_stock!.days_remaining} days
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Purchases */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            {purchases.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No purchases recorded</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Date</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Item</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">Qty</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">Unit Price</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">Total</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Supplier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.slice(0, 10).map((purchase) => (
                      <tr key={purchase.id} className="border-b border-gray-100">
                        <td className="py-3 px-2 text-sm text-gray-800">{formatDate(purchase.date)}</td>
                        <td className="py-3 px-2 text-sm text-gray-800">{purchase.feed_item_name}</td>
                        <td className="py-3 px-2 text-sm text-right text-gray-600">{purchase.quantity} {purchase.unit}</td>
                        <td className="py-3 px-2 text-sm text-right text-gray-600">KES {formatNumber(purchase.unit_price)}</td>
                        <td className="py-3 px-2 text-sm text-right font-medium text-gray-800">KES {formatNumber(purchase.total_cost)}</td>
                        <td className="py-3 px-2 text-sm text-gray-600">{purchase.supplier || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Item Modal */}
        <Modal isOpen={showItemModal} onClose={() => setShowItemModal(false)} title="Add Feed Item">
          <form onSubmit={itemForm.handleSubmit(handleAddItem)} className="space-y-4">
            <Input
              label="Name *"
              {...itemForm.register('name', { required: 'Name is required' })}
              error={itemForm.formState.errors.name?.message as string}
              placeholder="e.g., Dairy Meal"
            />
            <Select
              label="Category *"
              {...itemForm.register('category', { required: true })}
              options={CATEGORIES}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Unit *"
                {...itemForm.register('unit', { required: true })}
                options={UNITS}
              />
              <Input
                label="Min Stock *"
                type="number"
                {...itemForm.register('minimum_stock', { required: true, min: 0 })}
                placeholder="100"
              />
            </div>
            <Textarea
              label="Description"
              {...itemForm.register('description')}
              placeholder="Optional description..."
              rows={2}
            />
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowItemModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1" isLoading={submitting}>
                Add Item
              </Button>
            </div>
          </form>
        </Modal>

        {/* Add Purchase Modal */}
        <Modal isOpen={showPurchaseModal} onClose={() => setShowPurchaseModal(false)} title="Record Purchase">
          <form onSubmit={purchaseForm.handleSubmit(handleAddPurchase)} className="space-y-4">
            <Select
              label="Feed Item *"
              {...purchaseForm.register('feed_item', { required: 'Select a feed item' })}
              error={purchaseForm.formState.errors.feed_item?.message as string}
              options={[
                { value: '', label: 'Select item...' },
                ...feedItems.map(f => ({ value: f.id.toString(), label: `${f.name} (${f.unit})` })),
              ]}
            />
            <Input
              label="Date *"
              type="date"
              {...purchaseForm.register('date', { required: true })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Quantity *"
                type="number"
                step="0.1"
                min="0"
                {...purchaseForm.register('quantity', { required: 'Enter quantity', min: 0.1 })}
                error={purchaseForm.formState.errors.quantity?.message as string}
                placeholder="e.g., 100"
              />
              <Input
                label="Unit Price (KES) *"
                type="number"
                step="0.01"
                min="0"
                {...purchaseForm.register('unit_price', { required: 'Enter price', min: 0 })}
                error={purchaseForm.formState.errors.unit_price?.message as string}
                placeholder="e.g., 50"
              />
            </div>
            <Input
              label="Supplier"
              {...purchaseForm.register('supplier')}
              placeholder="Supplier name..."
            />
            <Textarea
              label="Notes"
              {...purchaseForm.register('notes')}
              placeholder="Any notes..."
              rows={2}
            />
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowPurchaseModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1" isLoading={submitting}>
                Record Purchase
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
}
