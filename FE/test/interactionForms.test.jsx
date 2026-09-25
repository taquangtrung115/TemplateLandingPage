import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { RsvpSection } from '../src/components/templates/sections/RsvpSection';
import { WishesSection } from '../src/components/templates/sections/WishesSection';
import { interactionApi } from '../src/api/interactionApi';

vi.mock('../src/api/interactionApi', () => ({
  interactionApi: {
    submitRsvp: vi.fn(),
    getGuestbook: vi.fn(),
    submitGuestbook: vi.fn(),
  },
}));

describe('public response forms', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    interactionApi.getGuestbook.mockResolvedValue({ data: [], total: 0 });
  });

  it('keeps RSVP input and shows an error when the API rejects the response', async () => {
    interactionApi.submitRsvp.mockRejectedValueOnce(new Error('Request failed'));

    render(
      <RsvpSection
        rsvp={{ enabled: true }}
        customizationId="site-1"
        customizationVersionId="version-1"
      />
    );

    const name = screen.getByPlaceholderText('Ví dụ: Nguyễn Văn A');
    fireEvent.change(name, { target: { value: 'Nguyễn An' } });
    fireEvent.click(screen.getByRole('button', { name: /gửi phản hồi tham dự/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/không gửi được phản hồi/i);
    expect(name).toHaveValue('Nguyễn An');
    expect(screen.queryByText('Cảm ơn bạn đã phản hồi!')).not.toBeInTheDocument();
    expect(interactionApi.submitRsvp).toHaveBeenCalledWith(expect.objectContaining({
      customizationId: 'site-1',
      customizationVersionId: 'version-1',
      guestName: 'Nguyễn An',
    }));
  });

  it('submits an RSVP once while a slow request is in flight', async () => {
    let completeRequest;
    interactionApi.submitRsvp.mockImplementationOnce(() => new Promise((resolve) => {
      completeRequest = resolve;
    }));

    render(
      <RsvpSection
        rsvp={{ enabled: true }}
        customizationId="site-1"
        customizationVersionId="version-2"
      />
    );
    fireEvent.change(screen.getByPlaceholderText('Ví dụ: Nguyễn Văn A'), { target: { value: 'Minh' } });
    const form = screen.getByRole('button', { name: /gửi phản hồi tham dự/i }).closest('form');

    fireEvent.submit(form);
    fireEvent.submit(form);

    expect(interactionApi.submitRsvp).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Đang gửi...' })).toBeDisabled();

    await act(async () => { completeRequest({ id: 'rsvp-1' }); });
    expect(await screen.findByText('Cảm ơn bạn đã phản hồi!')).toBeInTheDocument();
  });

  it('keeps guestbook input on API failure and does not insert a fake success entry', async () => {
    interactionApi.submitGuestbook.mockRejectedValueOnce(new Error('Request failed'));

    render(
      <WishesSection
        wishes={{ enabled: true }}
        customizationId="site-1"
        customizationVersionId="version-3"
      />
    );

    const name = screen.getByPlaceholderText('Tên của bạn *');
    const message = screen.getByPlaceholderText('Viết lời chúc tại đây... *');
    fireEvent.change(name, { target: { value: 'Lan' } });
    fireEvent.change(message, { target: { value: 'Chúc hai bạn hạnh phúc' } });
    fireEvent.click(screen.getByRole('button', { name: 'Gửi Lời Chúc' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/không gửi được lời chúc/i);
    expect(name).toHaveValue('Lan');
    expect(message).toHaveValue('Chúc hai bạn hạnh phúc');
    expect(screen.queryByText('Chúc hai bạn hạnh phúc', { selector: 'p' })).not.toBeInTheDocument();
    expect(interactionApi.submitGuestbook).toHaveBeenCalledWith(expect.objectContaining({
      customizationId: 'site-1',
      customizationVersionId: 'version-3',
      senderName: 'Lan',
      message: 'Chúc hai bạn hạnh phúc',
    }));
  });

  it('does not render or submit public forms in a preview', async () => {
    render(
      <>
        <RsvpSection
          rsvp={{ enabled: true }}
          customizationId="site-1"
          customizationVersionId="version-4"
          isPreview
        />
        <WishesSection
          wishes={{ enabled: true }}
          customizationId="site-1"
          customizationVersionId="version-4"
          isPreview
        />
      </>
    );

    expect(screen.getByText('Bản xem trước không gửi phản hồi.')).toBeInTheDocument();
    expect(screen.getByText('Bản xem trước không gửi lời chúc.')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Ví dụ: Nguyễn Văn A')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Tên của bạn *')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /gửi phản hồi tham dự/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Gửi Lời Chúc' })).not.toBeInTheDocument();

    await waitFor(() => expect(interactionApi.getGuestbook).not.toHaveBeenCalled());
    expect(interactionApi.submitRsvp).not.toHaveBeenCalled();
    expect(interactionApi.submitGuestbook).not.toHaveBeenCalled();
  });
});
