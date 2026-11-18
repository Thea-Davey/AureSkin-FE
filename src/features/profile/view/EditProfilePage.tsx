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
  View,
} from 'react-native';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Lock,
  Pencil,
  Plus,
  UserRound,
  X,
} from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarPickerModal } from '../../../shared/components/CalendarPickerModal';
import { Card } from '../../../shared/components/Card';
import { CloseButton } from '../../../shared/components/CloseButton';
import { Button } from '../../../shared/components/Button';
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
  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, 24);
  const availableAllergens =
    profile.commonAllergies && profile.commonAllergies.length > 0
      ? profile.commonAllergies.map((a) => a.name)
      : COMMON_ALLERGENS;
  const unselectedAllergens = availableAllergens.filter(
    (item) => !profile.draft.allergens.some((sel) => sel.toLowerCase() === item.toLowerCase())
  );

  return (
    <View className="flex-1 bg-primary">
      <StatusBar style="light" />

      {/* Top Olive Green Header with Safe Area Spacing */}
      <View
        style={{ paddingTop: topInset + 8, paddingBottom: 16 }}
        className="px-5 relative items-center justify-center z-20"
      >
        {/* Top-Right Close Button */}
        <CloseButton
          accessibilityLabel="Back to profile"
          disabled={profile.isSaving}
          onPress={profile.actions.cancel}
          style={{ top: topInset + 4 }}
          className="absolute right-5 z-30"
        />

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
        className="flex-1 overflow-hidden bg-background rounded-t-card z-10"
      >
        {/* FIXED TITLE: Everything above Edit Profile and the title text itself is fixed */}
        <View className="px-5 pt-10 pb-2 bg-background z-20">
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
            <Card variant={1} className="p-4 mb-4">
              <Text className="text-caption font-sans-bold text-secondary uppercase tracking-wider mb-3">
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
                {profile.computedAge !== null ? (
                  <View className="mt-1.5 flex-row items-center gap-1.5">
                    <Text className="text-caption font-sans-medium text-muted">
                      Age: {profile.computedAge} yrs •
                    </Text>
                    <View className="rounded-badge bg-primary/15 px-2 py-0.5">
                      <Text className="text-caption font-sans-bold text-primary">
                        {profile.computedLifeStage}
                      </Text>
                    </View>
                  </View>
                ) : null}
              </ProfileFormField>

              {/* Gender Dropdown */}
              <ProfileFormField label="Gender" className="mb-1">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Toggle gender picker"
                  onPress={() => setIsGenderDropdownOpen(!isGenderDropdownOpen)}
                  className={`${inputStyle} flex-row items-center justify-between`}
                >
                  <Text
                    className={`text-body-sm font-sans ${
                      profile.draft.gender ? 'text-text' : 'text-muted'
                    }`}
                  >
                    {profile.draft.gender || 'Select Gender'}
                  </Text>
                  {isGenderDropdownOpen ? (
                    <ChevronUp size={18} color={theme.colors.text} />
                  ) : (
                    <ChevronDown size={18} color={theme.colors.text} />
                  )}
                </Pressable>

                {isGenderDropdownOpen ? (
                  <View className="mt-2 rounded-card border border-border/80 bg-neutral-offwhite overflow-hidden shadow-xs">
                    {GENDER_OPTIONS.map((option: GenderOption) => {
                      const isSelected = profile.draft.gender === option;
                      return (
                        <Pressable
                          key={option}
                          accessibilityRole="button"
                          accessibilityState={{ selected: isSelected }}
                          onPress={() => {
                            profile.actions.updateDraft({ gender: option });
                            setIsGenderDropdownOpen(false);
                          }}
                          className={`flex-row items-center justify-between px-4 py-3 border-b border-border/40 active:bg-primary/10 ${
                            isSelected ? 'bg-primary/15' : 'bg-card'
                          }`}
                        >
                          <Text
                            className={`text-body-sm ${
                              isSelected
                                ? 'font-sans-bold text-primary'
                                : 'font-sans text-text'
                            }`}
                          >
                            {option}
                          </Text>
                          {isSelected ? (
                            <View className="h-2 w-2 rounded-full bg-primary" />
                          ) : null}
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}
              </ProfileFormField>
            </Card>

            {/* =========================================================================
                CATEGORY 2: ACCOUNT & CONTACT
               ========================================================================= */}
            <Card variant={1} className="p-4 mb-4">
              <Text className="text-caption font-sans-bold text-secondary uppercase tracking-wider mb-3">
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
            </Card>

            {/* =========================================================================
                CATEGORY 3: SKIN & HEALTH PROFILE
               ========================================================================= */}
            <Card variant={1} className="p-4 mb-4">
              <Text className="text-caption font-sans-bold text-secondary uppercase tracking-wider mb-3">
                SKIN & HEALTH PROFILE
              </Text>

              {/* Pregnancy Status Selector (General Clinical Parameter - Option A) */}
              <ProfileFormField label="Pregnancy Status" className="mb-4">
                <Text className="mb-2 text-caption font-sans text-muted">
                  Enable if currently pregnant or nursing to filter out contraindicated active ingredients (e.g. Retinoids).
                </Text>
                <View className="flex-row items-center gap-2">
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Not Pregnant"
                    onPress={() => profile.actions.setIsPregnant(false)}
                    className={`flex-1 flex-row items-center justify-center rounded-badge py-2.5 border ${
                      !profile.draft.isPregnant
                        ? 'border-primary bg-primary'
                        : 'border-border/80 bg-neutral-offwhite'
                    }`}
                  >
                    <Text
                      className={`text-caption ${
                        !profile.draft.isPregnant
                          ? 'font-sans-bold text-neutral-white'
                          : 'font-sans-medium text-text'
                      }`}
                    >
                      No
                    </Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Pregnant"
                    onPress={() => profile.actions.setIsPregnant(true)}
                    className={`flex-1 flex-row items-center justify-center rounded-badge py-2.5 border ${
                      profile.draft.isPregnant
                        ? 'border-primary bg-primary'
                        : 'border-border/80 bg-neutral-offwhite'
                    }`}
                  >
                    <Text
                      className={`text-caption ${
                        profile.draft.isPregnant
                          ? 'font-sans-bold text-neutral-white'
                          : 'font-sans-medium text-text'
                      }`}
                    >
                      Yes (Pregnant)
                    </Text>
                  </Pressable>
                </View>
              </ProfileFormField>

              {/* Allergen Selection (matching Add Product Compatible Skin Types layout) */}
              <ProfileFormField label="Allergen" className="mb-1">
                <View className="rounded-card border border-border bg-card p-3.5 gap-2.5">
                  {/* Selected Allergen Chips */}
                  {profile.draft.allergens.length > 0 ? (
                    <View className="flex-row flex-wrap">
                      {profile.draft.allergens.map((allergen, index) => (
                        <View
                          key={`${allergen}-${index}`}
                          className="mb-1.5 mr-2 flex-row items-center rounded-badge bg-secondary/15 border border-secondary/30 px-3 py-1"
                        >
                          <Text className="text-caption font-sans-semibold text-secondary mr-1.5">
                            {allergen}
                          </Text>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Remove ${allergen}`}
                            onPress={() => profile.actions.removeAllergen(allergen)}
                            hitSlop={6}
                          >
                            <X size={12} color={theme.colors.secondary} />
                          </Pressable>
                        </View>
                      ))}
                    </View>
                  ) : null}

                  {/* Available Unselected Preset Allergens */}
                  {unselectedAllergens.length > 0 ? (
                    <View className={profile.draft.allergens.length > 0 ? 'pt-2 border-t border-border/50' : ''}>
                      <Text className="mb-2 text-caption font-sans text-muted">
                        Tap to add allergens:
                      </Text>
                      <View className="flex-row flex-wrap">
                        {unselectedAllergens.map((item) => (
                          <Pressable
                            key={item}
                            accessibilityRole="button"
                            accessibilityLabel={`Add ${item}`}
                            onPress={() => profile.actions.toggleAllergen(item)}
                            className="mb-1.5 mr-2 flex-row items-center rounded-badge border border-border bg-background px-3 py-1 active:bg-secondary/10"
                          >
                            <Plus size={12} color={theme.colors.muted} />
                            <Text className="ml-1 text-caption font-sans text-text">
                              {item}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  ) : null}
                </View>
              </ProfileFormField>
            </Card>

            {/* Change Password Pill Button (Unfilled Red Outline & Red Lock Icon) */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Change password"
              onPress={profile.actions.showPasswordUnavailable}
              className="w-full rounded-full border border-status-error bg-transparent py-3.5 my-4 -mb-2 flex-row items-center justify-center gap-2 active:opacity-80"
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
          className="bg-background border-t border-border/40 px-5 pt-3 z-20"
        >
          <View className="flex-row items-center gap-3">
            <Button
              variant="outline"
              size="lg"
              title="Cancel"
              disabled={profile.isSaving}
              onPress={profile.actions.cancel}
              accessibilityLabel="Cancel"
              className="flex-1 py-3.5"
              textClassName="text-label font-sans-semibold text-text"
            />

            <Button
              variant="primary"
              size="lg"
              title={profile.isSaving ? 'Saving...' : 'Save Changes'}
              isLoading={profile.isSaving}
              disabled={profile.isSaving || !profile.isDirty}
              onPress={profile.actions.save}
              accessibilityLabel="Save Changes"
              className="flex-1 py-3.5"
              textClassName="text-label font-sans-semibold text-neutral-white"
            />
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
