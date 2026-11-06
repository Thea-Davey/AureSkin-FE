import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Lock,
  Pencil,
  UserRound,
  X,
} from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarPickerModal } from '../../../shared/components/CalendarPickerModal';
import { theme } from '../../../shared/theme';
import { COMMON_ALLERGENS, GENDER_OPTIONS, GenderOption } from '../model/profile_types';
import { useEditProfile } from '../viewmodel/useEditProfile';
import { DiscardDialog } from './components/DiscardDialog';
import { ProfileFormField } from './components/ProfileFormField';

const inputStyle =
  'rounded-input bg-card border border-border/60 px-4 py-3 text-body-sm font-sans text-text';

export function EditProfilePage() {
  const profile = useEditProfile();
  const avatarUri = profile.draft.avatarUri;
  const [isAllergenDropdownOpen, setIsAllergenDropdownOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, 24);

  return (
    <View className="flex-1 bg-primary">
      <StatusBar style="light" />

      {/* Top Olive Green Header with Safe Area Spacing */}
      <View
        style={{ paddingTop: topInset + 8, paddingBottom: 16 }}
        className="px-5 relative items-center justify-center z-20"
      >
        {/* Top-Right Close Button */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Back to profile"
          onPress={profile.actions.cancel}
          activeOpacity={0.7}
          style={{ top: topInset + 4 }}
          className="absolute right-5 w-10 h-10 items-center justify-center z-30"
        >
          <X size={24} color={theme.colors.card} />
        </TouchableOpacity>

        {/* Centered Avatar Overlapping the Curved Outer Container */}
        <View
          style={{ marginBottom: -56 }}
          className="items-center z-30"
        >
          <View className="relative">
            {avatarUri ? (
              <Image
                accessibilityLabel="Profile photo preview"
                source={{ uri: avatarUri }}
                className="h-28 w-28 rounded-full border-4 border-card bg-card shadow-md"
              />
            ) : (
              <View className="h-28 w-28 items-center justify-center rounded-full border-4 border-card bg-neutral-offwhite shadow-md">
                <UserRound size={44} color={theme.colors.muted} />
              </View>
            )}

            {/* Floating Pencil Button at bottom-right */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Choose profile photo"
              accessibilityState={{ disabled: profile.isPickingAvatar }}
              disabled={profile.isPickingAvatar}
              onPress={() => void profile.actions.pickAvatar()}
              className="absolute bottom-0 right-1 h-9 w-9 items-center justify-center rounded-full border-2 border-card bg-primary active:opacity-80"
            >
              {profile.isPickingAvatar ? (
                <ActivityIndicator size="small" color={theme.colors.white} />
              ) : (
                <Pencil size={15} color={theme.colors.white} />
              )}
            </Pressable>
          </View>
        </View>
      </View>

      {/* OUTER BACKGROUND CONTAINER WITH CURVED TOP CORNERS */}
      <View
        style={{
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          overflow: 'hidden',
          backgroundColor: theme.colors.offwhitebg,
        }}
        className="flex-1 bg-offwhitebg rounded-t-[32px] z-10"
      >
        {/* FIXED TITLE: Everything above Edit Profile and the title text itself is fixed */}
        <View className="px-5 pt-10 pb-2 bg-offwhitebg z-20">
          <Text className="text-h1 font-sans-bold text-text">
            Edit Profile
          </Text>
        </View>

        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            className="flex-1 px-5"
            contentContainerStyle={{ paddingTop: 6, paddingBottom: 24 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >

            {/* =========================================================================
                CATEGORY 1: GENERAL INFORMATION
               ========================================================================= */}
            <View className="mb-4">
              <Text className="text-caption font-sans-bold text-secondary uppercase tracking-wider mb-2.5">
                GENERAL INFORMATION
              </Text>

              {/* First Name */}
              <ProfileFormField label="First Name">
                <TextInput
                  accessibilityLabel="First Name"
                  value={profile.draft.firstName}
                  onChangeText={(firstName) => profile.actions.updateDraft({ firstName })}
                  placeholder="Enter first name"
                  placeholderTextColor={theme.colors.muted}
                  autoCapitalize="words"
                  className={inputStyle}
                />
              </ProfileFormField>

              {/* Last Name */}
              <ProfileFormField label="Last Name">
                <TextInput
                  accessibilityLabel="Last Name"
                  value={profile.draft.lastName}
                  onChangeText={(lastName) => profile.actions.updateDraft({ lastName })}
                  placeholder="Enter last name"
                  placeholderTextColor={theme.colors.muted}
                  autoCapitalize="words"
                  className={inputStyle}
                />
              </ProfileFormField>

              {/* Username */}
              <ProfileFormField label="Username">
                <TextInput
                  accessibilityLabel="Username"
                  value={profile.draft.username}
                  onChangeText={(username) => profile.actions.updateDraft({ username })}
                  placeholder="@username"
                  placeholderTextColor={theme.colors.muted}
                  autoCapitalize="none"
                  className={inputStyle}
                />
              </ProfileFormField>

              {/* Date of Birth */}
              <ProfileFormField label="Date of Birth">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Select date of birth"
                  onPress={profile.actions.openDatePicker}
                  className={`${inputStyle} flex-row items-center justify-between`}
                >
                  <Text
                    className={`text-body-sm font-sans ${profile.draft.dateOfBirth ? 'text-text' : 'text-muted'
                      }`}
                  >
                    {profile.draft.dateOfBirth || 'YYYY-MM-DD'}
                  </Text>
                  <Calendar size={18} color={theme.colors.muted} />
                </Pressable>
              </ProfileFormField>

              {/* Gender */}
              <ProfileFormField label="Gender" className="mb-1">
                <View className="flex-row flex-wrap gap-2">
                  {GENDER_OPTIONS.map((option: GenderOption) => {
                    const isSelected = profile.draft.gender === option;
                    return (
                      <Pressable
                        key={option}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isSelected }}
                        onPress={() => profile.actions.updateDraft({ gender: option })}
                        className={`rounded-badge px-3.5 py-1.5 border ${isSelected
                          ? 'bg-primary/15 border-primary'
                          : 'bg-card border-border/60'
                          }`}
                      >
                        <Text
                          className={`text-caption ${isSelected
                            ? 'font-sans-semibold text-primary'
                            : 'font-sans text-text'
                            }`}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ProfileFormField>
            </View>

            {/* =========================================================================
                CATEGORY 2: ACCOUNT & CONTACT
               ========================================================================= */}
            <View className="mb-4">
              <Text className="text-caption font-sans-bold text-secondary uppercase tracking-wider mb-2.5 mt-2">
                ACCOUNT & CONTACT
              </Text>

              {/* Email Address */}
              <ProfileFormField label="Email Address">
                <TextInput
                  accessibilityLabel="Email Address"
                  value={profile.draft.email}
                  onChangeText={(email) => profile.actions.updateDraft({ email })}
                  placeholder="name@example.com"
                  placeholderTextColor={theme.colors.muted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className={inputStyle}
                />
              </ProfileFormField>

              {/* Phone Number */}
              <ProfileFormField label="Phone Number" className="mb-1">
                <TextInput
                  accessibilityLabel="Phone Number"
                  value={profile.draft.phoneNumber}
                  onChangeText={(phoneNumber) => profile.actions.updateDraft({ phoneNumber })}
                  placeholder="+63 912 345 6789"
                  placeholderTextColor={theme.colors.muted}
                  keyboardType="phone-pad"
                  className={inputStyle}
                />
              </ProfileFormField>
            </View>

            {/* =========================================================================
                CATEGORY 3: SKIN & HEALTH PROFILE
               ========================================================================= */}
            <View className="mb-4">
              <Text className="text-caption font-sans-bold text-secondary uppercase tracking-wider mb-2.5 mt-2">
                SKIN & HEALTH PROFILE
              </Text>

              {/* Allergen Field & Dropdown Accordion */}
              <ProfileFormField label="Allergen" className="mb-2">
                {/* Dropdown Capsule matching target reference */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Toggle allergens picker"
                  onPress={() => setIsAllergenDropdownOpen(!isAllergenDropdownOpen)}
                  className={`${inputStyle} flex-row items-center justify-between`}
                >
                  <Text
                    className={`text-body-sm font-sans ${profile.draft.allergens.length > 0 ? 'text-text' : 'text-muted'
                      }`}
                  >
                    {profile.draft.allergens.length > 0
                      ? `${profile.draft.allergens.length} allergen(s) selected`
                      : 'Allergen'}
                  </Text>
                  {isAllergenDropdownOpen ? (
                    <ChevronUp size={18} color={theme.colors.text} />
                  ) : (
                    <ChevronDown size={18} color={theme.colors.text} />
                  )}
                </Pressable>

                {/* Active Selected Allergens Tag Chips */}
                {profile.draft.allergens.length > 0 ? (
                  <View className="flex-row flex-wrap gap-2 mt-2.5">
                    {profile.draft.allergens.map((allergen, index) => (
                      <View
                        key={`${allergen}-${index}`}
                        className="flex-row items-center gap-1.5 rounded-badge bg-primary/10 border border-primary/20 px-3 py-1.5"
                      >
                        <Text className="text-caption font-sans-semibold text-primary">
                          {allergen}
                        </Text>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Remove ${allergen}`}
                          onPress={() => profile.actions.removeAllergen(allergen)}
                          hitSlop={8}
                        >
                          <X size={13} color={theme.colors.primary} />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                ) : null}

                {/* Expanded Allergen Presets & Custom Input */}
                {isAllergenDropdownOpen ? (
                  <View className="mt-2.5 p-3 rounded-card border border-border/80 bg-card">
                    <Text className="text-caption font-sans-medium text-muted mb-2">
                      Tap common allergens to select or unselect:
                    </Text>
                    <View className="flex-row flex-wrap gap-1.5 mb-3">
                      {COMMON_ALLERGENS.map((item) => {
                        const isSelected = profile.draft.allergens.includes(item);
                        return (
                          <Pressable
                            key={item}
                            accessibilityRole="button"
                            onPress={() => profile.actions.toggleAllergen(item)}
                            className={`rounded-badge px-2.5 py-1 border ${isSelected
                              ? 'bg-primary border-primary'
                              : 'bg-neutral-offwhite border-border/60'
                              }`}
                          >
                            <Text
                              className={`text-caption ${isSelected
                                ? 'font-sans-semibold text-neutral-white'
                                : 'font-sans text-text'
                                }`}
                            >
                              {item}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>

                    {/* Custom Allergen Input */}
                    <View className="flex-row items-center gap-2">
                      <TextInput
                        accessibilityLabel="Add custom allergen"
                        value={profile.allergenInput}
                        onChangeText={profile.actions.setAllergenInput}
                        onSubmitEditing={() => profile.actions.addAllergen()}
                        placeholder="Add other allergen..."
                        placeholderTextColor={theme.colors.muted}
                        returnKeyType="done"
                        className="flex-1 rounded-input bg-neutral-offwhite border border-border/60 px-3 py-2 text-body-sm font-sans text-text"
                      />
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Add allergen"
                        onPress={() => profile.actions.addAllergen()}
                        className="rounded-button bg-primary px-3.5 py-2 active:opacity-80"
                      >
                        <Text className="text-label font-sans-semibold text-neutral-white">
                          Add
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ) : null}
              </ProfileFormField>
            </View>

            {/* Change Password Pill Button with Red Outline & Red Lock Icon */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Change password"
              onPress={profile.actions.showPasswordUnavailable}
              className="w-full rounded-full border border-status-error bg-card py-3.5 my-4 -mb-2 flex-row items-center justify-center gap-2 active:opacity-80"
            >
              <Lock size={18} color={theme.colors.status.error} />
              <Text className="text-label font-sans-semibold text-status-error">
                Change Password
              </Text>
            </Pressable>

            {profile.saveNotice ? (
              <Text accessibilityRole="alert" className="mt-1 mb-2 text-caption font-sans text-primary text-center">
                {profile.saveNotice}
              </Text>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>

        {/* FIXED FOOTER WITH CONTAINER AS BACKGROUND */}
        <View
          style={{ paddingBottom: Math.max(insets.bottom, 36) }}
          className="bg-offwhitebg border-t border-border/40 px-5 pt-3 z-20"
        >
          <View className="flex-row items-center gap-3">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              onPress={profile.actions.cancel}
              className="flex-1 rounded-button border border-border bg-card py-3.5 items-center justify-center active:bg-neutral-offwhite"
            >
              <Text className="text-label font-sans-semibold text-text">
                Cancel
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Save Changes"
              onPress={profile.actions.save}
              className="flex-1 rounded-button bg-primary py-3.5 items-center justify-center active:opacity-90"
            >
              <Text className="text-label font-sans-semibold text-neutral-white">
                Save Changes
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Discard Confirmation Dialog */}
      <DiscardDialog
        visible={profile.isDiscardVisible}
        onKeepEditing={profile.actions.cancelDiscard}
        onDiscard={profile.actions.confirmDiscard}
      />

      {/* Date of Birth Picker Modal */}
      <CalendarPickerModal
        visible={profile.isDatePickerOpen}
        selectedDate={profile.draft.dateOfBirth}
        onSelectDate={profile.actions.selectDateOfBirth}
        onClose={profile.actions.closeDatePicker}
        title="Select Date of Birth"
      />
    </View>
  );
}
export default EditProfilePage;
