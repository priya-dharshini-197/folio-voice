import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check active session on initial load
  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const data = await api.getMe();
        if (mounted) {
          setUser(data.user);
          setProfile(data.profile);
        }
      } catch (err) {
        // Not logged in or expired cookie
        if (mounted) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    checkSession();
    return () => { mounted = false; };
  }, []);

  async function login(email, password) {
    setError(null);
    try {
      const data = await api.login({ email, password });
      setUser(data.user);
      setProfile(data.profile);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function register(formData) {
    setError(null);
    try {
      const data = await api.register(formData);
      setUser(data.user);
      setProfile(data.profile);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function logout() {
    try {
      await api.logout();
    } catch (err) {
      console.warn('Logout error ignored:', err);
    } finally {
      setUser(null);
      setProfile(null);
    }
  }

  async function refreshProfile() {
    try {
      const data = await api.getProfile();
      setProfile(data.profile);
      return data;
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        error,
        login,
        register,
        logout,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

