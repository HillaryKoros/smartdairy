'use client';

import { useEffect, useState } from 'react';
import { FiPlus, FiPackage, FiAlertTriangle, FiTruck, FiTrendingDown, FiBarChart2, FiCalendar, FiDollarSign } from 'react-icons/fi';
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

// Static yearly analytics data
const YEARLY_STATS = {
  totalSpending: 145000,
  avgMonthlySpending: 12083,
  topSupplier: 'Bomet Agrovet',
  topItem: 'Dairy Meal',
  purchaseCount: 48,
};

const MONTHLY_SPENDING = [
  { month: 'Jan', amount: 12500 },
  { month: 'Feb', amount: 11200 },
  { month: 'Mar', amount: 13800 },
  { month: 'Apr', amount: 12000 },
  { month: 'May', amount: 14500 },
  { month: 'Jun', amount: 11800 },
  { month: 'Jul', amount: 13200 },
  { month: 'Aug', amount: 12800 },
  { month: 'Sep', amount: 11500 },
  { month: 'Oct', amount: 10200 },
  { month: 'Nov', amount: 10800 },
  { month: 'Dec', amount: 10700 },
];

const CATEGORY_BREAKDOWN = [
  { category: 'Fodder', amount: 58000, percentage: 40 },
  { category: 'Concentrate', amount: 52200, percentage: 36 },
  { category: 'Mineral', amount: 21750, percentage: 15 },
  { category: 'Supplement', amount: 13050, percentage: 9 },
];

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
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'purchases'>('overview');

  const itemForm = useForm({
    defaultValues: {
      name: '',
      category: 'fodder',
      unit: 'kg',
      minimum_stock: 100,
      description: '',
    },
  });

  const purchaseForm = useForm({
    defaultValues: {
      feed_item: '',
      date: getTodayDate(),
      quantity: '',
      unit_price: '',
      supplier: '',
      notes: '',
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
  const maxMonthly = Math.max(...MONTHLY_SPENDING.map(m => m.amount));

  if (loading) return <Layout role="owner"><PageLoading /></Layout>;

  return (
    <Layout role="owner">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Feeds & Inventory</h1>
            <p className="text-gray-500">Inventory management and spending analytics</p>
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

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          {['overview', 'inventory', 'purchases'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
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

        {activeTab === 'overview' && (
          <>
            {/* Yearly Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <FiDollarSign className="text-2xl text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Spending (YTD)</p>
                      <p className="text-xl font-bold text-gray-800">KES {formatNumber(YEARLY_STATS.totalSpending)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FiCalendar className="text-2xl text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Monthly Average</p>
                      <p className="text-xl font-bold text-gray-800">KES {formatNumber(YEARLY_STATS.avgMonthlySpending)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <FiPackage className="text-2xl text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Items</p>
                      <p className="text-xl font-bold text-gray-800">{feedItems.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                      <FiTrendingDown className="text-2xl text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Low Stock</p>
                      <p className="text-xl font-bold text-gray-800">{lowStockItems.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Spending Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FiBarChart2 className="text-primary-500" /> Monthly Feed Spending (2024)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-40">
                  {MONTHLY_SPENDING.map((month, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-red-500 rounded-t hover:bg-red-600 transition-colors"
                        style={{ height: `${(month.amount / maxMonthly) * 100}%` }}
                        title={`${month.month}: KES ${formatNumber(month.amount)}`}
                      />
                      <span className="text-xs text-gray-500 mt-1">{month.month.slice(0, 3)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Spending by Category (YTD)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {CATEGORY_BREAKDOWN.map((cat, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{cat.category}</span>
                        <span className="text-gray-600">KES {formatNumber(cat.amount)} ({cat.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            idx === 0 ? 'bg-green-500' :
                            idx === 1 ? 'bg-blue-500' :
                            idx === 2 ? 'bg-amber-500' : 'bg-purple-500'
                          }`}
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Top Supplier</p>
                      <p className="font-bold text-gray-800">{YEARLY_STATS.topSupplier}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Top Item</p>
                      <p className="font-bold text-gray-800">{YEARLY_STATS.topItem}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'inventory' && (
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
                        {item.current_stock?.days_remaining !== null && item.current_stock?.days_remaining !== undefined && (
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
        )}

        {activeTab === 'purchases' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Purchase History</CardTitle>
                <p className="text-sm text-gray-500">{purchases.length} purchases recorded</p>
              </div>
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
                      {purchases.map((purchase) => (
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
        )}

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
