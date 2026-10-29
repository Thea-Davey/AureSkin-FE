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
import { Camera, LockKeyhole, UserRound, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ModalHeader } from '../../../shared/components/ModalHeader';
import { theme } from '../../../shared/theme';
import { useEditProfile } from '../viewmodel/useEditProfile';

const fieldClassName = 'rounded-input border border-border bg-card px-4 py-3 text-body-sm font-sans text-text';

interface ProfileTextFieldProps {
  label: string;
  value: string;
  placeholder: string;
  accessibilityLabel: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words';
}

function ProfileTextField({
  label,
  value,
  placeholder,
  accessibilityLabel,
  onChangeText,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}: ProfileTextFieldProps) {
  return (
    <View className="gap-1.5">
      <Text className="text-label font-sans-semibold text-text">{label}</Text>
      <TextInput
        accessibilityLabel={accessibilityLabel}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.muted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCapitalize !== 'none'}
        className={fieldClassName}
      />
    </View>
  );
}

export function EditProfilePage() {
  const profile = useEditProfile();
  const avatarUri = profile.draft.avatarUri;

  return (
    <View className="flex-1 bg-background">
      <ModalHeader title="Edit Profile" onClose={profile.actions.cancel} />

      <SafeAreaView edges={['bottom']} className="flex-1 bg-background">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            className="flex-1 px-5 pt-5"
            contentContainerStyle={{ paddingBottom: 24 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="mb-5 items-center">
              <View className="relative">
                {avatarUri ? (
                  <Image
                    accessibilityLabel="Profile photo preview"
                    source={{ uri: avatarUri }}
                    className="h-28 w-28 rounded-full border-2 border-primary bg-card"
                  />
                ) : (
                  <View className="h-28 w-28 items-center justify-center rounded-full border-2 border-primary bg-primary/10">
                    <UserRound size={44} color={theme.colors.primary} />
                  </View>
                )}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Choose profile photo"
                  accessibilityState={{ disabled: profile.isPickingAvatar }}
                  disabled={profile.isPickingAvatar}
                  onPress={() => void profile.actions.pickAvatar()}
                  className="absolute bottom-0 right-0 h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-primary active:opacity-80"
                >
                  {profile.isPickingAvatar ? (
                    <ActivityIndicator size="small" color={theme.colors.white} />
                  ) : (
                    <Camera size={18} color={theme.colors.white} />
                  )}
                </Pressable>
              </View>
              <Text className="mt-2 text-caption font-sans text-muted">
                Selected photo is a local preview until profile saving is available.
              </Text>
            </View>

            <View className="gap-4 rounded-card border border-border bg-card p-4">
              <ProfileTextField
                label="First Name"
                value={profile.draft.firstName}
                placeholder="Enter first name"
                accessibilityLabel="First name"
                onChangeText={(firstName) => profile.actions.updateDraft({ firstName })}
                autoCapitalize="words"
              />
              <ProfileTextField
                label="Last Name"
                value={profile.draft.lastName}
                placeholder="Enter last name"
                accessibilityLabel="Last name"
                onChangeText={(lastName) => profile.actions.updateDraft({ lastName })}
                autoCapitalize="words"
              />
              <ProfileTextField
                label="Age"
                value={profile.draft.age}
                placeholder="Enter age"
                accessibilityLabel="Age"
                keyboardType="number-pad"
                onChangeText={(age) => profile.actions.updateDraft({ age })}
              />
              <ProfileTextField
                label="Username"
                value={profile.draft.username}
                placeholder="Enter username"
                accessibilityLabel="Username"
                autoCapitalize="none"
                onChangeText={(username) => profile.actions.updateDraft({ username })}
              />

              <View className="gap-2">
                <Text className="text-label font-sans-semibold text-text">Pregnant</Text>
                <View className="flex-row gap-3">
                  {[
                    { label: 'Yes', value: true },
                    { label: 'No', value: false },
                  ].map((option) => {
                    const isSelected = profile.draft.pregnant === option.value;
                    return (
                      <Pressable
                        key={option.label}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isSelected }}
                        onPress={() => profile.actions.updateDraft({ pregnant: option.value })}
                        className={`flex-1 items-center rounded-input border px-4 py-3 ${isSelected ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}
                      >
                        <Text className="text-body-sm font-sans-medium text-text">
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                {profile.draft.pregnant === null ? (
                  <Text className="text-caption font-sans text-muted">
                    No response selected
                  </Text>
                ) : null}
              </View>

              <View className="gap-2">
                <Text className="text-label font-sans-semibold text-text">Allergens</Text>
                {profile.draft.allergens.length > 0 ? (
                  <View className="flex-row flex-wrap gap-2">
                    {profile.draft.allergens.map((allergen, index) => (
                      <View
                        key={`${allergen}-${index}`}
                        className="flex-row items-center gap-1 rounded-badge bg-background px-3 py-2"
                      >
                        <Text className="text-body-sm font-sans text-text">{allergen}</Text>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Remove ${allergen}`}
                          onPress={() => profile.actions.removeAllergen(allergen)}
                          hitSlop={8}
                        >
                          <X size={14} color={theme.colors.text} />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text className="text-body-sm font-sans text-muted">
                    No allergens specified
                  </Text>
                )}
                <View className="flex-row items-center gap-2">
                  <TextInput
                    accessibilityLabel="Add allergen"
                    value={profile.allergenInput}
                    onChangeText={profile.actions.setAllergenInput}
                    onSubmitEditing={profile.actions.addAllergen}
                    placeholder="Add an allergen"
                    placeholderTextColor={theme.colors.muted}
                    returnKeyType="done"
                    className={`${fieldClassName} flex-1`}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Add allergen"
                    onPress={profile.actions.addAllergen}
                    className="items-center justify-center rounded-button bg-primary px-4 py-3 active:opacity-80"
                  >
                    <Text className="text-label font-sans-semibold text-neutral-white">Add</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={profile.actions.showPasswordUnavailable}
              className="mt-4 flex-row items-center justify-center gap-2 rounded-button border border-secondary bg-card px-4 py-3 active:opacity-80"
            >
              <LockKeyhole size={18} color={theme.colors.secondary} />
              <Text className="text-label font-sans-semibold text-secondary">Change Password</Text>
            </Pressable>

            <View className="mt-4 rounded-card border border-primary/20 bg-primary/10 p-4">
              <Text className="text-body-sm font-sans-medium text-text">
                Profile updates and avatar uploads are not connected yet. You can review edits here, but they will not be saved to your account.
              </Text>
            </View>

            {profile.saveNotice ? (
              <Text accessibilityRole="alert" className="mt-3 text-body-sm font-sans text-status-error">
                {profile.saveNotice}
              </Text>
            ) : null}

            <View className="mb-4 mt-5 gap-3">
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: !profile.isDirty }}
                disabled={!profile.isDirty}
                onPress={profile.actions.save}
                className="items-center rounded-button bg-primary px-5 py-3.5 active:opacity-80 disabled:opacity-50"
              >
                <Text className="text-label font-sans-semibold text-neutral-white">
                  Save Changes
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={profile.actions.cancel}
                className="items-center rounded-button border border-border bg-card px-5 py-3 active:bg-background"
              >
                <Text className="text-label font-sans-semibold text-text">Cancel</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
