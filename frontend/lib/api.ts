const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8021/api/v1';

interface ApiOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;
    const token = this.getToken();

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Token ${token}` } : {}),
        ...headers,
      },
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${endpoint}`, config);

    if (!response.ok) {
      if (response.status === 401) {
        this.setToken(null);
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || 'Request failed');
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Auth
  async login(phone: string, password: string) {
    const data = await this.request<{ token: string }>('/auth/login/', {
      method: 'POST',
      body: { username: phone, password },
    });
    this.setToken(data.token);
    return data;
  }

  async logout() {
    try {
      await this.request('/auth/logout/', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  async getCurrentUser() {
    return this.request<any>('/auth/me/');
  }

  // Dashboard
  async getOwnerDashboard() {
    return this.request<any>('/dashboard/owner/');
  }

  async getWorkerDashboard() {
    return this.request<any>('/dashboard/worker/');
  }

  // Cows
  async getCows(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/cows/${query}`);
  }

  async getCow(id: number) {
    return this.request<any>(`/cows/${id}/`);
  }

  async createCow(data: any) {
    return this.request<any>('/cows/', { method: 'POST', body: data });
  }

  async updateCow(id: number, data: any) {
    return this.request<any>(`/cows/${id}/`, { method: 'PATCH', body: data });
  }

  async updateCowStatus(id: number, toStatus: string, notes?: string) {
    return this.request<any>(`/cows/${id}/update_status/`, {
      method: 'POST',
      body: { to_status: toStatus, notes },
    });
  }

  async getCowStats() {
    return this.request<any>('/cows/stats/');
  }

  // Milk Logs
  async getMilkLogs(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/milk/logs/${query}`);
  }

  async createMilkLog(data: any) {
    return this.request<any>('/milk/logs/', { method: 'POST', body: data });
  }

  async getTodayMilkLogs() {
    return this.request<any>('/milk/logs/today/');
  }

  async getMilkSummary(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/milk/logs/summary/${query}`);
  }

  // Feeds
  async getFeedItems() {
    return this.request<any>('/feeds/items/');
  }

  async createFeedUsage(data: any) {
    return this.request<any>('/feeds/usage/', { method: 'POST', body: data });
  }

  async getInventoryBalances() {
    return this.request<any>('/inventory/balances/');
  }

  async getLowStockItems() {
    return this.request<any>('/inventory/balances/low_stock/');
  }

  // Health
  async getHealthEvents(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/health/events/${query}`);
  }

  async createHealthEvent(data: any) {
    return this.request<any>('/health/events/', { method: 'POST', body: data });
  }

  async createTreatment(data: any) {
    return this.request<any>('/health/treatments/', { method: 'POST', body: data });
  }

  async getActiveWithdrawals() {
    return this.request<any>('/health/withdrawals/active/');
  }

  async getVaccinationsDue(days: number = 7) {
    return this.request<any>(`/vaccinations/due/?days=${days}`);
  }

  // Tasks
  async getTodayTasks() {
    return this.request<any>('/tasks/today/');
  }

  async getMyTasks() {
    return this.request<any>('/tasks/my_tasks/');
  }

  async completeTask(id: number, data?: { comment?: string }) {
    return this.request<any>(`/tasks/${id}/complete/`, { method: 'POST', body: data });
  }

  async skipTask(id: number, reason?: string) {
    return this.request<any>(`/tasks/${id}/skip/`, { method: 'POST', body: { reason } });
  }

  async generateDailyTasks() {
    return this.request<any>('/tasks/generate_daily/', { method: 'POST' });
  }

  // Milk Production Analytics
  async getTopProducers(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/milk/logs/top_producers/${query}`);
  }

  // Feed Items & Purchases
  async createFeedItem(data: any) {
    return this.request<any>('/feeds/items/', { method: 'POST', body: data });
  }

  async getFeedPurchases() {
    return this.request<any>('/feeds/purchases/');
  }

  async createFeedPurchase(data: any) {
    return this.request<any>('/feeds/purchases/', { method: 'POST', body: data });
  }

  // Health - Resolve
  async resolveHealthEvent(id: number, data: any) {
    return this.request<any>(`/health/events/${id}/resolve/`, { method: 'POST', body: data });
  }

  // Task Templates & Instances
  async getTaskTemplates() {
    return this.request<any>('/tasks/templates/');
  }

  async createTaskTemplate(data: any) {
    return this.request<any>('/tasks/templates/', { method: 'POST', body: data });
  }

  async getTaskInstances(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/tasks/instances/${query}`);
  }

  async createTaskInstance(data: any) {
    return this.request<any>('/tasks/instances/', { method: 'POST', body: data });
  }

  async getWorkers() {
    return this.request<any>('/farm/workers/');
  }

  // Sales
  async getSales(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/sales/${query}`);
  }

  async createSale(data: any) {
    return this.request<any>('/sales/', { method: 'POST', body: data });
  }

  async getSalesSummary(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/sales/summary/${query}`);
  }

  async checkWithdrawal() {
    return this.request<any>('/sales/check_withdrawal/');
  }

  // Buyers
  async getBuyers() {
    return this.request<any>('/buyers/');
  }

  async createBuyer(data: any) {
    return this.request<any>('/buyers/', { method: 'POST', body: data });
  }

  // Payments
  async getPayments() {
    return this.request<any>('/payments/');
  }

  async createPayment(data: any) {
    return this.request<any>('/payments/', { method: 'POST', body: data });
  }

  // Alerts
  async getAlerts(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/alerts/${query}`);
  }

  async getOpenAlerts() {
    return this.request<any>('/alerts/open/');
  }

  async getAlertsSummary() {
    return this.request<any>('/alerts/summary/');
  }

  async markAlertRead(id: number) {
    return this.request<any>(`/alerts/${id}/mark_read/`, { method: 'POST' });
  }

  async markAllAlertsRead() {
    return this.request<any>('/alerts/mark_all_read/', { method: 'POST' });
  }

  async resolveAlert(id: number, note?: string) {
    return this.request<any>(`/alerts/${id}/resolve/`, { method: 'POST', body: { note } });
  }

  // Alert Rules
  async getAlertRules() {
    return this.request<any>('/alerts/rules/');
  }

  async updateAlertRule(id: number, data: any) {
    return this.request<any>(`/alerts/rules/${id}/`, { method: 'PATCH', body: data });
  }

  // Notifications
  async getUnreadNotifications() {
    return this.request<any>('/notifications/unread/');
  }

  async markNotificationRead(id: number) {
    return this.request<any>(`/notifications/${id}/mark_read/`, { method: 'POST' });
  }
}

export const api = new ApiClient();
export default api;
