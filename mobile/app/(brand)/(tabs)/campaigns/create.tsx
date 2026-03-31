
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Video } from 'expo-video';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { campaignAPI } from '../../../../services/campaignAPI';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useScroll } from "@/contexts/ScrollContext";
import { Animated } from "react-native";
import { useAuth } from '../../../../contexts/AuthContext';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

// Types
interface FormData {
  title: string;
  description: string;
  requirements: string;
  budget: string;
  category: string;
  deadline: Date | null;
  currency: string;
  campaignImage: any | null;
  campaignVideo: any | null;
  productLink: string;
}

interface AiSuggestions {
  title: string;
  description: string;
  requirements: string;
  category: string;
  budget: string;
}

interface GeneratedImage {
  url: string;
  id: string;
}

// Constants
const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
];

const MIN_BUDGET_BY_CURRENCY: Record<string, number> = {
  USD: 0.5,
  EUR: 0.5,
  GBP: 0.3,
  INR: 50,
  AUD: 0.5,
  CAD: 0.5,
  JPY: 50,
};

const CATEGORIES = [
  { value: 'Fashion', label: 'Fashion', icon: '👗', color: '#FF6B93' },
  { value: 'Beauty', label: 'Beauty', icon: '💄', color: '#FF9F43' },
  { value: 'Lifestyle', label: 'Lifestyle', icon: '🏡', color: '#36BDCB' },
  { value: 'Food', label: 'Food', icon: '🍔', color: '#FF9F43' },
  { value: 'Travel', label: 'Travel', icon: '✈️', color: '#6C5CE7' },
  { value: 'Fitness', label: 'Fitness', icon: '💪', color: '#00B894' },
  { value: 'Technology', label: 'Technology', icon: '📱', color: '#0984E3' },
  { value: 'Gaming', label: 'Gaming', icon: '🎮', color: '#E84393' },
  { value: 'Other', label: 'Other', icon: '🔮', color: '#636E72' },
];

const STEPS = ['Details', 'Budget', 'Media', 'Success'];

