'use client';

import { useEffect, useState } from 'react';
import { FiPlus, FiDollarSign, FiUsers, FiTrendingUp, FiShoppingCart, FiCreditCard, FiCalendar, FiBarChart2 } from 'react-icons/fi';
import { GiSheep, GiMeat } from 'react-icons/gi';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input, Select, Textarea } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Badge } from '@/components/Badge';
import { PageLoading } from '@/components/Loading';
import { formatNumber, formatDate, getTodayDate } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

interface Buyer {
  id: number;
  name: string;
  phone: string;
  email: string;
  buyer_type: string;
  buyer_type_display: string;
  credit_limit: number;
  current_balance: number;
}

interface Sale {
  id: number;
  buyer_name: string;
  date: string;
  liters: number;
  price_per_liter: number;
  total_amount: number;
  payment_status: string;
  payment_status_display: string;
  notes: string;
}

interface Payment {
  id: number;
  sale_id: number;
  buyer_name: string;
  amount: number;
  payment_method: string;
  payment_method_display: string;
  date: string;
  reference: string;
}

// Static yearly analytics data (will be replaced with API)
const YEARLY_SALES = {
  totalMilkRevenue: 1707000,
  totalLivestock: 98000,
  totalRevenue: 1805000,
  litersSold: 28450,
  avgPricePerLiter: 60,
  topMonth: 'June',
  topMonthRevenue: 183000,
  outstandingBalance: 45000,
  collectedThisYear: 1760000,
};

const MONTHLY_SALES = [
  { month: 'Jan', milk: 130800, livestock: 12000 },
  { month: 'Feb', milk: 123000, livestock: 0 },
  { month: 'Mar', milk: 139200, livestock: 18000 },
  { month: 'Apr', milk: 144600, livestock: 0 },
  { month: 'May', milk: 154800, livestock: 24000 },
  { month: 'Jun', milk: 159000, livestock: 24000 },
  { month: 'Jul', milk: 163200, livestock: 0 },
  { month: 'Aug', milk: 149400, livestock: 15000 },
  { month: 'Sep', milk: 142800, livestock: 0 },
  { month: 'Oct', milk: 147000, livestock: 5000 },
  { month: 'Nov', milk: 139200, livestock: 0 },
  { month: 'Dec', milk: 114000, livestock: 0 },
];

const LIVESTOCK_SALES = [
  { date: '2024-06-15', type: 'Lambs', count: 2, price: 24000, buyer: 'Local Butcher' },
  { date: '2024-05-10', type: 'Ewe', count: 1, price: 15000, buyer: 'Farmer Kipchoge' },
  { date: '2024-03-22', type: 'Ram', count: 1, price: 18000, buyer: 'Breeding Farm' },
  { date: '2024-02-05', type: 'Lambs', count: 2, price: 20000, buyer: 'Restaurant' },
  { date: '2024-01-18', type: 'Mutton', count: 1, price: 12000, buyer: 'Local Market' },
];

const BUYER_TYPES = [
  { value: 'individual', label: 'Individual' },
  { value: 'hotel', label: 'Hotel/Restaurant' },
  { value: 'processor', label: 'Processor' },
  { value: 'cooperative', label: 'Cooperative' },
  { value: 'retailer', label: 'Retailer' },
];

const PAYMENT_STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'partial', label: 'Partial' },
  { value: 'paid', label: 'Paid' },
];

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'mpesa', label: 'M-Pesa' },
  { value: 'bank', label: 'Bank Transfer' },
  { value: 'credit', label: 'Credit' },
];

