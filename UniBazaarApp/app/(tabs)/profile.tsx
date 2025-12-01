import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import { router } from 'expo-router';

export default function ProfileScreen() {

  const user = auth.currentUser;

  const userName = user?.displayName || "User";

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color="#00000" />
        </TouchableOpacity>
      </View>

        <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => handleNavigation('profile_pages/userHomepage')}
        >
            <View style={styles.profileCard}>
                <Image source={require('../../assets/images/chair.png')} style={styles.avatar} />
                <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>{userName}</Text>
                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={16} color="#FE8A0D" />
                        <Ionicons name="star" size={16} color="#FE8A0D" />
                        <Ionicons name="star" size={16} color="#FE8A0D" />
                        <Ionicons name="star" size={16} color="#FE8A0D" />
                        <Ionicons name="star-half" size={16} color="#FE8A0D" />
                    </View>
                </View>
                <TouchableOpacity>
                    <Ionicons name ="chevron-forward-outline" size={24} color="#C7C7CC" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>

<View style={styles.section}>
        <Text style={styles.sectionTitle}>Buying</Text>
        <View style={styles.iconGrid}>
          <View style={styles.iconContainer}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => handleNavigation('profile_pages/favourite')}>
              <Ionicons name="heart-outline" size={28} color="#FF7E3E" />
            </TouchableOpacity>
            <Text style={styles.iconLabel}>Favourite</Text>
          </View>
          <View style={styles.iconContainer}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => handleNavigation('profile_pages/purchased')}>
              <Ionicons name="cart-outline" size={28} color="#FF7E3E" />
            </TouchableOpacity>
            <Text style={styles.iconLabel}>Purchased</Text>
          </View>
          <View style={styles.iconContainer}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => handleNavigation('profile_pages/toReview')}>
              <Ionicons name="chatbox-outline" size={28} color="#FF7E3E" />
            </TouchableOpacity>
            <Text style={styles.iconLabel}>To Review</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Selling</Text>
        <View style={styles.iconGrid}>
          <View style={styles.iconContainer}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => handleNavigation('profile_pages/sold')}>
              <Ionicons name="pricetag-outline" size={28} color="#FF7E3E" />
            </TouchableOpacity>
            <Text style={styles.iconLabel}>Sold</Text>
          </View>
          <View style={styles.iconContainer}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => handleNavigation('profile_pages/listed')}>
              <Ionicons name="cube-outline" size={28} color="#FF7E3E" />
            </TouchableOpacity>
            <Text style={styles.iconLabel}>Listed</Text>
          </View>
          <View style={styles.iconContainer}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => handleNavigation('profile_pages/viewMore')}>
              <Ionicons name="grid-outline" size={28} color="#FF7E3E" />
            </TouchableOpacity>
            <Text style={styles.iconLabel}>View more</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Ionicons name="log-out-outline" size={24} color="#D0021B" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>UniBazaar v1.0.0</Text>
        <Text style={styles.footerSubText}>Safe trading for SFU students</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: '90%',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  reviewsText: {
    color: '#FE8A0D',
    fontSize: 14,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  iconGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  iconContainer: {
    alignItems: 'center',
    width: 80,
  },
  iconButton: {
    width: 60,
    height: 60,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    position: 'relative',
  },
  iconButtonActive: {
    backgroundColor: '#FFEEDB',
  },
  iconLabel: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF7E3E',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 20,
    marginTop: 20,
    width: '90%',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  logoutText: {
    color: '#D0021B',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
  footerSubText: {
    fontSize: 12,
    color: '#999',
  },
});