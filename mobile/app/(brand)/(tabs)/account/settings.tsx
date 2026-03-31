// C:\Sagadevan\quickbox\mobile\app\(brand)\(tabs)\account\settings.tsx
import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../../../contexts/AuthContext";
import profileAPI from "../../../../services/profileAPI";
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import PhoneInput from "react-native-phone-input";
import RNPickerSelect from 'react-native-picker-select';

const CATEGORY_OPTIONS = [
  "Fashion", "Tech", "Fitness", "Food", "Travel", "Lifestyle",
  "Beauty", "Automobile", "Education", "Finance", "Health", "Entertainment",
];

const SOCIAL_PLATFORMS = ["Instagram", "YouTube", "LinkedIn", "Facebook", "Twitter", "TikTok"];

const STEPS = [
  { id: 1, label: "Basic Info" },
  { id: 2, label: "Business" },
  { id: 3, label: "Social" },
  { id: 4, label: "Assets" },
  { id: 5, label: "Review" }
];

interface FormData {
  company_name: string;
  contact_person_name: string;
  phone_number: string;
  website: string;
  location: string;
  categories: string[];
  social_links: Record<string, string>;
  target_audience: string;
  bio: string;
  logo: any | null;
  bg_image: any | null;
}

interface SuccessDialogConfig {
  title: string;
  message: string;
  buttonText: string;
  onButtonClick: () => void;
}

