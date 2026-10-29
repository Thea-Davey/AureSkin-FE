import { useState } from 'react';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { supabase } from '../../../shared/services/supabase';
import { authApi } from '../model/auth_api';
import { LOGIN_BYPASS, MOCK_BYPASS_SESSION } from '../model/auth_bypass';
import { useAuthStore } from '../../../shared/store/authStore';

export function useAuth() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  // Helper to sync Supabase session after our custom API returns a token
  const syncSupabaseSession = async (accessToken: string, refreshToken: string) => {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    
    if (error) throw error;
    if (data.session) setSession(data.session);
  };

  const handleLogin = async () => {
    // If dev bypass mode is active, log in immediately with mock developer credentials
    if (LOGIN_BYPASS) {
      setIsLoading(true);
      try {
        setSession(MOCK_BYPASS_SESSION);
        Toast.show({
          type: 'info',
          text1: 'Dev Bypass Login',
          text2: 'Welcome to AureSkin offline mode!',
        });
        router.replace('/(tabs)');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!email || !password) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please fill in all fields' });
      return;
    }

    try {
      setIsLoading(true);
      const response = await authApi.login({ email, password });
      
      // Store the session in Supabase client and Zustand
      await syncSupabaseSession(
        response.data.access_token,
        response.data.refresh_token
      );
      
      Toast.show({ type: 'success', text1: 'Welcome back!' });
      router.replace('/(tabs)');
    } catch (error: any) {
      Toast.show({ 
        type: 'error', 
        text1: 'Login Failed', 
        text2: error.message || 'Invalid credentials' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please fill in all fields' });
      return;
    }

    if (password !== confirmPassword) {
      setPasswordMismatch(true);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Passwords do not match' });
      return;
    }
    
    setPasswordMismatch(false);

    if (password.length < 6) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Password must be at least 6 characters' });
      return;
    }

    try {
      setIsLoading(true);
      const response = await authApi.register({ email, password });
      
      // Store session
      await syncSupabaseSession(
        response.data.access_token,
        response.data.refresh_token
      );
      
      Toast.show({ type: 'success', text1: 'Account created successfully!' });
      // Navigate to Terms screen instead of home
      router.push('/(auth)/terms');
    } catch (error: any) {
      Toast.show({ 
        type: 'error', 
        text1: 'Registration Failed', 
        text2: error.message || 'Could not create account' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptTerms = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Not authenticated");

      // Update terms_accepted_at flag in users table
      const { error } = await supabase
        .from('users')
        .update({ terms_accepted_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) {
        console.warn('terms_accepted_at update warning:', error.message);
      }

      router.replace('/(tabs)');
    } catch (error: any) {
      console.warn('Terms accept error:', error);
      router.replace('/(tabs)');
    } finally {
      setIsLoading(false);
    }
  };

  // Provider IDs for Supabase OAuth
  const handleGoogleAuth = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        // redirectTo: 'aure-skin://(tabs)' // Uncomment & configure when deep linking is setup
      });
      if (error) throw error;
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Auth Error', text2: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookAuth = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
      });
      if (error) throw error;
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Auth Error', text2: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    passwordMismatch,
    handleLogin,
    handleRegister,
    handleAcceptTerms,
    handleGoogleAuth,
    handleFacebookAuth,
    isBypassActive: LOGIN_BYPASS,
  };
}