export default function BrandCreateCampaign() {
  const scrollY = useScroll();
  const insets = useSafeAreaInsets();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [imageGenLoading, setImageGenLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestions | null>(null);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [createdCampaign, setCreatedCampaign] = useState<any>(null);
  const [campaignId, setCampaignId] = useState('');

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [budgetError, setBudgetError] = useState('');
  const [showFullBudget, setShowFullBudget] = useState(false);


  const { user } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    requirements: '',
    budget: '',
    category: '',
    deadline: null,
    currency: 'USD',
    campaignImage: null,
    campaignVideo: null,
    productLink: '',
  });



  // Fetch user data on mount
  useEffect(() => {
    fetchLogo();
    requestPermissions();
  }, []);



  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
      }
    }
  };

  const fetchLogo = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/logo/current`);
      if (response.data && response.data.logo_url) {
        setLogoUrl(response.data.logo_url);
      }
    } catch (err) {
      console.error('Failed to fetch logo:', err);
    }
  };

  const getCurrencySymbol = () => {
    const currency = CURRENCIES.find(c => c.code === formData.currency);
    return currency ? currency.symbol : '$';
  };

  const getMinDate = () => {
    const now = new Date();
    return now;
  };

  const handleChange = (name: keyof FormData, value: any) => {
    if (name === 'budget') {
      const budgetValue = parseFloat(value);
      const currency = formData.currency;
      const minBudget = MIN_BUDGET_BY_CURRENCY[currency];

      if (value && minBudget && budgetValue < minBudget) {
        setBudgetError(`Minimum budget for ${currency} is ${getCurrencySymbol()}${minBudget}`);
      } else {
        setBudgetError('');
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        // Check file size (10MB limit)
        if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
          Alert.alert('Error', 'Image must be less than 10MB');
          return;
        }

        setFormData({ ...formData, campaignImage: asset });
        setImagePreview(asset.uri);
        setSelectedImage(null);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        // Check file size (50MB limit)
        if (result.size && result.size > 50 * 1024 * 1024) {
          Alert.alert('Error', 'Video must be less than 50MB');
          return;
        }

        setFormData({ ...formData, campaignVideo: result });
        setVideoPreview(result.uri);
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  const analyzeProductLink = async () => {
    if (!formData.productLink) {
      Alert.alert('Error', 'Please enter a product link first');
      return;
    }

    setAiLoading(true);
    setError('');

    try {
      const response = await campaignAPI.analyzeProductLink(formData.productLink);

      if (response.data) {
        setAiSuggestions(response.data);
        setShowAiSuggestions(true);

        if (response.data.title) {
          generateCampaignImages(response.data.title);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to analyze product link');
    } finally {
      setAiLoading(false);
    }
  };

  const generateCampaignImages = async (prompt: string) => {
    if (!prompt.trim()) {
      Alert.alert('Error', 'Please enter a campaign title first to generate images');
      return;
    }

    setImageGenLoading(true);
    setError('');

    try {
      const token = await AsyncStorage.getItem('access_token');

      const response = await axios.post(
        `${API_BASE_URL}/api/images/generate`,
        {
          prompt: `${prompt} marketing campaign, professional, high quality, social media content, vibrant colors, modern design`,
          num_images: 4
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data?.images?.length) {
        const images = response.data.images.map((url: string, index: number) => ({
          url,
          id: `gen_${index}_${Date.now()}`,
        }));
        setGeneratedImages(images);
        setImageDialogOpen(true);
      } else {
        setError("No images generated. Please try again with a different prompt.");
      }
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        setError("You must be logged in to generate images.");
      } else {
        setError("Failed to generate images. Please try again.");
      }
    } finally {
      setImageGenLoading(false);
    }
  };

  const selectGeneratedImage = async (url: string) => {
    try {
      setImageGenLoading(true);

      // Download the image to local cache - CRITICAL for React Native FormData
      const filename = `gen_img_${Date.now()}.jpg`;
      const localUri = `${FileSystem.cacheDirectory}${filename}`;

      const downloadRes = await FileSystem.downloadAsync(url, localUri);

      const file = {
        uri: downloadRes.uri,
        type: 'image/jpeg',
        name: filename,
      };

      setFormData({ ...formData, campaignImage: file });
      setImagePreview(downloadRes.uri);
      setSelectedImage(downloadRes.uri);
      setImageDialogOpen(false);
    } catch (err) {
      console.error('Error selecting image:', err);
      Alert.alert('Error', 'Failed to select generated image');
    } finally {
      setImageGenLoading(false);
    }
  };

  const downloadImage = async (url: string) => {
    try {
      // For React Native, we'd use a library like expo-media-library
      // This is a placeholder
      Alert.alert('Download', 'Image download functionality');
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const applyAiSuggestions = () => {
    if (aiSuggestions) {
      setFormData(prev => ({
        ...prev,
        title: aiSuggestions.title,
        description: aiSuggestions.description,
        requirements: aiSuggestions.requirements,
        category: aiSuggestions.category,
        budget: aiSuggestions.budget.replace(/[^\d.-]/g, ''),
      }));
      setShowAiSuggestions(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!formData.title || !formData.description || !formData.requirements) {
        setError('Please fill in all required fields');
        return;
      }
    } else if (activeStep === 1) {
      if (!formData.budget || !formData.category || !formData.deadline) {
        setError('Please fill in all required fields');
        return;
      }

      if (parseFloat(formData.budget) <= 0) {
        setError('Budget must be greater than 0');
        return;
      }

      const minBudget = MIN_BUDGET_BY_CURRENCY[formData.currency];
      if (parseFloat(formData.budget) < minBudget) {
        setError(`Minimum campaign budget for ${formData.currency} is ${getCurrencySymbol()}${minBudget}`);
        return;
      }

      const deadlineDate = new Date(formData.deadline);
      const now = new Date();
      if (deadlineDate < now) {
        setError('Deadline must be a future date');
        return;
      }
    } else if (activeStep === 2) {
      if (!formData.campaignImage) {
        setError('Please upload or generate a campaign image');
        return;
      }
    }
    setError('');
    setActiveStep(prevStep => prevStep + 1);
  };

  const handleBack = () => {
    setError('');
    setActiveStep(prevStep => prevStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      if (!user) {
        throw new Error('User not found');
      }

      const formDataToSend = new FormData();

      // Add all required fields - match the exact parameter names from FastAPI
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('requirements', formData.requirements);
      formDataToSend.append('budget', formData.budget); // Send as string, FastAPI will parse to float
      formDataToSend.append('category', formData.category);
      formDataToSend.append('deadline', formData.deadline!.toISOString());
      formDataToSend.append('currency', formData.currency);
      formDataToSend.append('brand_id', user.id);
      formDataToSend.append('status', 'active'); // Optional, defaults to 'active'

      // Handle image upload
      if (formData.campaignImage) {
        // For React Native, we need to create the file object properly
        const imageUri = formData.campaignImage.uri;
        const imageName = imageUri.split('/').pop() || 'campaign_image.jpg';
        const imageType = formData.campaignImage.type || 'image/jpeg';

        formDataToSend.append('campaign_image', {
          uri: imageUri,
          type: imageType.includes('/') ? imageType : 'image/jpeg',
          name: imageName,
        } as any);
      }

      // Handle video upload
      if (formData.campaignVideo) {
        const videoUri = formData.campaignVideo.uri;
        const videoName = videoUri.split('/').pop() || 'campaign_video.mp4';
        const videoType = formData.campaignVideo.type || 'video/mp4';

        formDataToSend.append('campaign_video', {
          uri: videoUri,
          type: videoType.includes('/') ? videoType : 'video/mp4',
          name: videoName,
        } as any);
      }

      // Log FormData contents for debugging
      if (__DEV__) {
        console.log('📤 Sending FormData with fields:');
        // @ts-ignore - FormData might not have forEach in all environments
        if (formDataToSend._parts) {
          // @ts-ignore
          formDataToSend._parts.forEach(([key, value]) => {
            if (key === 'campaign_image' || key === 'campaign_video') {
              console.log(`- ${key}: ${value.name} (${value.type})`);
            } else {
              console.log(`- ${key}: ${value}`);
            }
          });
        }
      }

      // Make sure to use the correct headers
      const response = await campaignAPI.createCampaign(formDataToSend);

      setCreatedCampaign(response);

      // Extract campaign ID from response
      const campaignId = response.campaign_id || response.id || response._id;
      setCampaignId(campaignId ? `#${campaignId.substring(0, 8)}` : '#N/A');
      setSuccess(true);
      setActiveStep(3);
    } catch (err: any) {
      console.error("Campaign creation error:", err);

      // Better error parsing
      let message = "Failed to create campaign";

      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;

        if (Array.isArray(detail)) {
          // FastAPI validation errors come as an array
          message = detail.map((e: any) => {
            if (e.msg) return e.msg;
            if (e.message) return e.message;
            return JSON.stringify(e);
          }).join(", ");
        } else if (typeof detail === "string") {
          message = detail;
        } else {
          message = JSON.stringify(detail);
        }
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.message) {
        message = err.message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setActiveStep(0);
    setFormData({
      title: '',
      description: '',
      requirements: '',
      budget: '',
      category: '',
      deadline: null,
      currency: 'USD',
      campaignImage: null,
      campaignVideo: null,
      productLink: '',
    });
    setImagePreview(null);
    setVideoPreview(null);
    setCreatedCampaign(null);
    setCampaignId('');
    setAiSuggestions(null);
    setShowAiSuggestions(false);
    setGeneratedImages([]);
    setSelectedImage(null);
    setError('');
  };

  const renderStepIndicator = () => {
    if (activeStep === 3) return null;

    return (
      <View style={styles.stepIndicatorContainer}>
        {STEPS.map((step, index) => (
          <View key={step} style={styles.stepWrapper}>
            <View style={[
              styles.stepCircle,
              index <= activeStep ? styles.stepCircleActive : null,
              index < activeStep ? styles.stepCircleCompleted : null,
            ]}>
              {index < activeStep ? (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              ) : (
                <Text style={[
                  styles.stepText,
                  index <= activeStep ? styles.stepTextActive : null,
                ]}>
                  {index + 1}
                </Text>
              )}
            </View>
            <Text style={[
              styles.stepLabel,
              index <= activeStep ? styles.stepLabelActive : null,
            ]}>
              {step}
            </Text>
            {index < STEPS.length - 1 && (
              <View style={[
                styles.stepLine,
                index < activeStep ? styles.stepLineActive : null,
              ]} />
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderStep0 = () => (
    <View style={styles.stepContent}>
      {/* AI Analysis Section */}
      <View
        style={[styles.aiCard, { backgroundColor: '#0f6eea' }]}
      >
        <View style={styles.aiCardHeader}>
          <Ionicons name="flash" size={24} color="#FFFFFF" />
          <Text style={styles.aiCardTitle}>AI-Powered Campaign Creation</Text>
        </View>
        <Text style={styles.aiCardSubtitle}>
          Enter your product link and let AI generate campaign details and images instantly
        </Text>

        <View style={styles.aiInputContainer}>
          <TextInput
            style={styles.aiInput}
            placeholder="https://example.com/product/123"
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={formData.productLink}
            onChangeText={(value) => handleChange('productLink', value)}
          />
          <TouchableOpacity
            style={styles.aiButton}
            onPress={analyzeProductLink}
            disabled={aiLoading || !formData.productLink}
          >
            {aiLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="flash" size={18} color="#FFFFFF" />
                <Text style={styles.aiButtonText}>Analyze</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* AI Suggestions */}
      {aiSuggestions && showAiSuggestions && (
        <View style={styles.aiSuggestionsCard}>
          <TouchableOpacity
            style={styles.aiSuggestionsHeader}
            onPress={() => setShowAiSuggestions(!showAiSuggestions)}
          >
            <View style={styles.aiSuggestionsHeaderLeft}>
              <Ionicons name="flash" size={20} color="#0f6eea" />
              <Text style={styles.aiSuggestionsTitle}>AI Suggestions Available</Text>
            </View>
            <Ionicons
              name={showAiSuggestions ? "chevron-up" : "chevron-down"}
              size={20}
              color="#666666"
            />
          </TouchableOpacity>

          {showAiSuggestions && (
            <View style={styles.aiSuggestionsContent}>
              <View style={styles.suggestionRow}>
                <Text style={styles.suggestionLabel}>Title Suggestion</Text>
                <View style={styles.suggestionBox}>
                  <Text style={styles.suggestionText}>{aiSuggestions.title}</Text>
                </View>
              </View>

              <View style={styles.suggestionRow}>
                <Text style={styles.suggestionLabel}>Category & Budget</Text>
                <View style={styles.suggestionChipRow}>
                  <View style={[styles.categoryChip, { backgroundColor: '#f0f7ff' }]}>
                    <Text style={styles.categoryChipText}>{aiSuggestions.category}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.budgetChip}
                    onPress={() => setShowFullBudget(!showFullBudget)}
                  >
                    <Text style={styles.budgetChipText} numberOfLines={showFullBudget ? 0 : 1}>
                      {aiSuggestions.budget}
                    </Text>
                    <Text style={styles.budgetChipToggle}>
                      {showFullBudget ? 'Read less' : 'Read more'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.suggestionRow}>
                <Text style={styles.suggestionLabel}>Description</Text>
                <View style={styles.suggestionBox}>
                  <Text style={styles.suggestionText}>{aiSuggestions.description}</Text>
                </View>
              </View>

              <View style={styles.suggestionRow}>
                <Text style={styles.suggestionLabel}>Requirements</Text>
                <View style={styles.suggestionBox}>
                  <Text style={styles.suggestionText}>{aiSuggestions.requirements}</Text>
                </View>
              </View>

              <View style={styles.suggestionActions}>
                <TouchableOpacity
                  style={[styles.suggestionButton, styles.suggestionButtonOutline]}
                  onPress={() => setShowAiSuggestions(false)}
                >
                  <Text style={styles.suggestionButtonOutlineText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.suggestionButton, styles.suggestionButtonPrimary]}
                  onPress={applyAiSuggestions}
                >
                  <Text style={styles.suggestionButtonPrimaryText}>Apply All</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Campaign Details Form */}
      <View style={styles.formSection}>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Campaign Title *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="document-text" size={20} color="#0f6eea" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g., Summer Collection Promotion"
              value={formData.title}
              onChangeText={(value) => handleChange('title', value)}
            />
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Campaign Description *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="document-text" size={20} color="#0f6eea" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your campaign goals, target audience, and key messaging..."
              value={formData.description}
              onChangeText={(value) => handleChange('description', value)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Requirements & Deliverables *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="checkbox" size={20} color="#0f6eea" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="What do influencers need to do? (e.g., Instagram post, Story, Reel, etc.)"
              value={formData.requirements}
              onChangeText={(value) => handleChange('requirements', value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <View style={styles.formSection}>
        <View style={styles.row}>
          <View style={[styles.inputWrapper, styles.halfWidth]}>
            <Text style={styles.inputLabel}>Currency *</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowCurrencyPicker(true)}
            >
              <Ionicons name="cash" size={20} color="#0f6eea" style={styles.inputIcon} />
              <Text style={styles.pickerButtonText}>
                {formData.currency} ({getCurrencySymbol()})
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666666" />
            </TouchableOpacity>
          </View>

          <View style={[styles.inputWrapper, styles.halfWidth]}>
            <Text style={styles.inputLabel}>Budget *</Text>
            <View style={[styles.inputContainer, budgetError ? styles.inputError : null]}>
              <Text style={styles.currencySymbol}>{getCurrencySymbol()}</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                value={formData.budget}
                onChangeText={(value) => handleChange('budget', value)}
                keyboardType="decimal-pad"
              />
            </View>
            {budgetError ? (
              <Text style={styles.errorText}>{budgetError}</Text>
            ) : (
              <Text style={styles.helperText}>
                Min: {getCurrencySymbol()}{MIN_BUDGET_BY_CURRENCY[formData.currency]}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Category *</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowCategoryPicker(true)}
          >
            <Ionicons name="apps" size={20} color="#0f6eea" style={styles.inputIcon} />
            <Text style={styles.pickerButtonText}>
              {formData.category || 'Select a category'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666666" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Application Deadline *</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => {
              setShowDatePicker(true);
            }}
          >
            <Ionicons name="calendar" size={20} color="#0f6eea" style={styles.inputIcon} />
            <Text style={styles.pickerButtonText}>
              {formData.deadline
                ? formData.deadline.toLocaleDateString() + ' ' + formData.deadline.toLocaleTimeString()
                : 'Select date and time'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Currency Picker Modal */}
      <Modal
        visible={showCurrencyPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCurrencyPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Currency</Text>
              <TouchableOpacity onPress={() => setShowCurrencyPicker(false)}>
                <Ionicons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={CURRENCIES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    formData.currency === item.code && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    handleChange('currency', item.code);
                    setShowCurrencyPicker(false);
                  }}
                >
                  <Text style={styles.modalItemCode}>{item.code}</Text>
                  <Text style={styles.modalItemName}>{item.name}</Text>
                  <Text style={styles.modalItemSymbol}>{item.symbol}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                <Ionicons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={CATEGORIES}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    formData.category === item.value && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    handleChange('category', item.value);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text style={styles.modalItemIcon}>{item.icon}</Text>
                  <Text style={styles.modalItemName}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Date Picker */}
      {/* Web Date Picker */}
      {Platform.OS === "web" ? (
        <input
          type="datetime-local"
          value={
            formData.deadline
              ? formData.deadline.toISOString().slice(0, 16)
              : ""
          }
          min={new Date().toISOString().slice(0, 16)}
          onChange={(e) => {
            const value = e.target.value;
            if (value) {
              handleChange("deadline", new Date(value));
            }
          }}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 12,
            border: "1px solid #E0E0E0",
            fontSize: 14,
          }}
        />
      ) : (
        <>
          {showDatePicker && (
            <DateTimePicker
              value={formData.deadline || new Date()}
              mode="date"
              minimumDate={getMinDate()}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                if (Platform.OS === "android") {
                  setShowDatePicker(false);
                }

                if (event.type === "set" && selectedDate) {
                  handleChange("deadline", selectedDate);
                  setShowTimePicker(true);
                }
              }}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={formData.deadline || new Date()}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedTime) => {
                if (Platform.OS === "android") {
                  setShowTimePicker(false);
                }

                if (event.type === "set" && selectedTime) {
                  const date = new Date(formData.deadline || new Date());
                  date.setHours(selectedTime.getHours());
                  date.setMinutes(selectedTime.getMinutes());

                  handleChange("deadline", date);
                }
              }}
            />
          )}
        </>
      )}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>
        <Ionicons name="eye" size={20} color="#0f6eea" /> Campaign Media & Final Review
      </Text>

      <View style={styles.mediaSection}>
        <View style={styles.mediaCard}>
          <Text style={styles.mediaCardTitle}>Media Assets</Text>

          {/* AI Image Generation */}
          <View style={styles.aiImageSection}>
            <View style={styles.aiImageHeader}>
              <Ionicons name="flash" size={18} color="#0f6eea" />
              <Text style={styles.aiImageTitle}>AI Image Generation</Text>
            </View>
            <TouchableOpacity
              style={styles.aiImageButton}
              onPress={() => generateCampaignImages(formData.title || 'marketing campaign')}
              disabled={imageGenLoading || !formData.title}
            >
              {imageGenLoading ? (
                <ActivityIndicator color="#0f6eea" size="small" />
              ) : (
                <>
                  <Ionicons name="color-wand" size={18} color="#0f6eea" />
                  <Text style={styles.aiImageButtonText}>
                    {imageGenLoading ? 'Generating Images...' : 'Generate AI Images'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
            <Text style={styles.aiImageHint}>
              Generate professional campaign images using AI based on your campaign title
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Manual Image Upload */}
          <View style={styles.uploadSection}>
            <View style={styles.uploadHeader}>
              <Ionicons name="image" size={18} color="#0f6eea" />
              <Text style={styles.uploadTitle}>Campaign Image *</Text>
            </View>

            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Ionicons name="cloud-upload" size={20} color="#0f6eea" />
              <Text style={styles.uploadButtonText}>
                {formData.campaignImage ? 'Change Image' : 'Upload Image'}
              </Text>
            </TouchableOpacity>

            {selectedImage && (
              <View style={styles.infoAlert}>
                <Ionicons name="information-circle" size={20} color="#0f6eea" />
                <Text style={styles.infoAlertText}>AI-generated image selected</Text>
              </View>
            )}

            {imagePreview && (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: imagePreview }} style={styles.imagePreview} />
              </View>
            )}
          </View>

          {/* Video Upload */}
          <View style={styles.uploadSection}>
            <View style={styles.uploadHeader}>
              <Ionicons name="videocam" size={18} color="#0f6eea" />
              <Text style={styles.uploadTitle}>Campaign Video (Optional)</Text>
            </View>

            <TouchableOpacity style={styles.uploadButton} onPress={pickVideo}>
              <Ionicons name="cloud-upload" size={20} color="#0f6eea" />
              <Text style={styles.uploadButtonText}>
                {formData.campaignVideo ? 'Change Video' : 'Upload Video'}
              </Text>
            </TouchableOpacity>

            {videoPreview && (
              <View style={styles.videoPreviewContainer}>
                <Video
                  source={{ uri: videoPreview }}
                  style={styles.videoPreview}
                  useNativeControls
                  resizeMode="contain"
                />
              </View>
            )}
          </View>
        </View>

        {/* Campaign Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCardTitle}>Campaign Summary</Text>

          <View style={styles.summaryItem}>
            <Ionicons name="document-text" size={18} color="#0f6eea" />
            <View style={styles.summaryItemContent}>
              <Text style={styles.summaryItemLabel}>Title</Text>
              <Text style={[
                styles.summaryItemValue,
                !formData.title && styles.summaryItemPlaceholder,
              ]}>
                {formData.title || 'Not set'}
              </Text>
            </View>
          </View>

          <View style={styles.summaryItem}>
            <Ionicons name="cash" size={18} color="#0f6eea" />
            <View style={styles.summaryItemContent}>
              <Text style={styles.summaryItemLabel}>Budget</Text>
              <Text style={styles.summaryItemValue}>
                {formData.budget ? `${getCurrencySymbol()}${formData.budget}` : 'Not set'}
              </Text>
            </View>
          </View>

          <View style={styles.summaryItem}>
            <Ionicons name="calendar" size={18} color="#0f6eea" />
            <View style={styles.summaryItemContent}>
              <Text style={styles.summaryItemLabel}>Deadline</Text>
              <Text style={styles.summaryItemValue}>
                {formData.deadline ? formData.deadline.toLocaleDateString() : 'Not set'}
              </Text>
            </View>
          </View>

          <View style={styles.summaryItem}>
            <Ionicons name="apps" size={18} color="#0f6eea" />
            <View style={styles.summaryItemContent}>
              <Text style={styles.summaryItemLabel}>Category</Text>
              <Text style={[
                styles.summaryItemValue,
                !formData.category && styles.summaryItemPlaceholder,
              ]}>
                {formData.category || 'Not set'}
              </Text>
            </View>
          </View>

          <View style={styles.summaryItem}>
            <Ionicons name="checkmark-circle" size={18} color="#0f6eea" />
            <View style={styles.summaryItemContent}>
              <Text style={styles.summaryItemLabel}>Media Ready</Text>
              <View style={styles.mediaChipContainer}>
                <View style={[
                  styles.mediaChip,
                  formData.campaignImage ? styles.mediaChipSuccess : styles.mediaChipError,
                ]}>
                  <Text style={styles.mediaChipText}>Image</Text>
                </View>
                <View style={[
                  styles.mediaChip,
                  formData.campaignVideo ? styles.mediaChipSuccess : styles.mediaChipDefault,
                ]}>
                  <Text style={styles.mediaChipText}>Video</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.previewLabel}>Description Preview</Text>
          <View style={styles.previewBox}>
            <Text style={[
              styles.previewText,
              !formData.description && styles.previewPlaceholder,
            ]}>
              {formData.description || 'No description provided'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.successContainer}>
      <View
        style={[styles.successIconContainer, { backgroundColor: '#4CAF50' }]}
      >
        <Ionicons name="checkmark" size={40} color="#FFFFFF" />
      </View>

      <Text style={styles.successTitle}>Campaign Launched Successfully!</Text>

      <Text style={styles.successMessage}>
        Your campaign is now live and visible to influencers. You can track applications and manage the campaign from your dashboard.
      </Text>

      <View style={styles.campaignSummaryCard}>
        {imagePreview && (
          <Image source={{ uri: imagePreview }} style={styles.campaignSummaryImage} />
        )}

        <View style={styles.campaignSummaryContent}>
          <View style={styles.campaignSummaryHeader}>
            <Text style={styles.campaignSummaryTitle}>{formData.title}</Text>
            <View style={styles.campaignSummaryCategory}>
              <Text style={styles.campaignSummaryCategoryText}>{formData.category}</Text>
            </View>
          </View>

          <View style={styles.campaignSummaryStats}>
            <View style={styles.campaignSummaryStat}>
              <Text style={styles.campaignSummaryStatLabel}>Budget</Text>
              <Text style={styles.campaignSummaryStatValue}>
                {getCurrencySymbol()}{formData.budget}
              </Text>
            </View>

            <View style={styles.campaignSummaryStat}>
              <Text style={styles.campaignSummaryStatLabel}>Deadline</Text>
              <Text style={styles.campaignSummaryStatValue}>
                {formData.deadline?.toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.campaignSummaryStat}>
              <Text style={styles.campaignSummaryStatLabel}>Campaign ID</Text>
              <Text style={styles.campaignSummaryStatValueId}>{campaignId}</Text>
            </View>

            <View style={styles.campaignSummaryStat}>
              <Text style={styles.campaignSummaryStatLabel}>Status</Text>
              <View style={styles.statusChip}>
                <Text style={styles.statusChipText}>Active</Text>
              </View>
            </View>
          </View>

          <View style={styles.campaignSummaryDetails}>
            <Text style={styles.campaignSummaryDetailsLabel}>Campaign Overview</Text>

            <View style={styles.campaignSummaryDetailRow}>
              <View style={styles.campaignSummaryDetailItem}>
                <Text style={styles.campaignSummaryDetailItemLabel}>Description</Text>
                <Text style={styles.campaignSummaryDetailItemValue}>
                  {formData.description || 'No description provided'}
                </Text>
              </View>

              <View style={styles.campaignSummaryDetailItem}>
                <Text style={styles.campaignSummaryDetailItemLabel}>Requirements</Text>
                <Text style={styles.campaignSummaryDetailItemValue}>
                  {formData.requirements || 'No requirements specified'}
                </Text>
              </View>

              <View style={styles.campaignSummaryDetailItem}>
                <Text style={styles.campaignSummaryDetailItemLabel}>Currency</Text>
                <Text style={styles.campaignSummaryDetailItemValue}>
                  {formData.currency}
                </Text>
              </View>

              <View style={styles.campaignSummaryDetailItem}>
                <Text style={styles.campaignSummaryDetailItemLabel}>Media Status</Text>
                <View style={styles.mediaChipContainer}>
                  <View style={[
                    styles.mediaChip,
                    formData.campaignImage ? styles.mediaChipSuccess : styles.mediaChipError,
                  ]}>
                    <Text style={styles.mediaChipText}>Image</Text>
                  </View>
                  <View style={[
                    styles.mediaChip,
                    formData.campaignVideo ? styles.mediaChipSuccess : styles.mediaChipDefault,
                  ]}>
                    <Text style={styles.mediaChipText}>Video</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.successActions}>
        <TouchableOpacity style={styles.successButtonOutline} onPress={handleCreateNew}>
          <Ionicons name="rocket" size={20} color="#0f6eea" />
          <Text style={styles.successButtonOutlineText}>Create Another Campaign</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.successButtonPrimary}
          onPress={() => router.push('/(brand)/(tabs)/campaigns')}
        >
          <Ionicons name="trending-up" size={20} color="#FFFFFF" />
          <Text style={styles.successButtonPrimaryText}>Go to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderImageGenerationModal = () => (
    <Modal
      visible={imageDialogOpen}
      transparent
      animationType="slide"
      onRequestClose={() => setImageDialogOpen(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, styles.imageModalContent]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Campaign Image</Text>
            <TouchableOpacity onPress={() => setImageDialogOpen(false)}>
              <Ionicons name="close" size={24} color="#333333" />
            </TouchableOpacity>
          </View>

          <Text style={styles.imageModalHint}>
            Choose one of the AI-generated images for your campaign. Tap to select or download.
          </Text>

          <FlatList
            data={generatedImages}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.imageGrid}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.imageGridItem,
                  selectedImage === item.url && styles.imageGridItemSelected,
                ]}
                onPress={() => selectGeneratedImage(item.url)}
              >
                <Image source={{ uri: item.url }} style={styles.gridImage} />
                <View style={styles.gridImageOverlay}>
                  <TouchableOpacity
                    style={styles.gridImageDownload}
                    onPress={() => downloadImage(item.url)}
                  >
                    <Ionicons name="download" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
                {selectedImage === item.url && (
                  <View style={styles.gridImageSelected}>
                    <Ionicons name="checkmark-circle" size={24} color="#0f6eea" />
                  </View>
                )}
              </TouchableOpacity>
            )}
          />

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonOutline]}
              onPress={() => setImageDialogOpen(false)}
            >
              <Text style={styles.modalButtonOutlineText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonPrimary]}
              onPress={() => generateCampaignImages(formData.title || 'marketing campaign')}
              disabled={imageGenLoading}
            >
              {imageGenLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="color-wand" size={18} color="#FFFFFF" />
                  <Text style={styles.modalButtonPrimaryText}>Generate More</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Animated.ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 100 } // Add padding for tab bar
          ]}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          {/* Header */}
          <View style={styles.header}>
            {logoUrl ? (
              <View style={styles.logoContainer}>
                <Image source={{ uri: logoUrl }} style={styles.logo} />
              </View>
            ) : (
              <Ionicons name="rocket" size={32} color="#0f6eea" />
            )}
          </View>

          <Text style={styles.title}>Create New Campaign</Text>
          <Text style={styles.subtitle}>
            Launch your influencer marketing campaign with precision. Follow the steps below to create an engaging campaign.
          </Text>

          {renderStepIndicator()}

          {/* Error Alert */}
          {error ? (
            <View style={styles.errorAlert}>
              <Ionicons name="alert-circle" size={20} color="#FF3B30" />
              <Text style={styles.errorAlertText}>
                {typeof error === "string" ? error : JSON.stringify(error)}
              </Text>
              <TouchableOpacity onPress={() => setError('')}>
                <Ionicons name="close" size={18} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Step Content */}
          <View style={styles.content}>
            {activeStep === 0 ? renderStep0() : null}
            {activeStep === 1 ? renderStep1() : null}
            {activeStep === 2 ? renderStep2() : null}
            {activeStep === 3 ? renderStep3() : null}
          </View>

          {/* Navigation Buttons (Hidden on Success Step) */}
          {activeStep !== 3 && (
            <View style={styles.navigation}>
              <TouchableOpacity
                style={[styles.navButton, styles.navButtonOutline]}
                onPress={activeStep === 0 ? handleCreateNew : handleBack}
                disabled={loading}
              >
                <Ionicons name="arrow-back" size={20} color="#0f6eea" />
                <Text style={styles.navButtonOutlineText}>
                  {activeStep === 0 ? 'Reset Form' : 'Back'}
                </Text>
              </TouchableOpacity>

              {activeStep === STEPS.length - 2 ? (
                <TouchableOpacity
                  style={[styles.navButton, styles.navButtonPrimary, loading && styles.navButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={loading || !formData.campaignImage}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                      <Text style={styles.navButtonPrimaryText}>Launch Campaign</Text>
                    </>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.navButton, styles.navButtonPrimary]}
                  onPress={handleNext}
                >
                  <Text style={styles.navButtonPrimaryText}>Next</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </Animated.ScrollView>
      </KeyboardAvoidingView>

      {renderImageGenerationModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoContainer: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logo: {
    height: 36,
    width: 'auto',
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  stepWrapper: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepCircleActive: {
    backgroundColor: '#0f6eea',
  },
  stepCircleCompleted: {
    backgroundColor: '#4CAF50',
  },
  stepText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999999',
  },
  stepTextActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#999999',
    textAlign: 'center',
  },
  stepLabelActive: {
    color: '#0f6eea',
  },
  stepLine: {
    position: 'absolute',
    top: 15,
    right: -8,
    width: '100%',
    height: 2,
    backgroundColor: '#E0E0E0',
    zIndex: -1,
  },
  stepLineActive: {
    backgroundColor: '#0f6eea',
  },
  content: {
    flex: 1,
  },
  stepContent: {
    paddingVertical: 16,
  },
  aiCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  aiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  aiCardSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
  },
  aiInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  aiInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  aiButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aiButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  aiSuggestionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  aiSuggestionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  aiSuggestionsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiSuggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  aiSuggestionsContent: {
    padding: 16,
    paddingTop: 0,
  },
  suggestionRow: {
    marginBottom: 12,
  },
  suggestionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0f6eea',
    marginBottom: 4,
  },
  suggestionBox: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  suggestionText: {
    fontSize: 13,
    color: '#666666',
  },
  suggestionChipRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
  },
  categoryChipText: {
    fontSize: 12,
    color: '#0f6eea',
    fontWeight: '500',
  },
  budgetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#0f6eea',
  },
  budgetChipText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  budgetChipToggle: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  suggestionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
  suggestionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  suggestionButtonOutline: {
    borderWidth: 1,
    borderColor: '#0f6eea',
    backgroundColor: 'transparent',
  },
  suggestionButtonOutlineText: {
    color: '#0f6eea',
    fontSize: 13,
    fontWeight: '500',
  },
  suggestionButtonPrimary: {
    backgroundColor: '#0f6eea',
  },
  suggestionButtonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333333',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    fontSize: 11,
    color: '#FF3B30',
    marginTop: 4,
  },
  helperText: {
    fontSize: 11,
    color: '#999999',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f6eea',
    marginRight: 4,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  pickerButtonText: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
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
    fontWeight: '600',
    color: '#333333',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalItemSelected: {
    backgroundColor: '#F0F7FF',
  },
  modalItemCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    width: 50,
  },
  modalItemName: {
    flex: 1,
    fontSize: 14,
    color: '#666666',
  },
  modalItemSymbol: {
    fontSize: 16,
    color: '#333333',
  },
  modalItemIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mediaSection: {
    gap: 16,
  },
  mediaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  mediaCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f6eea',
    marginBottom: 16,
  },
  aiImageSection: {
    marginBottom: 16,
  },
  aiImageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  aiImageTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  aiImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#0f6eea',
    borderRadius: 12,
    padding: 12,
    marginBottom: 4,
  },
  aiImageButtonText: {
    fontSize: 14,
    color: '#0f6eea',
    fontWeight: '500',
  },
  aiImageHint: {
    fontSize: 11,
    color: '#999999',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  uploadSection: {
    marginBottom: 16,
  },
  uploadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#0f6eea',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
  },
  uploadButtonText: {
    fontSize: 14,
    color: '#0f6eea',
    fontWeight: '500',
  },
  infoAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0F7FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  infoAlertText: {
    flex: 1,
    fontSize: 13,
    color: '#0f6eea',
  },
  imagePreviewContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  videoPreviewContainer: {
    marginTop: 12,
  },
  videoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#000000',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  summaryCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f6eea',
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  summaryItemContent: {
    flex: 1,
  },
  summaryItemLabel: {
    fontSize: 11,
    color: '#999999',
    marginBottom: 2,
  },
  summaryItemValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333333',
  },
  summaryItemPlaceholder: {
    color: '#999999',
    fontStyle: 'italic',
  },
  mediaChipContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  mediaChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mediaChipSuccess: {
    backgroundColor: '#E8F5E9',
  },
  mediaChipError: {
    backgroundColor: '#FFEBEE',
  },
  mediaChipDefault: {
    backgroundColor: '#F5F5F5',
  },
  mediaChipText: {
    fontSize: 11,
    fontWeight: '500',
  },
  previewLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 8,
  },
  previewBox: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  previewText: {
    fontSize: 13,
    color: '#333333',
  },
  previewPlaceholder: {
    color: '#999999',
    fontStyle: 'italic',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 24,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  navButtonOutline: {
    borderWidth: 1,
    borderColor: '#0f6eea',
    backgroundColor: 'transparent',
  },
  navButtonOutlineText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f6eea',
  },
  navButtonPrimary: {
    backgroundColor: '#0f6eea',
  },
  navButtonPrimaryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  errorAlert: {
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
  },
  errorAlertText: {
    flex: 1,
    fontSize: 13,
    color: '#FF3B30',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  campaignSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
    width: '100%',
  },
  campaignSummaryImage: {
    width: '100%',
    height: 150,
  },
  campaignSummaryContent: {
    padding: 16,
  },
  campaignSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  campaignSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
  },
  campaignSummaryCategory: {
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  campaignSummaryCategoryText: {
    fontSize: 11,
    color: '#0f6eea',
    fontWeight: '500',
  },
  campaignSummaryStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  campaignSummaryStat: {
    minWidth: '45%',
  },
  campaignSummaryStatLabel: {
    fontSize: 11,
    color: '#999999',
    marginBottom: 2,
  },
  campaignSummaryStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  campaignSummaryStatValueId: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#666666',
  },
  statusChip: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusChipText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '500',
  },
  campaignSummaryDetails: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 16,
  },
  campaignSummaryDetailsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  campaignSummaryDetailRow: {
    gap: 12,
  },
  campaignSummaryDetailItem: {
    marginBottom: 8,
  },
  campaignSummaryDetailItemLabel: {
    fontSize: 11,
    color: '#999999',
    marginBottom: 2,
  },
  campaignSummaryDetailItemValue: {
    fontSize: 13,
    color: '#666666',
  },
  successActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  successButtonOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#0f6eea',
    borderRadius: 12,
    paddingVertical: 14,
  },
  successButtonOutlineText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0f6eea',
  },
  successButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0f6eea',
    borderRadius: 12,
    paddingVertical: 14,
  },
  successButtonPrimaryText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  imageModalContent: {
    maxHeight: '90%',
  },
  imageModalHint: {
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
  },
  imageGrid: {
    justifyContent: 'space-between',
  },
  imageGridItem: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  imageGridItemSelected: {
    borderColor: '#0f6eea',
  },
  gridImage: {
    width: '100%',
    height: 150,
  },
  gridImageOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  gridImageDownload: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
    padding: 6,
  },
  gridImageSelected: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  modalButtonOutline: {
    borderWidth: 1,
    borderColor: '#0f6eea',
    backgroundColor: 'transparent',
  },
  modalButtonOutlineText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f6eea',
  },
  modalButtonPrimary: {
    backgroundColor: '#0f6eea',
  },
  modalButtonPrimaryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});