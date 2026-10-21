import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  Image,
  Animated,
  useWindowDimensions,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, LogOut } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../services/supabase';
import { theme } from '../theme';

export function MenuOverlay() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const drawerWidth = Math.min(screenWidth * 0.8, 340);

  const isMenuOpen = useAppStore((state) => state.isMenuOpen);
  const closeMenuStore = useAppStore((state) => state.closeMenu);
  const user = useAuthStore((state) => state.user);

  // Local state to keep modal mounted while exit animation finishes
  const [visible, setVisible] = useState(false);

  // Animated values
  const translateX = useRef(new Animated.Value(-drawerWidth)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Handle slide-in and slide-out transitions
  useEffect(() => {
    if (isMenuOpen) {
      setVisible(true);
      translateX.setValue(-drawerWidth);
      backdropOpacity.setValue(0);

      // Entry: Slides in with smooth spring, backdrop fades in simultaneously
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(translateX, {
          toValue: 0,
          damping: 24,
          stiffness: 220,
          mass: 0.8,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (visible) {
      // Exit: Slides back out to the left, backdrop fades out simultaneously
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: -drawerWidth,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setVisible(false);
      });
    }
  }, [isMenuOpen, drawerWidth]);

  const handleClose = () => {
    closeMenuStore();
  };

  const handleLogout = async () => {
    handleClose();
    await supabase.auth.signOut();
  };

  const handleNavigate = (path: string) => {
    handleClose();
    router.push(path as any);
  };

  if (!visible && !isMenuOpen) {
    return null;
  }

  const displayName =
    user?.user_metadata?.display_name ||
    user?.email?.split('@')[0] ||
    'User Name';

  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={StyleSheet.absoluteFill}>
        {/* Animated Dark Backdrop */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: 'rgba(0, 0, 0, 0.55)',
              opacity: backdropOpacity,
            },
          ]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>

        {/* Animated Sliding Drawer Container */}
        <Animated.View
          style={{
            width: drawerWidth,
            height: '100%',
            backgroundColor: theme.colors.background,
            transform: [{ translateX }],
            shadowColor: theme.colors.text,
            shadowOffset: { width: 4, height: 0 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 20,
          }}
        >
          {/* Top Olive Green Section */}
          <SafeAreaView
            edges={['top']}
            style={{ backgroundColor: theme.colors.primary }}
          >
            <View className="px-6 pt-3 pb-6 bg-primary">
              {/* Header Row: Title & Close Button */}
              <View className="flex-row items-center justify-between mb-5">
                <Text className="text-h1 font-sans-bold text-neutral-white">
                  AureSkin
                </Text>
                <TouchableOpacity
                  onPress={handleClose}
                  hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
                  activeOpacity={0.7}
                >
                  <X size={26} color={theme.colors.card} />
                </TouchableOpacity>
              </View>

              {/* User Avatar & Name & View Profile */}
              <View className="flex-row items-center">
                <Image
                  source={{ uri: avatarUrl }}
                  className="w-14 h-14 rounded-full border-2 border-white/70 mr-4 bg-neutral-border"
                />
                <View className="flex-1">
                  <Text
                    className="text-h3 font-sans-bold text-neutral-white"
                    numberOfLines={1}
                  >
                    {displayName}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleNavigate('/profile')}
                    activeOpacity={0.7}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Text className="text-body-sm text-neutral-white/80 font-sans-medium mt-0.5">
                      View Profile
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </SafeAreaView>

          {/* Middle Navigation Links */}
          <View className="flex-1 pt-6">
            {/* Favorites */}
            <View className="border-t border-neutral-border/100">
              <Pressable
                onPress={() => handleNavigate('/favorites')}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.6 : 1,
                    backgroundColor: pressed ? 'rgba(0,0,0,0.03)' : 'transparent',
                  },
                ]}
                className="py-4 px-6"
              >
                <Text className="text-body font-sans-semibold text-neutral-text">
                  Favorites
                </Text>
              </Pressable>
            </View>

            {/* About */}
            <View className="border-t border-neutral-border/100">
              <Pressable
                onPress={() => handleNavigate('/about')}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.6 : 1,
                    backgroundColor: pressed ? 'rgba(0,0,0,0.03)' : 'transparent',
                  },
                ]}
                className="py-4 px-6"
              >
                <Text className="text-body font-sans-semibold text-neutral-text">
                  About
                </Text>
              </Pressable>
            </View>

            {/* Help */}
            <View className="border-t border-b border-neutral-border/100">
              <Pressable
                onPress={() => handleNavigate('/help')}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.6 : 1,
                    backgroundColor: pressed ? 'rgba(0,0,0,0.03)' : 'transparent',
                  },
                ]}
                className="py-4 px-6"
              >
                <Text className="text-body font-sans-semibold text-neutral-text">
                  Help
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Bottom Log out Button with Press Scale-down effect */}
          <SafeAreaView edges={['bottom']}>
            <View className="px-6 pb-6 pt-2">
              <Pressable
                onPress={handleLogout}
                style={({ pressed }) => [
                  {
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
                className="flex-row items-center justify-center py-3.5 px-6 rounded-full bg-secondary shadow-sm"
              >
                <LogOut size={20} color={theme.colors.card} />
                <Text className="text-neutral-white font-sans-bold text-body ml-2.5">
                  Log out
                </Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}
