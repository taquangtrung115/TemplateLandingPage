import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosInstance from '../src/api/axios';
import { authApi } from '../src/api/authApi';
import { userApi } from '../src/api/userApi';
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

  describe('userApi unwrapping', () => {
    it('getUsers unwraps Result<UserResponse[]> with .value', async () => {
      const usersList = [
        { id: '1', email: 'admin@template.com', role: 'Admin' },
        { id: '2', email: 'user@template.com', role: 'User' },
      ];
      axiosInstance.get.mockResolvedValueOnce({
        data: { isSuccess: true, value: usersList },
      });

      const result = await userApi.getUsers();
      expect(result).toEqual(usersList);
      expect(axiosInstance.get).toHaveBeenCalledWith('/users');
    });

    it('getUserById unwraps Result<UserResponse> with .value', async () => {
      const user = { id: '1', email: 'admin@template.com', role: 'Admin' };
      axiosInstance.get.mockResolvedValueOnce({
        data: { isSuccess: true, value: user },
      });

      const result = await userApi.getUserById('1');
      expect(result).toEqual(user);
      expect(axiosInstance.get).toHaveBeenCalledWith('/users/1');
    });

    it('createUser unwraps Result<Guid> with .value', async () => {
      axiosInstance.post.mockResolvedValueOnce({
        data: { isSuccess: true, value: 'new-user-guid' },
      });

      const result = await userApi.createUser({ email: 'create@test.com' });
      expect(result).toBe('new-user-guid');
      expect(axiosInstance.post).toHaveBeenCalledWith('/users', { email: 'create@test.com' });
    });

    it('updateUser unwraps Result with .value or returns response.data', async () => {
      // When backend returns Result with .value
      axiosInstance.put.mockResolvedValueOnce({
        data: { isSuccess: true, value: 'updated-id' },
      });
      const resultWithValue = await userApi.updateUser('1', { fullName: 'Updated' });
      expect(resultWithValue).toBe('updated-id');
      expect(axiosInstance.put).toHaveBeenCalledWith('/users/1', { fullName: 'Updated' });

      // When backend returns Result without .value (e.g. standard Result.Success())
      const voidResult = { isSuccess: true, isFailure: false };
      axiosInstance.put.mockResolvedValueOnce({ data: voidResult });
      const resultVoid = await userApi.updateUser('1', { fullName: 'Updated 2' });
      expect(resultVoid).toEqual(voidResult);
    });

    it('deleteUser unwraps correctly', async () => {
      axiosInstance.delete.mockResolvedValueOnce({
        data: { isSuccess: true, value: true },
      });

      const result = await userApi.deleteUser('1');
      expect(result).toBe(true);
      expect(axiosInstance.delete).toHaveBeenCalledWith('/users/1');
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
  });
});
