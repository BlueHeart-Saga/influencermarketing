// C:\Sagadevan\quickbox\mobile\app\(brand)\connections.tsx
import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { AuthContext } from "../../../../contexts/AuthContext";
import profileAPI from "../../../../services/profileAPI";
import { Ionicons } from '@expo/vector-icons';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

const ConnectionsScreen = () => {
  const { token, user } = useContext(AuthContext);
  const router = useRouter();
  const params = useLocalSearchParams();
  const { type, userId } = params;

  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getFileUrl = (fileId: string) => `${API_BASE_URL}/profiles/image/${fileId}`;

  const fetchConnections = async () => {
    if (!token || !userId) return;

    // 🛠️ Resolve 'me'
    const effectiveUserId = userId === 'me'
      ? (user?._id || user?.id)?.toString()
      : userId.toString();

    if (!effectiveUserId) return;

    try {
      let data;
      if (type === 'followers') {
        data = await profileAPI.getFollowers(effectiveUserId);
      } else {
        data = await profileAPI.getFollowing(effectiveUserId);
      }
      setConnections(data || []);
    } catch (err) {
      console.error("Error fetching connections:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [token, userId, type]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchConnections();
  };

  const renderConnection = ({ item }: { item: any }) => {
    const displayName = item.company_name || item.full_name || item.nickname || "Unknown User";
    const profilePicture = item.profile_picture;

    return (
      <TouchableOpacity
        style={styles.connectionItem}
        onPress={() => {
          // Navigate to user's profile
          Alert.alert("View Profile", `View ${displayName}'s profile?`);
        }}
      >
        {profilePicture ? (
          <Image source={{ uri: getFileUrl(profilePicture) }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarPlaceholderText}>{displayName[0].toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{displayName}</Text>
          {item.email && <Text style={styles.userEmail}>{item.email}</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: type === 'followers' ? 'Followers' : 'Following',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.canGoBack() ? router.back() : router.replace('/(brand)/(tabs)/account')}
              style={{ marginLeft: 15 }}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
          ),
        }}
      />
      <FlatList
        data={connections}
        renderItem={renderConnection}
        keyExtractor={(item) => item._id || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name={type === 'followers' ? 'people-outline' : 'person-outline'}
              size={60}
              color="#ccc"
            />
            <Text style={styles.emptyText}>
              {type === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  connectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarPlaceholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
});

export default ConnectionsScreen;