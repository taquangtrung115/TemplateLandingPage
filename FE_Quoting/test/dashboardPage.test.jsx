import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DashboardPage from '../src/pages/dashboard/DashboardPage';
import { quotationApi } from '../src/api/quotationApi';
import { summary, quotation } from './fixtures';
const navigate = vi.hoisted(() => vi.fn());
vi.mock('react-router-dom', async () => ({ ...await vi.importActual('react-router-dom'), useNavigate: () => navigate }));
vi.mock('../src/api/quotationApi', () => ({ quotationApi: { getQuotations: vi.fn(), getSummary: vi.fn() } }));
vi.mock('recharts', () => ({ ResponsiveContainer: ({ children }) => <div>{children}</div>, AreaChart: ({ data }) => <div data-testid="chart-data">{JSON.stringify(data)}</div>, Area: () => null, XAxis: () => null, YAxis: () => null, CartesianGrid: () => null, Tooltip: () => null }));
beforeEach(() => { vi.clearAllMocks(); quotationApi.getQuotations.mockResolvedValue({ data: [quotation], total: 145 }); quotationApi.getSummary.mockResolvedValue(summary); });
describe('Dashboard uses complete server totals', () => {
  it('shows all 145 quotations even when only recent rows are loaded', async () => {
    render(<MemoryRouter><DashboardPage /></MemoryRouter>);
    expect(await screen.findByText('145')).toBeInTheDocument();
    expect(quotationApi.getQuotations).toHaveBeenCalledWith({ page: 1, pageSize: 5 });
    expect(screen.queryByText('+12% tháng này')).not.toBeInTheDocument();
  });
  it('uses actual year and month keys across year boundaries', async () => {
    quotationApi.getSummary.mockResolvedValue({ ...summary, monthlyAmounts: { '2025-12': 100, '2026-01': 200 } });
    render(<MemoryRouter><DashboardPage /></MemoryRouter>);
    expect(await screen.findByTestId('chart-data')).toHaveTextContent('12/2025');
    expect(screen.getByTestId('chart-data')).toHaveTextContent('01/2026');
  });
  it('shows a load error rather than a misleading zero dashboard', async () => {
    quotationApi.getSummary.mockRejectedValueOnce(new Error('Mất kết nối tổng quan'));
    render(<MemoryRouter><DashboardPage /></MemoryRouter>);
    expect(await screen.findByText('Mất kết nối tổng quan')).toBeInTheDocument();
    expect(screen.queryByTestId('chart-data')).not.toBeInTheDocument();
  });
  it('opens the selected saved quotation', async () => {
    render(<MemoryRouter><DashboardPage /></MemoryRouter>);
    fireEvent.click(await screen.findByRole('button', { name: 'Xem chi tiết' }));
    expect(navigate).toHaveBeenCalledWith(`/quotations/${quotation.id}`);
  });
});
