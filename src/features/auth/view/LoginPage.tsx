import { View, Text } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../viewmodel/useAuth';
import { AuthScreenWrapper } from './components/AuthScreenWrapper';
import { AuthCard } from './components/AuthCard';
import { AuthInput } from './components/AuthInput';
import { AuthButton } from './components/AuthButton';
import { OAuthButton } from './components/OAuthButton';

export function LoginPage() {
  const { 
    email, 
    setEmail, 
    password, 
    setPassword, 
    isLoading, 
    handleLogin, 
    handleGoogleAuth, 
    handleFacebookAuth 
  } = useAuth();

  return (
    <AuthScreenWrapper>
      <AuthCard>
        <Text className="text-h2 font-sans-bold text-neutral-text mb-6">
          Log in to your Account
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

        <AuthButton 
          title="Sign in" 
          onPress={handleLogin} 
          isLoading={isLoading} 
        />

        <View className="flex-row items-center my-6">
          <View className="flex-1 h-[1px] bg-neutral-border" />
          <Text className="mx-4 text-body-sm text-neutral-muted font-sans-medium">
            – Or sign in with –
          </Text>
          <View className="flex-1 h-[1px] bg-neutral-border" />
        </View>

        <View className="flex-row gap-4 mb-6">
          <OAuthButton provider="Google" onPress={handleGoogleAuth} isLoading={isLoading} />
          <OAuthButton provider="Facebook" onPress={handleFacebookAuth} isLoading={isLoading} />
        </View>

        <View className="flex-row justify-center">
          <Text className="text-body-sm text-neutral-text font-sans">
            Don't have an account?{' '}
          </Text>
          <Link href="/(auth)/register" asChild>
            <Text className="text-body-sm text-secondary-dark font-sans-semibold">
              Sign up
            </Text>
          </Link>
        </View>
      </AuthCard>
    </AuthScreenWrapper>
  );
}
