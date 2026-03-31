// C:\Sagadevan\quickbox\mobile\app\shared\ai-tools\voice-to-text.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
  TextInput,
  Share,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Audio } from 'expo-audio';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

// Types for speech recognition (platform specific)
interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
  };
}

interface SpeechRecognitionError {
  error: string;
}

// Constants
const BLUE = "#0f6eea";
const BLUE_LIGHT = "#3d8ef5";
const BLUE_DARK = "#0a4faa";
const WHITE = "#ffffff";
const BLACK = "#1e2937";
const GRAY = "#64748b";
const LIGHT_GRAY = "#f1f5f9";

// Language options with native names
const LANGUAGES = [
  { code: 'en-US', name: 'English (US)', nativeName: 'English' },
  { code: 'en-GB', name: 'English (UK)', nativeName: 'English' },
  { code: 'es-ES', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr-FR', name: 'French', nativeName: 'Français' },
  { code: 'de-DE', name: 'German', nativeName: 'Deutsch' },
  { code: 'it-IT', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português' },
  { code: 'pt-PT', name: 'Portuguese (Portugal)', nativeName: 'Português' },
  { code: 'ru-RU', name: 'Russian', nativeName: 'Русский' },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文' },
  { code: 'ko-KR', name: 'Korean', nativeName: '한국어' },
  { code: 'ar-SA', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn-BD', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'pa-IN', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'ur-PK', name: 'Urdu', nativeName: 'اردو' },
  { code: 'tr-TR', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ml-IN', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'kn-IN', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'gu-IN', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'mr-IN', name: 'Marathi', nativeName: 'मराठी' },
];

const VoiceToTextAI = () => {
  const navigation = useNavigation();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const [isSupported, setIsSupported] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [transcriptHistory, setTranscriptHistory] = useState<string[]>([]);

  const recognitionRef = useRef<any>(null);
  const audioLevelInterval = useRef<NodeJS.Timeout>();
  const durationInterval = useRef<NodeJS.Timeout>();

  // Request microphone permissions on mount
  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status !== 'granted') {
        setShowPermissionModal(true);
      }
    })();
  }, []);

  // Initialize speech recognition for web/native
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Web speech recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setIsSupported(false);
        return;
      }

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language;

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          Alert.alert(
            'Microphone Access Denied',
            'Please enable microphone permissions in your browser settings.'
          );
        }
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (audioLevelInterval.current) {
        clearInterval(audioLevelInterval.current);
      }
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, [language]);

  // Start/stop recording based on listening state
  useEffect(() => {
    if (isListening) {
      startRecording();
    } else {
      stopRecording();
    }
  }, [isListening]);

  const startRecording = async () => {
    try {
      if (hasPermission !== true) {
        setShowPermissionModal(true);
        setIsListening(false);
        return;
      }

      setIsProcessing(true);

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);

      // Start audio level monitoring (simulated for demo)
      audioLevelInterval.current = setInterval(() => {
        setAudioLevel(Math.random() * 0.8 + 0.2);
      }, 100);

      // Start duration timer
      setRecordingDuration(0);
      durationInterval.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      setIsProcessing(false);

      // For web, use web speech API
      if (Platform.OS === 'web' && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error('Failed to start recognition:', e);
        }
      } else {
        // For native, we'd integrate with a native speech-to-text service
        // This is a placeholder for native implementation
        Alert.alert(
          'Native Speech Recognition',
          'On native platforms, you would integrate with platform-specific speech recognition services.'
        );
        setIsListening(false);
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsListening(false);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    try {
      // Stop web recognition
      if (Platform.OS === 'web' && recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }

      // Stop recording
      if (recording) {
        await recording.stopAndUnloadAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
        });
        setRecording(null);
      }

      // Clear intervals
      if (audioLevelInterval.current) {
        clearInterval(audioLevelInterval.current);
      }
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
      setAudioLevel(0);

      setIsProcessing(false);
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const toggleListening = () => {
    if (!isSupported) {
      Alert.alert(
        'Not Supported',
        'Speech recognition is not supported on this device/browser.'
      );
      return;
    }

    if (hasPermission !== true) {
      setShowPermissionModal(true);
      return;
    }

    if (isListening) {
      setIsListening(false);
      // Save to history if there's transcript
      if (transcript.trim()) {
        setTranscriptHistory(prev => [transcript, ...prev].slice(0, 10));
      }
    } else {
      setTranscript('');
      setIsListening(true);
    }
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(transcript);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const clearText = () => {
    setTranscript('');
  };

  const shareText = async () => {
    try {
      await Share.share({
        message: transcript,
        title: 'Voice Transcription',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const saveToFile = async () => {
    try {
      const fileName = `transcription-${Date.now()}.txt`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(filePath, transcript);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath);
      } else {
        Alert.alert('Saved', `File saved to: ${filePath}`);
      }
    } catch (error) {
      console.error('Error saving file:', error);
      Alert.alert('Error', 'Failed to save file');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const requestPermissions = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    setHasPermission(status === 'granted');
    setShowPermissionModal(false);
    
    if (status === 'granted' && isListening) {
      startRecording();
    }
  };

  // Get current language display name
  const getCurrentLanguage = () => {
    const lang = LANGUAGES.find(l => l.code === language);
    return lang ? `${lang.nativeName} (${lang.name})` : language;
  };

  if (!isSupported) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[BLUE_LIGHT, BLUE, BLUE_DARK]}
          style={styles.headerGradient}
        >
          <Ionicons name="mic-off" size={50} color={WHITE} />
          <Text style={styles.title}>Not Supported</Text>
          <Text style={styles.subtitle}>
            Speech recognition is not supported on this device/browser.
          </Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      
        <View style={styles.headerGradient}>
        <Text onPress={() => navigation.goBack()} style={styles.headerTitle}>Voice-to-Text AI</Text>
        <Text style={styles.headerSubtitle}>Real-time speech recognition</Text>
    </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Controls */}
        <View style={styles.controlsContainer}>
          {/* Language Selector */}
          <TouchableOpacity
            style={styles.languageSelector}
            onPress={() => setShowLanguageModal(true)}
            disabled={isListening}
          >
            <Ionicons name="language-outline" size={20} color={BLUE} />
            <Text style={styles.languageText} numberOfLines={1}>
              {getCurrentLanguage()}
            </Text>
            <Ionicons name="chevron-down" size={20} color={GRAY} />
          </TouchableOpacity>

          {/* Main Record Button */}
          <TouchableOpacity
            style={[
              styles.recordButton,
              isListening && styles.recordButtonActive,
              (!hasPermission || isProcessing) && styles.recordButtonDisabled,
            ]}
            onPress={toggleListening}
            disabled={!hasPermission || isProcessing}
          >
            <LinearGradient
              colors={isListening ? ['#FF3B30', '#FF6B6B'] : [BLUE_LIGHT, BLUE_DARK]}
              style={styles.recordGradient}
            >
              {isProcessing ? (
                <ActivityIndicator color={WHITE} />
              ) : (
                <Ionicons
                  name={isListening ? 'stop' : 'mic'}
                  size={32}
                  color={WHITE}
                />
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Recording Status */}
          {isListening && (
            <View style={styles.recordingStatus}>
              <View style={styles.audioLevelContainer}>
                <View style={[styles.audioLevel, { width: `${audioLevel * 100}%` }]} />
              </View>
              <View style={styles.statusRow}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>
                  Recording... {formatDuration(recordingDuration)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, !transcript && styles.actionButtonDisabled]}
            onPress={copyToClipboard}
            disabled={!transcript}
          >
            <Ionicons 
              name={isCopied ? 'checkmark' : 'copy-outline'} 
              size={20} 
              color={transcript ? BLUE : GRAY} 
            />
            <Text style={[styles.actionText, !transcript && styles.actionTextDisabled]}>
              {isCopied ? 'Copied!' : 'Copy'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, !transcript && styles.actionButtonDisabled]}
            onPress={clearText}
            disabled={!transcript}
          >
            <Ionicons name="trash-outline" size={20} color={transcript ? '#FF3B30' : GRAY} />
            <Text style={[styles.actionText, !transcript && styles.actionTextDisabled]}>
              Clear
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, !transcript && styles.actionButtonDisabled]}
            onPress={shareText}
            disabled={!transcript}
          >
            <Ionicons name="share-outline" size={20} color={transcript ? BLUE : GRAY} />
            <Text style={[styles.actionText, !transcript && styles.actionTextDisabled]}>
              Share
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, !transcript && styles.actionButtonDisabled]}
            onPress={saveToFile}
            disabled={!transcript}
          >
            <Ionicons name="download-outline" size={20} color={transcript ? BLUE : GRAY} />
            <Text style={[styles.actionText, !transcript && styles.actionTextDisabled]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>

        {/* Transcript */}
        <View style={styles.transcriptContainer}>
          <View style={styles.transcriptHeader}>
            <Text style={styles.transcriptTitle}>Transcript</Text>
            <Text style={styles.wordCount}>
              {transcript.split(/\s+/).filter(Boolean).length} words
            </Text>
          </View>
          <ScrollView style={styles.transcriptBox}>
            <Text style={styles.transcriptText}>
              {transcript || (
                isListening ? 
                  'Listening... Speak now and your words will appear here.' : 
                  'Tap the microphone button and start speaking to see your transcription.'
              )}
            </Text>
          </ScrollView>
        </View>

        {/* History */}
        {transcriptHistory.length > 0 && (
          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>Recent Transcriptions</Text>
            {transcriptHistory.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.historyItem}
                onPress={() => setTranscript(item)}
              >
                <Text style={styles.historyText} numberOfLines={2}>
                  {item}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={GRAY} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Tips for best results</Text>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color={BLUE} />
            <Text style={styles.tipText}>Speak clearly and at a moderate pace</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color={BLUE} />
            <Text style={styles.tipText}>Use in a quiet environment</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color={BLUE} />
            <Text style={styles.tipText}>Position microphone close to your mouth</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color={BLUE} />
            <Text style={styles.tipText}>Avoid background noise for better accuracy</Text>
          </View>
        </View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Language</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Ionicons name="close" size={24} color={BLACK} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.languageList}>
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageItem,
                    language === lang.code && styles.languageItemActive,
                  ]}
                  onPress={() => {
                    setLanguage(lang.code);
                    setShowLanguageModal(false);
                  }}
                >
                  <View style={styles.languageInfo}>
                    <Text style={styles.languageNative}>{lang.nativeName}</Text>
                    <Text style={styles.languageName}>{lang.name}</Text>
                  </View>
                  {language === lang.code && (
                    <Ionicons name="checkmark" size={20} color={BLUE} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Permission Modal */}
      <Modal
        visible={showPermissionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPermissionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="mic" size={60} color={BLUE} />
            <Text style={styles.modalTitle}>Microphone Access Required</Text>
            <Text style={styles.modalDescription}>
              Voice-to-Text needs microphone access to transcribe your speech. 
              Please enable microphone permissions in your device settings.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={requestPermissions}
              >
                <Text style={styles.modalButtonText}>Grant Permission</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonOutline]}
                onPress={() => setShowPermissionModal(false)}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonOutlineText]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: "#0f6eea",
  },
  backButton: {
  position: "absolute",
  left: 16,
  top: Platform.OS === "ios" ? 60 : 40,
  zIndex: 10,

  width: 40,
  height: 40,
  borderRadius: 20,

  justifyContent: "center",
  alignItems: "center",

},
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: WHITE,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  controlsContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LIGHT_GRAY,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 20,
    maxWidth: '90%',
  },
  languageText: {
    fontSize: 14,
    color: BLACK,
    marginHorizontal: 8,
    flex: 1,
  },
  recordButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
    marginBottom: 15,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  recordButtonActive: {
    shadowColor: '#FF3B30',
  },
  recordButtonDisabled: {
    opacity: 0.5,
  },
  recordGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingStatus: {
    width: '100%',
    marginTop: 10,
  },
  audioLevelContainer: {
    height: 4,
    backgroundColor: LIGHT_GRAY,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  audioLevel: {
    height: '100%',
    backgroundColor: BLUE,
    borderRadius: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    marginRight: 8,
  },
  recordingText: {
    fontSize: 14,
    color: GRAY,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  actionButton: {
    alignItems: 'center',
    padding: 10,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionText: {
    fontSize: 12,
    color: BLACK,
    marginTop: 4,
  },
  actionTextDisabled: {
    color: GRAY,
  },
  transcriptContainer: {
    backgroundColor: LIGHT_GRAY,
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    minHeight: 150,
  },
  transcriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  transcriptTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: BLACK,
  },
  wordCount: {
    fontSize: 12,
    color: GRAY,
  },
  transcriptBox: {
    maxHeight: 200,
  },
  transcriptText: {
    fontSize: 16,
    lineHeight: 24,
    color: BLACK,
  },
  historyContainer: {
    marginBottom: 20,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: BLACK,
    marginBottom: 10,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: LIGHT_GRAY,
  },
  historyText: {
    flex: 1,
    fontSize: 14,
    color: GRAY,
    marginRight: 10,
  },
  tipsContainer: {
    backgroundColor: LIGHT_GRAY,
    borderRadius: 20,
    padding: 15,
    marginBottom: 30,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: BLACK,
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: GRAY,
    marginLeft: 10,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BLACK,
  },
  languageList: {
    maxHeight: 400,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_GRAY,
  },
  languageItemActive: {
    backgroundColor: BLUE + '10',
  },
  languageInfo: {
    flex: 1,
  },
  languageNative: {
    fontSize: 16,
    fontWeight: '600',
    color: BLACK,
  },
  languageName: {
    fontSize: 12,
    color: GRAY,
    marginTop: 2,
  },
  modalDescription: {
    fontSize: 14,
    color: GRAY,
    textAlign: 'center',
    marginVertical: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  modalButton: {
    backgroundColor: BLUE,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  modalButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: BLUE,
  },
  modalButtonText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
  modalButtonOutlineText: {
    color: BLUE,
  },
});

export default VoiceToTextAI;