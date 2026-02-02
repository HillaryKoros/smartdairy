'use client';

import { useEffect, useState } from 'react';
import { FiBell, FiCheckCircle, FiAlertTriangle, FiInfo, FiAlertCircle, FiSettings, FiTrash2 } from 'react-icons/fi';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { Button } from '@/components/Button';
import { Select } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Badge } from '@/components/Badge';
import { PageLoading } from '@/components/Loading';
import { formatDate } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Alert {
  id: number;
  title: string;
  message: string;
  alert_type: string;
  alert_type_display: string;
  severity: string;
  severity_display: string;
  is_read: boolean;
  is_resolved: boolean;
  created_at: string;
  related_object_type: string;
  related_object_id: number;
}

interface AlertRule {
  id: number;
  name: string;
  alert_type: string;
  alert_type_display: string;
  is_active: boolean;
  threshold_value: number;
  message_template: string;
}

const ALERT_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'health', label: 'Health' },
  { value: 'production', label: 'Production' },
  { value: 'payment', label: 'Payment' },
  { value: 'task', label: 'Task' },
  { value: 'vaccination', label: 'Vaccination' },
];

const SEVERITIES = [
  { value: '', label: 'All Severities' },
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Warning' },
  { value: 'critical', label: 'Critical' },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [showRulesModal, setShowRulesModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [typeFilter, severityFilter]);

  const loadData = async () => {
    try {
      const params: Record<string, string> = {};
      if (typeFilter) params.alert_type = typeFilter;
      if (severityFilter) params.severity = severityFilter;

      const [alertsRes, rulesRes] = await Promise.all([
        api.getAlerts(params),
        api.getAlertRules(),
      ]);
      setAlerts(alertsRes.results || alertsRes);
      setRules(rulesRes.results || rulesRes);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (alertId: number) => {
    try {
      await api.markAlertRead(alertId);
      setAlerts(alerts.map(a => a.id === alertId ? { ...a, is_read: true } : a));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleResolve = async (alertId: number) => {
    try {
      await api.resolveAlert(alertId);
      toast.success('Alert resolved');
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllAlertsRead();
      setAlerts(alerts.map(a => ({ ...a, is_read: true })));
      toast.success('All alerts marked as read');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleToggleRule = async (ruleId: number, isActive: boolean) => {
    try {
      await api.updateAlertRule(ruleId, { is_active: !isActive });
      setRules(rules.map(r => r.id === ruleId ? { ...r, is_active: !isActive } : r));
      toast.success(`Rule ${!isActive ? 'enabled' : 'disabled'}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <FiAlertCircle className="text-red-500" />;
      case 'warning': return <FiAlertTriangle className="text-yellow-500" />;
      default: return <FiInfo className="text-blue-500" />;
    }
  };

  const getAlertBg = (severity: string, isRead: boolean) => {
    if (isRead) return 'bg-gray-50 border-gray-200';
    switch (severity) {
      case 'critical': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const unreadCount = alerts.filter(a => !a.is_read).length;
  const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.is_resolved).length;

  if (loading) return <Layout role="owner"><PageLoading /></Layout>;

  return (
    <Layout role="owner">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Alerts & Notifications</h1>
            <p className="text-gray-500">
              {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowRulesModal(true)}>
              <FiSettings className="mr-2" /> Rules
            </Button>
            {unreadCount > 0 && (
              <Button variant="outline" onClick={handleMarkAllRead}>
                <FiCheckCircle className="mr-2" /> Mark All Read
              </Button>
            )}
          </div>
        </div>

        {/* Critical Alert Banner */}
        {criticalCount > 0 && (
          <Card className="border-red-300 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <FiAlertCircle className="text-3xl text-red-500" />
                <div>
                  <h3 className="font-bold text-red-800">{criticalCount} Critical Alert{criticalCount > 1 ? 's' : ''}</h3>
                  <p className="text-sm text-red-600">Immediate attention required</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <FiBell className="text-3xl text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{alerts.length}</p>
              <p className="text-sm text-gray-500">Total Alerts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <FiAlertCircle className="text-3xl text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{criticalCount}</p>
              <p className="text-sm text-gray-500">Critical</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <FiAlertTriangle className="text-3xl text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">
                {alerts.filter(a => a.severity === 'warning' && !a.is_resolved).length}
              </p>
              <p className="text-sm text-gray-500">Warnings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <FiCheckCircle className="text-3xl text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{alerts.filter(a => a.is_resolved).length}</p>
              <p className="text-sm text-gray-500">Resolved</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <Select
            options={ALERT_TYPES}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-40"
          />
          <Select
            options={SEVERITIES}
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-40"
          />
        </div>

        {/* Alerts List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiBell className="text-blue-500" />
              Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <div className="text-center py-12">
                <FiCheckCircle className="text-6xl text-green-300 mx-auto mb-4" />
                <p className="text-gray-500">No alerts matching your filters</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${getAlertBg(alert.severity, alert.is_read)} ${!alert.is_read ? 'border-l-4' : ''}`}
                    style={!alert.is_read ? {
                      borderLeftColor: alert.severity === 'critical' ? '#ef4444' : alert.severity === 'warning' ? '#eab308' : '#3b82f6'
                    } : {}}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1 text-xl">
                          {getAlertIcon(alert.severity)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-medium ${alert.is_read ? 'text-gray-600' : 'text-gray-800'}`}>
                              {alert.title}
                            </h3>
                            <Badge status={alert.severity}>{alert.severity_display}</Badge>
                            <Badge variant="secondary">{alert.alert_type_display}</Badge>
                            {alert.is_resolved && <Badge variant="success">Resolved</Badge>}
                          </div>
                          <p className={`text-sm ${alert.is_read ? 'text-gray-500' : 'text-gray-600'}`}>
                            {alert.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {formatDate(alert.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {!alert.is_read && (
                          <Button size="sm" variant="ghost" onClick={() => handleMarkRead(alert.id)}>
                            Mark Read
                          </Button>
                        )}
                        {!alert.is_resolved && (
                          <Button size="sm" variant="outline" onClick={() => handleResolve(alert.id)}>
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alert Rules Modal */}
        <Modal isOpen={showRulesModal} onClose={() => setShowRulesModal(false)} title="Alert Rules" size="lg">
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Configure automatic alerts for various farm events. Enable or disable rules as needed.
            </p>
            {rules.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No alert rules configured</p>
            ) : (
              <div className="space-y-3">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className={`p-4 rounded-lg border ${rule.is_active ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-800">{rule.name}</h3>
                          <Badge variant="secondary">{rule.alert_type_display}</Badge>
                          {!rule.is_active && <Badge variant="secondary">Inactive</Badge>}
                        </div>
                        <p className="text-sm text-gray-500">{rule.message_template}</p>
                        {rule.threshold_value > 0 && (
                          <p className="text-xs text-gray-400 mt-1">Threshold: {rule.threshold_value}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={rule.is_active ? 'outline' : 'primary'}
                          onClick={() => handleToggleRule(rule.id, rule.is_active)}
                        >
                          {rule.is_active ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setShowRulesModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
