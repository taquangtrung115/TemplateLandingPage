import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosInstance from '../src/api/axios';
import { authApi } from '../src/api/authApi';
import { workspaceApi } from '../src/api/workspaceApi';
import { customizationApi } from '../src/api/customizationApi';
import { interactionApi } from '../src/api/interactionApi';

// Mock the axios instance methods
vi.mock('../src/api/axios', () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    },
  };
});

describe('API Layer Result Unwrapping', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('authApi unwrapping', () => {
    it('login unwraps Result<LoginResponse> with .value', async () => {
      const mockResult = {
        isSuccess: true,
        value: {
          token: 'jwt-admin-token',
          user: { id: 'u-1', email: 'admin@template.com', role: 'Admin' },
        },
      };
      axiosInstance.post.mockResolvedValueOnce({ data: mockResult });

      const result = await authApi.login({ email: 'admin@template.com', password: 'Password123!' });
      expect(result).toEqual(mockResult.value);
    });

    it('login handles raw object response without .value wrapper', async () => {
      const rawPayload = {
        token: 'jwt-raw-token',
        user: { id: 'u-2', email: 'user@template.com', role: 'User' },
      };
      axiosInstance.post.mockResolvedValueOnce({ data: rawPayload });

      const result = await authApi.login({ email: 'user@template.com', password: 'Password123!' });
      expect(result).toEqual(rawPayload);
    });

    it('register unwraps Result<Guid> with .value', async () => {
      const mockResult = {
        isSuccess: true,
        value: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
      };
      axiosInstance.post.mockResolvedValueOnce({ data: mockResult });

      const result = await authApi.register({
        email: 'new@template.com',
        password: 'Password123!',
        fullName: 'New User',
      });
      expect(result).toBe('9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d');
    });

    it('getMe unwraps Result<UserResponse> with .value', async () => {
      const mockResult = {
        isSuccess: true,
        value: { id: 'u-1', email: 'admin@template.com', fullName: 'Admin', role: 'Admin' },
      };
      axiosInstance.get.mockResolvedValueOnce({ data: mockResult });

      const result = await authApi.getMe();
      expect(result).toEqual(mockResult.value);
    });
  });

  describe('workspace membership API contracts', () => {
    it('reads only current workspace members with pagination and cancellation', async () => {
      const payload = { items: [{ id: 'one', role: 'Admin' }] };
      axiosInstance.get.mockResolvedValueOnce({ data: { value: payload } });
      const signal = new AbortController().signal;
      expect(await workspaceApi.members(2, signal)).toEqual(payload);
      expect(axiosInstance.get).toHaveBeenCalledWith('/members', { params: { page: 2 }, signal });
    });
    it('changes membership instead of the global identity', async () => {
      const member = { email: 'one@test.com', role: 'User', isActive: false };
      axiosInstance.put.mockResolvedValueOnce({ data: { value: member } });
      expect(await workspaceApi.setMember(member)).toEqual(member);
      expect(axiosInstance.put).toHaveBeenCalledWith('/members', member);
    });
    it('enumerates only landing contexts', async () => {
      axiosInstance.get.mockResolvedValueOnce({ data: { value: { items: [] } } });
      expect(await workspaceApi.contexts()).toEqual({ items: [] });
      expect(axiosInstance.get).toHaveBeenCalledWith('/auth/contexts', { params: { appKey: 'landing', page: 1 }, signal: undefined });
    });
  });

  describe('customizationApi unwrapping', () => {
    it('saveCustomization unwraps Result<Guid> with .value', async () => {
      axiosInstance.post.mockResolvedValueOnce({
        data: { isSuccess: true, value: 'customization-id-123' },
      });

      const result = await customizationApi.saveCustomization({ title: 'Wedding Card' });
      expect(result).toBe('customization-id-123');
    });

    it('getCustomizationBySlug unwraps Result with .value', async () => {
      const customization = { id: 'c1', slug: 'my-wedding', title: 'Wedding Card' };
      axiosInstance.get.mockResolvedValueOnce({
        data: { isSuccess: true, value: customization },
      });

      const result = await customizationApi.getCustomizationBySlug('my-wedding');
      expect(result).toEqual(customization);
    });

    it('getMyCustomizations unwraps array of customizations', async () => {
      const list = [{ id: 'c1' }, { id: 'c2' }];
      axiosInstance.get.mockResolvedValueOnce({
        data: { isSuccess: true, value: list },
      });

      const result = await customizationApi.getMyCustomizations();
      expect(result).toEqual(list);
    });

    it('deleteCustomization unwraps response', async () => {
      axiosInstance.delete.mockResolvedValueOnce({
        data: { isSuccess: true, value: true },
      });

      const result = await customizationApi.deleteCustomization('c1');
      expect(result).toBe(true);
    });
  });

  describe('interactionApi unwrapping', () => {
    it('submitRsvp unwraps Result with .value', async () => {
      axiosInstance.post.mockResolvedValueOnce({
        data: { isSuccess: true, value: 'rsvp-guid-456' },
      });

      const result = await interactionApi.submitRsvp({ guestName: 'John Doe', attending: true });
      expect(result).toBe('rsvp-guid-456');
    });

    it('getRsvps unwraps array of rsvps', async () => {
      const rsvps = [{ id: 'r1', guestName: 'John' }, { id: 'r2', guestName: 'Jane' }];
      axiosInstance.get.mockResolvedValueOnce({
        data: { isSuccess: true, value: rsvps },
      });

      const result = await interactionApi.getRsvps('cust-1');
      expect(result).toEqual(rsvps);
    });

    it('submitGuestbook and getGuestbook unwrap correctly', async () => {
      axiosInstance.post.mockResolvedValueOnce({
        data: { isSuccess: true, value: 'gb-guid-789' },
      });
      const postRes = await interactionApi.submitGuestbook({ senderName: 'Alice', message: 'Congrats!' });
      expect(postRes).toBe('gb-guid-789');

      const messages = [{ id: 'm1', message: 'Best wishes' }];
      axiosInstance.get.mockResolvedValueOnce({
        data: { isSuccess: true, value: messages },
      });
      const getRes = await interactionApi.getGuestbook('cust-1');
      expect(getRes).toEqual(messages);
    });

    it('rejects explicit failed RSVP and guestbook Result envelopes', async () => {
      axiosInstance.post
        .mockResolvedValueOnce({ data: { isSuccess: false, error: 'RSVP disabled for this version' } })
        .mockResolvedValueOnce({ data: { isSuccess: false, error: 'Guestbook disabled for this version' } });

      await expect(interactionApi.submitRsvp({ customizationVersionId: 'private-version' }))
        .rejects.toThrow('The interaction request was rejected.');
      await expect(interactionApi.submitGuestbook({ customizationVersionId: 'private-version' }))
        .rejects.toThrow('The interaction request was rejected.');
    });
  });
});