const BrandSettings = () => {
  const { user, refreshProfileStatus } = useAuth();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<FormData>({
    company_name: "",
    contact_person_name: "",
    phone_number: "",
    website: "",
    location: "",
    categories: [],
    social_links: {},
    target_audience: "",
    bio: "",
    logo: null,
    bg_image: null,
  });

  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bgPreview, setBgPreview] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState("");

  // Dialog states
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [successDialogConfig, setSuccessDialogConfig] = useState<SuccessDialogConfig>({
    title: "",
    message: "",
    buttonText: "",
    onButtonClick: () => { }
  });

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);

  const phoneRef = React.useRef<PhoneInput>(null);

  const getImageUrl = (value: string) => {
    if (!value) return null;
    if (typeof value === "string" && value.startsWith("/static/")) {
      return `${process.env.EXPO_PUBLIC_API_URL}${value}`;
    }
    return `${process.env.EXPO_PUBLIC_API_URL}/profiles/image/${value}`;
  };

  // Fetch current brand profile
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const res = await profileAPI.getMyProfile();
        if (res?.type === "brand" && res.profile) {
          const p = res.profile;
          setProfile(p);
          setIsEditing(true);
          setForm({
            company_name: p.company_name || "",
            contact_person_name: p.contact_person_name || "",
            phone_number: p.phone_number || "",
            website: p.website || "",
            location: p.location || "",
            categories: p.categories || [],
            social_links: p.social_links || {},
            target_audience: p.target_audience || "",
            bio: p.bio || "",
            logo: null,
            bg_image: null,
          });
          if (p.logo) setLogoPreview(getImageUrl(p.logo));
          if (p.bg_image) setBgPreview(getImageUrl(p.bg_image));
        }
      } catch (err) {
        console.error("Fetch profile error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (name: string, value: any) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (platform: string, url: string) => {
    setForm(prev => ({
      ...prev,
      social_links: { ...prev.social_links, [platform.toLowerCase()]: url },
    }));
  };

  const pickLogo = async () => {
    const image = await profileAPI.pickImage({
      aspect: [1, 1] as [number, number]
    });
    if (image) {
      setForm(prev => ({ ...prev, logo: image }));
      setLogoPreview(image.uri);
    }
  };

  const pickBackground = async () => {
    const image = await profileAPI.pickImage({
      aspect: [16, 9] as [number, number]
    });
    if (image) {
      setForm(prev => ({ ...prev, bg_image: image }));
      setBgPreview(image.uri);
    }
  };

  const toggleCategory = (category: string) => {
    setForm(prev => {
      const categories = prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category];
      return { ...prev, categories };
    });
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedStep1 = () => {
    return (
      form.company_name.trim() !== "" &&
      form.contact_person_name.trim() !== ""
    );
  };

  const canProceedStep2 = () => {
    return (
      form.location.trim() !== "" &&
      form.categories.length > 0
    );
  };

  const searchLocation = async (query: string) => {
    if (!query || query.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    try {
      setLocationLoading(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`
      );
      const data = await res.json();
      setLocationSuggestions(data.map((item: any) => item.display_name));
    } catch (err) {
      console.error("Location search failed", err);
    } finally {
      setLocationLoading(false);
    }
  };

  const detectLocation = () => {
    Alert.alert("Coming Soon", "Location detection will be available in the next update.");
  };

  const handleSubmit = async () => {
    if (!user) {
      setMessage("You must be logged in!");
      return;
    }

    if (phoneError) {
      setMessage("Please fix the phone number before submitting");
      return;
    }

    if (!form.phone_number) {
      setMessage("Phone number is required");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const formData = { ...form };

      let res;
      if (isEditing) {
        res = await profileAPI.updateProfile("brand", formData);
        setProfile(res?.profile);
      } else {
        res = await profileAPI.createProfile("brand", formData);
        setProfile(res?.profile);
        setIsEditing(true);
      }

      // Re-check profile completion
      const completionResult = await refreshProfileStatus?.();

      if (completionResult?.isComplete) {
        setSuccessDialogConfig({
          title: isEditing ? "Profile Updated Successfully!" : "Profile Created Successfully!",
          message: `Your profile is 100% complete! You can now access all features.`,
          buttonText: "Go to Profile",
          onButtonClick: () => router.push('/(brand)/(tabs)/account/profile'),
        });
      } else {
        setSuccessDialogConfig({
          title: "Profile Saved",
          message: `Your profile is ${completionResult?.progress || 0}% complete. Complete all required fields to unlock all features.`,
          buttonText: "Continue Editing",
          onButtonClick: () => {
            setShowSuccessDialog(false);
          },
        });
      }

      setShowSuccessDialog(true);
    } catch (err: any) {
      console.error("Save profile error:", err);
      setMessage(err.message || "Error saving profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/(brand)/(tabs)/account");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!user) return;

    try {
      await profileAPI.deleteProfile("brand");
      setProfile(null);
      setForm({
        company_name: "",
        contact_person_name: "",
        phone_number: "",
        website: "",
        location: "",
        categories: [],
        social_links: {},
        target_audience: "",
        bio: "",
        logo: null,
        bg_image: null,
      });
      setLogoPreview(null);
      setBgPreview(null);
      setIsEditing(false);
      setCurrentStep(1);
      setShowDeleteDialog(false);

      setSuccessDialogConfig({
        title: "Profile Deleted Successfully",
        message: "Your brand profile has been permanently deleted.",
        buttonText: "Create New Profile",
        onButtonClick: () => setShowSuccessDialog(false),
      });
      setShowSuccessDialog(true);
    } catch (err) {
      console.error("Delete profile error:", err);
      setMessage("Error deleting profile. Please try again.");
      setShowDeleteDialog(false);
    }
  };

  const progressPercentage = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Company Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter company name"
                value={form.company_name}
                onChangeText={(text) => handleChange("company_name", text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contact Person *</Text>
              <TextInput
                style={styles.input}
                placeholder="Contact person name"
                value={form.contact_person_name}
                onChangeText={(text) => handleChange("contact_person_name", text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={user?.email || ""}
                editable={false}
              />
              <Text style={styles.hint}>Email is linked to your account and cannot be changed.</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number *</Text>
              <PhoneInput
                ref={phoneRef}
                initialValue={form.phone_number}
                initialCountry="in"
                onChangePhoneNumber={(number) => {
                  handleChange("phone_number", number);
                  if (number.length < 10) {
                    setPhoneError("Phone number is required");
                  } else {
                    setPhoneError("");
                  }
                }}
                style={styles.phoneInput}
                textProps={{
                  placeholder: "Enter phone number",
                }}
              />
              {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Website</Text>
              <TextInput
                style={styles.input}
                placeholder="https://example.com"
                value={form.website}
                onChangeText={(text) => handleChange("website", text)}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location *</Text>
              <View style={styles.locationInputContainer}>
                <TextInput
                  style={[styles.input, styles.locationInput]}
                  placeholder="City, Country"
                  value={form.location}
                  onChangeText={(text) => {
                    handleChange("location", text);
                    searchLocation(text);
                  }}
                />
                <TouchableOpacity style={styles.detectButton} onPress={detectLocation}>
                  <Text style={styles.detectButtonText}>Detect</Text>
                </TouchableOpacity>
              </View>

              {locationLoading && (
                <ActivityIndicator size="small" color="#007AFF" style={styles.locationLoader} />
              )}

              {locationSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <FlatList
                    data={locationSuggestions}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.suggestionItem}
                        onPress={() => {
                          handleChange("location", item);
                          setLocationSuggestions([]);
                        }}
                      >
                        <Text>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Categories *</Text>
              <TouchableOpacity
                style={styles.categorySelector}
                onPress={() => setCategoryModalVisible(true)}
              >
                <Text style={styles.categorySelectorText}>
                  {form.categories.length > 0
                    ? form.categories.join(", ")
                    : "Select categories"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Target Audience Size</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 10000"
                value={form.target_audience}
                onChangeText={(text) => handleChange("target_audience", text)}
                keyboardType="numeric"
              />
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            {SOCIAL_PLATFORMS.map((platform) => (
              <View key={platform} style={styles.inputGroup}>
                <Text style={styles.label}>{platform}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={`https://${platform.toLowerCase()}.com/yourprofile`}
                  value={form.social_links[platform.toLowerCase()] || ""}
                  onChangeText={(text) => handleSocialChange(platform, text)}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>
            ))}
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Company Logo</Text>
              <TouchableOpacity style={styles.uploadButton} onPress={pickLogo}>
                <Ionicons name="cloud-upload-outline" size={24} color="#007AFF" />
                <Text style={styles.uploadButtonText}>
                  {form.logo || logoPreview ? "Change Logo" : "Upload Logo"}
                </Text>
              </TouchableOpacity>
              <Text style={styles.hint}>Recommended: 500x500px, PNG or JPG</Text>

              {logoPreview && (
                <View style={styles.previewContainer}>
                  <Image source={{ uri: logoPreview }} style={styles.logoPreview} />
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Background Image</Text>
              <TouchableOpacity style={styles.uploadButton} onPress={pickBackground}>
                <Ionicons name="cloud-upload-outline" size={24} color="#007AFF" />
                <Text style={styles.uploadButtonText}>
                  {form.bg_image || bgPreview ? "Change Background" : "Upload Background"}
                </Text>
              </TouchableOpacity>
              <Text style={styles.hint}>Recommended: 1200x600px, PNG or JPG</Text>

              {bgPreview && (
                <View style={styles.previewContainer}>
                  <Image source={{ uri: bgPreview }} style={styles.bgPreview} />
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>About Your Company</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Tell us about your company..."
                value={form.bio}
                onChangeText={(text) => handleChange("bio", text)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.reviewTitle}>Review Your Information</Text>

            <View style={styles.reviewSection}>
              <Text style={styles.reviewSectionTitle}>Basic Information</Text>
              <View style={styles.reviewItem}>
                <Text style={styles.reviewLabel}>Company:</Text>
                <Text style={styles.reviewValue}>{form.company_name}</Text>
              </View>
              <View style={styles.reviewItem}>
                <Text style={styles.reviewLabel}>Contact:</Text>
                <Text style={styles.reviewValue}>{form.contact_person_name}</Text>
              </View>
              <View style={styles.reviewItem}>
                <Text style={styles.reviewLabel}>Email:</Text>
                <Text style={styles.reviewValue}>{user?.email}</Text>
              </View>
              <View style={styles.reviewItem}>
                <Text style={styles.reviewLabel}>Phone:</Text>
                <Text style={styles.reviewValue}>{form.phone_number || 'Not provided'}</Text>
              </View>
            </View>

            <View style={styles.reviewSection}>
              <Text style={styles.reviewSectionTitle}>Business Details</Text>
              <View style={styles.reviewItem}>
                <Text style={styles.reviewLabel}>Website:</Text>
                <Text style={styles.reviewValue}>{form.website || 'Not provided'}</Text>
              </View>
              <View style={styles.reviewItem}>
                <Text style={styles.reviewLabel}>Location:</Text>
                <Text style={styles.reviewValue}>{form.location || 'Not provided'}</Text>
              </View>
              <View style={styles.reviewItem}>
                <Text style={styles.reviewLabel}>Categories:</Text>
                <Text style={styles.reviewValue}>{form.categories.join(', ') || 'None selected'}</Text>
              </View>
            </View>

            {form.bio && (
              <View style={styles.reviewSection}>
                <Text style={styles.reviewSectionTitle}>About</Text>
                <Text style={styles.reviewBio}>{form.bio}</Text>
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>
              {isEditing ? "Update Brand Profile" : "Create Brand Profile"}
            </Text>
            <Text style={styles.subtitle}>
              {isEditing
                ? "Update your brand information"
                : "Complete your brand profile"
              }
            </Text>
          </View>
        </View>

        {message ? (
          <View style={[styles.messageContainer, message.includes("Error") ? styles.errorMessage : styles.successMessage]}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        ) : null}

        {/* Progress Steps */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
          </View>
          <View style={styles.stepsRow}>
            {STEPS.map((step) => (
              <View key={step.id} style={styles.stepIndicator}>
                <View style={[
                  styles.stepCircle,
                  currentStep > step.id && styles.stepCircleCompleted,
                  currentStep === step.id && styles.stepCircleActive,
                ]}>
                  <Text style={[
                    styles.stepCircleText,
                    (currentStep > step.id || currentStep === step.id) && styles.stepCircleTextActive,
                  ]}>
                    {currentStep > step.id ? "✓" : step.id}
                  </Text>
                </View>
                <Text style={[
                  styles.stepLabel,
                  currentStep === step.id && styles.stepLabelActive,
                ]}>
                  {step.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Form Content */}
        <View style={styles.formContainer}>
          {renderStepContent()}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationButtons}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={[styles.navButton, styles.prevButton]}
              onPress={prevStep}
              disabled={submitting}
            >
              <Text style={styles.prevButtonText}>← Previous</Text>
            </TouchableOpacity>
          )}

          {currentStep < STEPS.length ? (
            <TouchableOpacity
              style={[
                styles.navButton,
                styles.nextButton,
                ((currentStep === 1 && (!canProceedStep1() || phoneError || form.phone_number === "")) ||
                  (currentStep === 2 && !canProceedStep2())) && styles.disabledButton
              ]}
              onPress={nextStep}
              disabled={
                (currentStep === 1 && (!canProceedStep1() || phoneError || form.phone_number === "")) ||
                (currentStep === 2 && !canProceedStep2())
              }
            >
              <Text style={styles.nextButtonText}>Next →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.navButton, styles.submitButton]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isEditing ? "Update Profile" : "Create Profile"}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Delete Button */}
        {isEditing && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => setShowDeleteDialog(true)}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            <Text style={styles.deleteButtonText}>Delete Profile</Text>
          </TouchableOpacity>
        )}

        {/* Action Buttons */}
        {isEditing && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(brand)/(tabs)/account/profile')}
            >
              <Text style={styles.actionButtonText}>View My Profile</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Category Selection Modal */}
        <Modal
          visible={categoryModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Categories</Text>
                <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {CATEGORY_OPTIONS.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={styles.categoryItem}
                    onPress={() => toggleCategory(category)}
                  >
                    <View style={styles.checkbox}>
                      {form.categories.includes(category) && (
                        <Ionicons name="checkmark" size={18} color="#007AFF" />
                      )}
                    </View>
                    <Text style={styles.categoryItemText}>{category}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.modalDoneButton}
                onPress={() => setCategoryModalVisible(false)}
              >
                <Text style={styles.modalDoneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Success Dialog */}
        <Modal
          visible={showSuccessDialog}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.dialogOverlay}>
            <View style={styles.dialogContent}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={60} color="#4CD964" />
              </View>
              <Text style={styles.dialogTitle}>{successDialogConfig.title}</Text>
              <Text style={styles.dialogMessage}>{successDialogConfig.message}</Text>
              <View style={styles.dialogActions}>
                <TouchableOpacity
                  style={[styles.dialogButton, styles.dialogButtonPrimary]}
                  onPress={successDialogConfig.onButtonClick}
                >
                  <Text style={styles.dialogButtonPrimaryText}>{successDialogConfig.buttonText}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.dialogButton, styles.dialogButtonSecondary]}
                  onPress={() => setShowSuccessDialog(false)}
                >
                  <Text style={styles.dialogButtonSecondaryText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Delete Confirmation Dialog */}
        <Modal
          visible={showDeleteDialog}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.dialogOverlay}>
            <View style={[styles.dialogContent, styles.dialogDanger]}>
              <View style={styles.warningIcon}>
                <Ionicons name="warning" size={60} color="#FF3B30" />
              </View>
              <Text style={styles.dialogTitle}>Delete Brand Profile</Text>
              <Text style={styles.dialogMessage}>
                Are you sure you want to delete "{form.company_name}" brand profile?
              </Text>
              <Text style={styles.dialogWarning}>
                This action cannot be undone and will permanently delete all your data.
              </Text>
              <View style={styles.dialogActions}>
                <TouchableOpacity
                  style={[styles.dialogButton, styles.dialogButtonDanger]}
                  onPress={handleDeleteConfirm}
                >
                  <Text style={styles.dialogButtonDangerText}>Yes, Delete Permanently</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.dialogButton, styles.dialogButtonSecondary]}
                  onPress={() => setShowDeleteDialog(false)}
                >
                  <Text style={styles.dialogButtonSecondaryText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  messageContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorMessage: {
    backgroundColor: '#FFE5E5',
  },
  successMessage: {
    backgroundColor: '#E5FFE5',
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 16,
  },
  progressFill: {
    height: 4,
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  stepIndicator: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepCircleCompleted: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  stepCircleActive: {
    borderColor: '#007AFF',
  },
  stepCircleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  stepCircleTextActive: {
    color: '#fff',
  },
  stepLabel: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
  stepLabelActive: {
    color: '#007AFF',
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stepContent: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
  },
  locationInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  locationInput: {
    flex: 1,
  },
  detectButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 8,
  },
  detectButtonText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  locationLoader: {
    marginTop: 8,
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  categorySelectorText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
  },
  uploadButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  previewContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  logoPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  bgPreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  reviewSection: {
    marginBottom: 20,
  },
  reviewSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  reviewItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  reviewLabel: {
    fontSize: 14,
    color: '#666',
    width: 80,
  },
  reviewValue: {
    fontSize: 14,
    color: '#000',
    flex: 1,
  },
  reviewBio: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  prevButton: {
    backgroundColor: '#f0f0f0',
  },
  prevButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: '#007AFF',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.5,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
    marginBottom: 16,
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '500',
  },
  actionButtons: {
    gap: 8,
  },
  actionButton: {
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryItemText: {
    fontSize: 16,
    color: '#333',
  },
  modalDoneButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  modalDoneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
  },
  dialogDanger: {
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  successIcon: {
    marginBottom: 16,
  },
  warningIcon: {
    marginBottom: 16,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  dialogMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  dialogWarning: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  dialogActions: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  dialogButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  dialogButtonPrimary: {
    backgroundColor: '#007AFF',
  },
  dialogButtonPrimaryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  dialogButtonDanger: {
    backgroundColor: '#FF3B30',
  },
  dialogButtonDangerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  dialogButtonSecondary: {
    backgroundColor: '#f0f0f0',
  },
  dialogButtonSecondaryText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default BrandSettings;