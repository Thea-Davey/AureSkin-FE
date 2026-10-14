import { View, Text } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../viewmodel/useAuth';
import { AuthScreenWrapper } from './components/AuthScreenWrapper';
import { AuthCard } from './components/AuthCard';
import { AuthInput } from './components/AuthInput';
import { AuthButton } from './components/AuthButton';
import { OAuthButton } from './components/OAuthButton';

export function RegisterPage() {
  const { 
    email, 
    setEmail, 
    password, 
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    passwordMismatch,
    handleRegister, 
    handleGoogleAuth, 
    handleFacebookAuth 
  } = useAuth();

  return (
    <AuthScreenWrapper>
      <AuthCard>
        <Text className="text-h2 font-sans-bold text-neutral-text mb-6">
          Create your Account
        </Text>

        <AuthInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
        />

        <AuthInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!isLoading}
        />

        <AuthInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          editable={!isLoading}
          error={passwordMismatch}
          errorMessage="Passwords do not match"
        />

        <AuthButton 
          title="Sign up" 
          onPress={handleRegister} 
          isLoading={isLoading} 
        />

        <View className="flex-row items-center my-6">
          <View className="flex-1 h-[1px] bg-neutral-border" />
          <Text className="mx-4 text-body-sm text-neutral-muted font-sans-medium">
            – Or sign up with –
          </Text>
          <View className="flex-1 h-[1px] bg-neutral-border" />
        </View>

        <View className="flex-row gap-4 mb-6">
          <OAuthButton provider="Google" onPress={handleGoogleAuth} isLoading={isLoading} />
          <OAuthButton provider="Facebook" onPress={handleFacebookAuth} isLoading={isLoading} />
        </View>

        <View className="flex-row justify-center">
          <Text className="text-body-sm text-neutral-text font-sans">
            Already have an account?{' '}
          </Text>
          <Link href="/(auth)/login" asChild>
            <Text className="text-body-sm text-secondary-dark font-sans-semibold">
              Sign in
            </Text>
          </Link>
        </View>
      </AuthCard>
    </AuthScreenWrapper>
  );
}
