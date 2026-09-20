import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CustomizerPage from '../src/pages/CustomizerPage';
import { templateApi } from '../src/api/templateApi';
import useAuth from '../src/hooks/useAuth';

vi.mock('../src/api/templateApi', () => ({
  templateApi: {
    getTemplateById: vi.fn(),
  },
}));

vi.mock('../src/hooks/useAuth', () => ({
  default: vi.fn(),
}));

describe('Customizer Live Highlight & useDeferredValue Behavior', () => {
  const mockTemplate = {
    id: 'tpl-highlight-test',
    name: 'Mẫu Thử Highlight',
    slug: 'mau-thu-highlight',
    category: 'Wedding',
    defaultConfigJson: JSON.stringify({
      theme: { primaryColor: '#e11d48' },
      hero: { title: 'Tiêu Đề Ban Đầu', subtitle: 'Phụ đề ban đầu' },
      coupleOrCelebrant: {
        type: 'wedding',
        person1: { name: 'Người 1', title: 'Chú Rể' },
      },
    }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: null, isAuthenticated: false });
    templateApi.getTemplateById.mockResolvedValue(mockTemplate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('activates .animate-live-edit on section edit and automatically extinguishes after 900ms', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/customize/tpl-highlight-test']}>
        <Routes>
          <Route path="/customize/:templateId" element={<CustomizerPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Mẫu Thử Highlight - Thiệp Mời')).toBeInTheDocument();
    });

    // Navigate to Hero tab ("Màn hình đầu")
    const heroTabBtn = screen.getByRole('button', { name: /màn hình đầu/i });
    fireEvent.click(heroTabBtn);

    // Locate Hero section in preview
    const heroEl = container.querySelector('header');
    expect(heroEl).not.toHaveClass('animate-live-edit');

    // Switch to fake timers for testing the 900ms duration
    vi.useFakeTimers();

    // Trigger edit on hero title input
    const heroTitleInput = screen.getByDisplayValue('Tiêu Đề Ban Đầu');
    fireEvent.change(heroTitleInput, { target: { value: 'Tiêu Đề Đã Sửa' } });

    // Live edit feedback class should now be added to HeroSection
    expect(container.querySelector('header')).toHaveClass('animate-live-edit');

    // Advance by 899ms -> highlight should STILL be active
    act(() => {
      vi.advanceTimersByTime(899);
    });
    expect(container.querySelector('header')).toHaveClass('animate-live-edit');

    // Advance 1ms more -> reaches 900ms, highlight should extinguish (turn off)
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(container.querySelector('header')).not.toHaveClass('animate-live-edit');
  });

  it('resets the 900ms extinguish timer when user types continuously', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/customize/tpl-highlight-test']}>
        <Routes>
          <Route path="/customize/:templateId" element={<CustomizerPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Mẫu Thử Highlight - Thiệp Mời')).toBeInTheDocument();
    });

    // Navigate to Hero tab ("Màn hình đầu")
    const heroTabBtn = screen.getByRole('button', { name: /màn hình đầu/i });
    fireEvent.click(heroTabBtn);

    vi.useFakeTimers();

    const heroTitleInput = screen.getByDisplayValue('Tiêu Đề Ban Đầu');

    // First keypress at t = 0ms
    fireEvent.change(heroTitleInput, { target: { value: 'A' } });
    expect(container.querySelector('header')).toHaveClass('animate-live-edit');

    // Advance 500ms
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(container.querySelector('header')).toHaveClass('animate-live-edit');

    // Second keypress at t = 500ms (resets timer for another 900ms)
    fireEvent.change(heroTitleInput, { target: { value: 'AB' } });
    expect(container.querySelector('header')).toHaveClass('animate-live-edit');

    // Advance 500ms (total elapsed 1000ms from start, but only 500ms from 2nd keystroke)
    act(() => {
      vi.advanceTimersByTime(500);
    });
    // Should STILL be highlighted because timer was reset!
    expect(container.querySelector('header')).toHaveClass('animate-live-edit');

    // Advance 400ms more (reaches 900ms from 2nd keystroke)
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(container.querySelector('header')).not.toHaveClass('animate-live-edit');
  });

  it('cleans up highlight timer on unmount', async () => {
    const { unmount } = render(
      <MemoryRouter initialEntries={['/customize/tpl-highlight-test']}>
        <Routes>
          <Route path="/customize/:templateId" element={<CustomizerPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Mẫu Thử Highlight - Thiệp Mời')).toBeInTheDocument();
    });

    // Trigger an edit so highlightTimeoutRef is active
    const heroTabBtn = screen.getByRole('button', { name: /màn hình đầu/i });
    fireEvent.click(heroTabBtn);

    const heroTitleInput = screen.getByDisplayValue('Tiêu Đề Ban Đầu');
    fireEvent.change(heroTitleInput, { target: { value: 'Triggering timeout' } });

    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
    unmount();
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
