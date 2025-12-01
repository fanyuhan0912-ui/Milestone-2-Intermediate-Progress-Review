// app/profile_pages/userHomepage.tsx
import React, { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { setDoc } from "firebase/firestore";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db, auth } from "../../firebase/firebaseConfig";

interface UserProfile {
  fullName: string;
  university: string;
  avatarUrl?: string | null;
  backgroundUrl?: string | null;
}

export default function UserHomepageScreen() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"items" | "reviews">("items");
  const [listedItems, setListedItems] = useState<any[]>([]);
  const user = auth.currentUser;

  // --------------------------------------------------------------
  // ⭐ Functions: pick image
  // --------------------------------------------------------------
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }
    return null;
  };

  // --------------------------------------------------------------
  // ⭐ Functions: Upload image to Firebase Storage (EXPO SAFE METHOD)
  // --------------------------------------------------------------
  const uploadToStorage = async (uri: string, path: string) => {
    const storage = getStorage();

    const blob: Blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => resolve(xhr.response);
      xhr.onerror = () => reject(new Error("Image upload failed"));
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });

    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  // --------------------------------------------------------------
  // ⭐ Load User Profile
  // --------------------------------------------------------------
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      const displayName = user.displayName || "";

      const userDocRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserProfile({
          fullName: displayName || (data.fullName ?? "User"),
          university: data.university || "Simon Fraser University",
          avatarUrl: data.avatarUrl || null,
          backgroundUrl: data.backgroundUrl || null,
        });
      } else {
        setUserProfile({
          fullName: displayName || "User",
          university: "Simon Fraser University",
          avatarUrl: null,
          backgroundUrl: null,
        });
      }

      setLoading(false);
    };

    fetchUserData();
  }, []);

  // --------------------------------------------------------------
  // ⭐ Load user listed items
  // --------------------------------------------------------------
  useEffect(() => {
    const fetchListedItems = async () => {
      if (!user) return;

      const q = query(
        collection(db, "items"),
        where("sellerId", "==", user.uid)
      );

      const snap = await getDocs(q);
      const items = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      setListedItems(items);
    };

    fetchListedItems();
  }, [user]);

  const openDetail = (id: string) => {
    router.push({ pathname: "/item/[id]", params: { id } });
  };

  if (loading)
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );

  if (!userProfile)
    return (
      <SafeAreaView style={styles.container}>
        <Text>User profile not found.</Text>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>

        {/* Back Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* --------------------------------------------------------------
            ⭐ Profile Header with Background Upload
        -------------------------------------------------------------- */}
        <View style={styles.profileHeader}>
          <TouchableOpacity
            onPress={async () => {
              if (!user) return;

              const uri = await pickImage();
              if (!uri) return;

              const downloadURL = await uploadToStorage(
                uri,
                `users/${user.uid}/background.jpg`
              );

              await setDoc(
                doc(db, "users", user.uid),
                { backgroundUrl: downloadURL },
                { merge: true }
              );

              setUserProfile((prev) => ({ ...prev!, backgroundUrl: downloadURL }));
            }}
          >
            <Image
              source={
                userProfile.backgroundUrl
                  ? { uri: userProfile.backgroundUrl }
                  : require("../../assets/images/chair.png")
              }
              style={styles.backgroundImage}
              blurRadius={10}
            />
          </TouchableOpacity>

          {/* Avatar */}
          <View style={styles.profileInfoContainer}>
            <TouchableOpacity
              onPress={async () => {
                if (!user) return;

                const uri = await pickImage();
                if (!uri) return;

                const downloadURL = await uploadToStorage(
                  uri,
                  `users/${user.uid}/avatar.jpg`
                );

                await setDoc(
                  doc(db, "users", user.uid),
                  { avatarUrl: downloadURL },
                  { merge: true }
                );

                setUserProfile((prev) => ({ ...prev!, avatarUrl: downloadURL }));
              }}
            >
              <Image
                source={
                  userProfile.avatarUrl
                    ? { uri: userProfile.avatarUrl }
                    : require("../../assets/images/chair.png")
                }
                style={styles.avatar}
              />
            </TouchableOpacity>

            <View style={styles.profileTextContainer}>
              <Text style={styles.profileName}>{userProfile.fullName}</Text>
              <View style={styles.statsContainer}>
                <Text style={styles.statsText}>3 followers</Text>
                <Text style={styles.statsText}>15 following</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.universityBadge}>
            <Ionicons name="location-outline" size={12} color="#888" />
            <Text style={styles.universityText}>{userProfile.university}</Text>
          </View>
        </View>

        {/* -------------------------------------------------------------- */}
        {/* ⭐ Tabs */}
        {/* -------------------------------------------------------------- */}
        <View style={styles.tabs}>
          <TouchableOpacity onPress={() => setActiveTab("items")}>
            <Text style={[styles.tabText, activeTab === "items" && styles.tabActive]}>
              Items
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setActiveTab("reviews")}>
            <Text style={[styles.tabText, activeTab === "reviews" && styles.tabActive]}>
              Reviews
            </Text>
          </TouchableOpacity>
        </View>

        {/* -------------------------------------------------------------- */}
        {/* ⭐ Items List */}
        {/* -------------------------------------------------------------- */}
        {activeTab === "items" && (
          <View style={styles.itemsContainer}>
            {listedItems.length === 0 ? (
              <Text style={styles.noItems}>No items listed yet.</Text>
            ) : (
              listedItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.itemCard}
                  onPress={() => openDetail(item.id)}
                >
                  <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>${item.price}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* -------------------------------------------------------------- */}
        {/* ⭐ Reviews */}
        {/* -------------------------------------------------------------- */}
        {activeTab === "reviews" && (
          <View style={styles.itemsContainer}>
            <Text style={styles.noItems}>No reviews yet.</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

/* --------------------------------------------------------------
   Styles
-------------------------------------------------------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { paddingHorizontal: 15, paddingVertical: 10 },
  profileHeader: { marginBottom: 10 },
  backgroundImage: { width: "100%", height: 200 },

  profileInfoContainer: {
    position: "absolute",
    top: 70,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "flex-end",
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#fff",
  },

  profileTextContainer: { flex: 1, marginLeft: 15 },
  profileName: { fontSize: 22, fontWeight: "bold", color: "#fff" },

  statsContainer: { flexDirection: "row", marginTop: 5 },
  statsText: { color: "#eee", marginRight: 10, fontSize: 12 },

  editButton: {
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  editButtonText: { color: "#fff", fontSize: 12 },

  universityBadge: {
    position: "absolute",
    top: 160,
    left: 20,
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    alignItems: "center",
  },
  universityText: { marginLeft: 4, color: "#555" },

  // Tabs
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tabText: { fontSize: 16, color: "#555" },
  tabActive: {
    color: "#FF7E3E",
    fontWeight: "bold",
    borderBottomWidth: 2,
    borderBottomColor: "#FF7E3E",
    paddingBottom: 4,
  },

  itemsContainer: { padding: 20 },
  noItems: { color: "#999", textAlign: "center", marginTop: 20 },

  itemCard: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
  },
  itemImage: { width: 70, height: 70, borderRadius: 8, marginRight: 12 },
  itemName: { fontSize: 16, fontWeight: "600" },
  itemPrice: { color: "#FF7E3E", marginTop: 4 },
});
