import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuth } from './useAuth';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ReactNode } from 'react';

describe('useAuth Hook', () => {
  it('should return context when used inside AuthProvider', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('user');
    expect(result.current).toHaveProperty('login');
    expect(result.current).toHaveProperty('logout');
    expect(result.current).toHaveProperty('hasFeature');
    expect(result.current).toHaveProperty('isAdmin');
  });

  it('should initially have null user', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
  });

  it('should have all required auth methods', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
    expect(typeof result.current.hasFeature).toBe('function');
    expect(typeof result.current.hasAdminFeature).toBe('function');
    expect(typeof result.current.isAdmin).toBe('function');
    expect(typeof result.current.isSuperAdmin).toBe('function');
  });
});