export default function SalesPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuyerModal, setShowBuyerModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'milk' | 'livestock'>('overview');

  const buyerForm = useForm({
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      buyer_type: 'individual',
      credit_limit: 0,
      address: '',
    },
  });

  const saleForm = useForm({
    defaultValues: {
      buyer: '',
      date: getTodayDate(),
      liters: '',
      price_per_liter: 60,
      notes: '',
    },
  });

  const paymentForm = useForm({
    defaultValues: {
      date: getTodayDate(),
      amount: '',
      payment_method: 'cash',
      reference: '',
      notes: '',
    },
  });

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.payment_status = statusFilter;

      const [buyersRes, salesRes, paymentsRes] = await Promise.all([
        api.getBuyers(),
        api.getSales(params),
        api.getPayments(),
      ]);
      setBuyers(buyersRes.results || buyersRes);
      setSales(salesRes.results || salesRes);
      setPayments(paymentsRes.results || paymentsRes);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBuyer = async (data: any) => {
    setSubmitting(true);
    try {
      await api.createBuyer({
        ...data,
        credit_limit: parseFloat(data.credit_limit) || 0,
      });
      toast.success('Buyer added');
      setShowBuyerModal(false);
      buyerForm.reset({ buyer_type: 'individual', credit_limit: 0 });
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSale = async (data: any) => {
    setSubmitting(true);
    try {
      await api.createSale({
        ...data,
        buyer: parseInt(data.buyer),
        liters: parseFloat(data.liters),
        price_per_liter: parseFloat(data.price_per_liter),
      });
      toast.success('Sale recorded');
      setShowSaleModal(false);
      saleForm.reset({ date: getTodayDate(), price_per_liter: 60 });
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddPayment = async (data: any) => {
    if (!selectedSale) return;
    setSubmitting(true);
    try {
      await api.createPayment({
        ...data,
        sale: selectedSale.id,
        amount: parseFloat(data.amount),
      });
      toast.success('Payment recorded');
      setShowPaymentModal(false);
      setSelectedSale(null);
      paymentForm.reset({ date: getTodayDate(), payment_method: 'cash' });
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openPaymentModal = (sale: Sale) => {
    setSelectedSale(sale);
    setShowPaymentModal(true);
  };

  const totalSales = sales.reduce((sum, s) => sum + s.total_amount, 0);
  const totalLiters = sales.reduce((sum, s) => sum + s.liters, 0);
  const unpaidAmount = sales.filter(s => s.payment_status !== 'paid').reduce((sum, s) => sum + s.total_amount, 0);
  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
  const maxMonthly = Math.max(...MONTHLY_SALES.map(m => m.milk + m.livestock));

  if (loading) return <Layout role="owner"><PageLoading /></Layout>;

  return (
    <Layout role="owner">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Sales & Revenue</h1>
            <p className="text-gray-500">Comprehensive sales analytics and management</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowBuyerModal(true)}>
              <FiUsers className="mr-2" /> Add Buyer
            </Button>
            <Button onClick={() => setShowSaleModal(true)}>
              <FiPlus className="mr-2" /> New Sale
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          {['overview', 'milk', 'livestock'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'livestock' ? 'Livestock Sales' : tab === 'milk' ? 'Milk Sales' : 'Overview'}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Yearly Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <FiDollarSign className="text-2xl text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Revenue (YTD)</p>
                      <p className="text-xl font-bold text-gray-800">KES {formatNumber(YEARLY_SALES.totalRevenue)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FiShoppingCart className="text-2xl text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Milk Revenue (YTD)</p>
                      <p className="text-xl font-bold text-gray-800">KES {formatNumber(YEARLY_SALES.totalMilkRevenue)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                      <GiSheep className="text-2xl text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Livestock Revenue</p>
                      <p className="text-xl font-bold text-gray-800">KES {formatNumber(YEARLY_SALES.totalLivestock)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <FiCreditCard className="text-2xl text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Outstanding</p>
                      <p className="text-xl font-bold text-gray-800">KES {formatNumber(YEARLY_SALES.outstandingBalance)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FiBarChart2 className="text-primary-500" /> Monthly Revenue Breakdown (2024)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-48">
                  {MONTHLY_SALES.map((month, idx) => {
                    const total = month.milk + month.livestock;
                    const milkHeight = (month.milk / maxMonthly) * 100;
                    const livestockHeight = (month.livestock / maxMonthly) * 100;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center">
                        <div className="w-full flex flex-col" style={{ height: `${((month.milk + month.livestock) / maxMonthly) * 100}%` }}>
                          {month.livestock > 0 && (
                            <div
                              className="w-full bg-amber-500 rounded-t"
                              style={{ height: `${(month.livestock / total) * 100}%` }}
                              title={`Livestock: KES ${formatNumber(month.livestock)}`}
                            />
                          )}
                          <div
                            className={`w-full bg-blue-500 ${month.livestock === 0 ? 'rounded-t' : ''}`}
                            style={{ height: `${(month.milk / total) * 100}%` }}
                            title={`Milk: KES ${formatNumber(month.milk)}`}
                          />
                        </div>
                        <span className="text-xs text-gray-500 mt-1">{month.month.slice(0, 3)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded" />
                    <span className="text-sm text-gray-600">Milk Sales</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded" />
                    <span className="text-sm text-gray-600">Livestock Sales</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-3xl font-bold text-blue-600">{formatNumber(YEARLY_SALES.litersSold)}</p>
                <p className="text-sm text-blue-700">Liters Sold YTD</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <p className="text-3xl font-bold text-green-600">KES {YEARLY_SALES.avgPricePerLiter}</p>
                <p className="text-sm text-green-700">Avg Price/Liter</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <p className="text-3xl font-bold text-purple-600">{YEARLY_SALES.topMonth}</p>
                <p className="text-sm text-purple-700">Top Month</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg text-center">
                <p className="text-3xl font-bold text-emerald-600">KES {formatNumber(YEARLY_SALES.topMonthRevenue)}</p>
                <p className="text-sm text-emerald-700">Top Month Revenue</p>
              </div>
            </div>
          </>
        )}

        {activeTab === 'milk' && (
          <>
            {/* Milk Sales Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <FiDollarSign className="text-2xl text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Sales</p>
                      <p className="text-xl font-bold text-gray-800">KES {formatNumber(totalSales)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FiShoppingCart className="text-2xl text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Liters Sold</p>
                      <p className="text-xl font-bold text-gray-800">{formatNumber(totalLiters)} L</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <FiCreditCard className="text-2xl text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Outstanding</p>
                      <p className="text-xl font-bold text-gray-800">KES {formatNumber(unpaidAmount)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FiTrendingUp className="text-2xl text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Payments Received</p>
                      <p className="text-xl font-bold text-gray-800">KES {formatNumber(totalPayments)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Buyers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FiUsers className="text-blue-500" />
                    Buyers ({buyers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {buyers.length === 0 ? (
                    <div className="text-center py-6">
                      <FiUsers className="text-4xl text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No buyers yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {buyers.map((buyer) => (
                        <div key={buyer.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-800">{buyer.name}</p>
                              <p className="text-xs text-gray-500">{buyer.buyer_type_display}</p>
                            </div>
                            {buyer.current_balance > 0 && (
                              <Badge variant="warning">KES {formatNumber(buyer.current_balance)}</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Sales List */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FiShoppingCart className="text-green-500" />
                      Recent Sales
                    </CardTitle>
                    <Select
                      options={PAYMENT_STATUSES}
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-32"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {sales.length === 0 ? (
                    <div className="text-center py-8">
                      <FiShoppingCart className="text-5xl text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No sales recorded</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-2 text-sm font-medium text-gray-500">Date</th>
                            <th className="text-left py-2 px-2 text-sm font-medium text-gray-500">Buyer</th>
                            <th className="text-right py-2 px-2 text-sm font-medium text-gray-500">Liters</th>
                            <th className="text-right py-2 px-2 text-sm font-medium text-gray-500">Amount</th>
                            <th className="text-center py-2 px-2 text-sm font-medium text-gray-500">Status</th>
                            <th className="text-right py-2 px-2 text-sm font-medium text-gray-500">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sales.slice(0, 10).map((sale) => (
                            <tr key={sale.id} className="border-b border-gray-100">
                              <td className="py-2 px-2 text-sm text-gray-800">{formatDate(sale.date)}</td>
                              <td className="py-2 px-2 text-sm text-gray-800">{sale.buyer_name}</td>
                              <td className="py-2 px-2 text-sm text-right text-gray-600">{formatNumber(sale.liters)} L</td>
                              <td className="py-2 px-2 text-sm text-right font-medium text-gray-800">KES {formatNumber(sale.total_amount)}</td>
                              <td className="py-2 px-2 text-center">
                                <Badge status={sale.payment_status}>{sale.payment_status_display}</Badge>
                              </td>
                              <td className="py-2 px-2 text-right">
                                {sale.payment_status !== 'paid' && (
                                  <Button size="sm" variant="outline" onClick={() => openPaymentModal(sale)}>
                                    Pay
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Payments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FiCreditCard className="text-purple-500" />
                  Recent Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <p className="text-gray-500 text-center py-6">No payments recorded</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-2 text-sm font-medium text-gray-500">Date</th>
                          <th className="text-left py-2 px-2 text-sm font-medium text-gray-500">Buyer</th>
                          <th className="text-left py-2 px-2 text-sm font-medium text-gray-500">Method</th>
                          <th className="text-right py-2 px-2 text-sm font-medium text-gray-500">Amount</th>
                          <th className="text-left py-2 px-2 text-sm font-medium text-gray-500">Reference</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.slice(0, 10).map((payment) => (
                          <tr key={payment.id} className="border-b border-gray-100">
                            <td className="py-2 px-2 text-sm text-gray-800">{formatDate(payment.date)}</td>
                            <td className="py-2 px-2 text-sm text-gray-800">{payment.buyer_name}</td>
                            <td className="py-2 px-2 text-sm text-gray-600">{payment.payment_method_display}</td>
                            <td className="py-2 px-2 text-sm text-right font-medium text-green-600">KES {formatNumber(payment.amount)}</td>
                            <td className="py-2 px-2 text-sm text-gray-500">{payment.reference || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'livestock' && (
          <>
            {/* Livestock Sales Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                      <GiSheep className="text-2xl text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Revenue (YTD)</p>
                      <p className="text-xl font-bold text-gray-800">KES {formatNumber(YEARLY_SALES.totalLivestock)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <FiTrendingUp className="text-2xl text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Animals Sold</p>
                      <p className="text-xl font-bold text-gray-800">8</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FiDollarSign className="text-2xl text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Avg Sale Price</p>
                      <p className="text-xl font-bold text-gray-800">KES 12,250</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <GiMeat className="text-2xl text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Current Stock</p>
                      <p className="text-xl font-bold text-gray-800">6 sheep</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Livestock Sales History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GiSheep className="text-amber-500" /> Livestock Sales History (2024)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Date</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Type</th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-gray-500">Count</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">Price</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Buyer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {LIVESTOCK_SALES.map((sale, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="py-3 px-2 text-sm text-gray-800">{formatDate(sale.date)}</td>
                          <td className="py-3 px-2 text-sm">
                            <Badge variant={sale.type === 'Lambs' ? 'info' : sale.type === 'Ram' ? 'primary' : 'warning'}>
                              {sale.type}
                            </Badge>
                          </td>
                          <td className="py-3 px-2 text-sm text-center text-gray-600">{sale.count}</td>
                          <td className="py-3 px-2 text-sm text-right font-medium text-green-600">KES {formatNumber(sale.price)}</td>
                          <td className="py-3 px-2 text-sm text-gray-600">{sale.buyer}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between">
                  <span className="font-medium text-gray-700">Total Livestock Revenue (YTD)</span>
                  <span className="font-bold text-green-600">KES {formatNumber(YEARLY_SALES.totalLivestock)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Guide */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FiDollarSign className="text-green-500" /> Current Market Prices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <p className="font-medium text-amber-800">Mature Ewes</p>
                    <p className="text-lg font-bold text-amber-900">KES 12,000 - 15,000</p>
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <p className="font-medium text-indigo-800">Breeding Ram</p>
                    <p className="text-lg font-bold text-indigo-900">KES 18,000 - 25,000</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="font-medium text-orange-800">Lambs (3-6 mo)</p>
                    <p className="text-lg font-bold text-orange-900">KES 8,000 - 12,000</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="font-medium text-red-800">Mutton (per kg)</p>
                    <p className="text-lg font-bold text-red-900">KES 600/kg</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Add Buyer Modal */}
        <Modal isOpen={showBuyerModal} onClose={() => setShowBuyerModal(false)} title="Add Buyer">
          <form onSubmit={buyerForm.handleSubmit(handleAddBuyer)} className="space-y-4">
            <Input
              label="Name *"
              {...buyerForm.register('name', { required: 'Name is required' })}
              error={buyerForm.formState.errors.name?.message as string}
              placeholder="Buyer name"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Phone"
                {...buyerForm.register('phone')}
                placeholder="0712345678"
              />
              <Input
                label="Email"
                type="email"
                {...buyerForm.register('email')}
                placeholder="email@example.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Buyer Type *"
                {...buyerForm.register('buyer_type', { required: true })}
                options={BUYER_TYPES}
              />
              <Input
                label="Credit Limit (KES)"
                type="number"
                {...buyerForm.register('credit_limit')}
                placeholder="0"
              />
            </div>
            <Textarea
              label="Address"
              {...buyerForm.register('address')}
              placeholder="Physical address..."
              rows={2}
            />
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowBuyerModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1" isLoading={submitting}>
                Add Buyer
              </Button>
            </div>
          </form>
        </Modal>

        {/* Add Sale Modal */}
        <Modal isOpen={showSaleModal} onClose={() => setShowSaleModal(false)} title="Record Sale">
          <form onSubmit={saleForm.handleSubmit(handleAddSale)} className="space-y-4">
            <Select
              label="Buyer *"
              {...saleForm.register('buyer', { required: 'Select a buyer' })}
              error={saleForm.formState.errors.buyer?.message as string}
              options={[
                { value: '', label: 'Select buyer...' },
                ...buyers.map(b => ({ value: b.id.toString(), label: b.name })),
              ]}
            />
            <Input
              label="Date *"
              type="date"
              {...saleForm.register('date', { required: true })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Liters *"
                type="number"
                step="0.1"
                min="0"
                {...saleForm.register('liters', { required: 'Enter quantity', min: 0.1 })}
                error={saleForm.formState.errors.liters?.message as string}
                placeholder="e.g., 50"
              />
              <Input
                label="Price per Liter (KES) *"
                type="number"
                step="0.01"
                min="0"
                {...saleForm.register('price_per_liter', { required: 'Enter price', min: 0 })}
                error={saleForm.formState.errors.price_per_liter?.message as string}
                placeholder="60"
              />
            </div>
            <Textarea
              label="Notes"
              {...saleForm.register('notes')}
              placeholder="Sale notes..."
              rows={2}
            />
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowSaleModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1" isLoading={submitting}>
                Record Sale
              </Button>
            </div>
          </form>
        </Modal>

        {/* Add Payment Modal */}
        <Modal isOpen={showPaymentModal} onClose={() => { setShowPaymentModal(false); setSelectedSale(null); }} title="Record Payment">
          <form onSubmit={paymentForm.handleSubmit(handleAddPayment)} className="space-y-4">
            {selectedSale && (
              <div className="p-3 bg-gray-50 rounded-lg mb-4">
                <p className="font-medium text-gray-800">{selectedSale.buyer_name}</p>
                <p className="text-sm text-gray-500">
                  {formatNumber(selectedSale.liters)} L - KES {formatNumber(selectedSale.total_amount)}
                </p>
              </div>
            )}
            <Input
              label="Date *"
              type="date"
              {...paymentForm.register('date', { required: true })}
            />
            <Input
              label="Amount (KES) *"
              type="number"
              step="0.01"
              min="0"
              {...paymentForm.register('amount', { required: 'Enter amount', min: 0.01 })}
              error={paymentForm.formState.errors.amount?.message as string}
              placeholder="Enter payment amount"
            />
            <Select
              label="Payment Method *"
              {...paymentForm.register('payment_method', { required: true })}
              options={PAYMENT_METHODS}
            />
            <Input
              label="Reference"
              {...paymentForm.register('reference')}
              placeholder="Transaction ID or receipt number"
            />
            <Textarea
              label="Notes"
              {...paymentForm.register('notes')}
              placeholder="Payment notes..."
              rows={2}
            />
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => { setShowPaymentModal(false); setSelectedSale(null); }} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1" isLoading={submitting}>
                Record Payment
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
}
