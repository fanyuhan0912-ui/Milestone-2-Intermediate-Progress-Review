import React, { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
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
import { router, useLocalSearchParams } from "expo-router";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
  deleteDoc,         
} from "firebase/firestore";
import { db, auth } from "../../firebase/firebaseConfig";

interface UserProfile {
  fullName: string;
  university: string;
  avatarUrl?: string | null;
  backgroundUrl?: string | null;
}

export default function UserHomepageScreen() {
  const user = auth.currentUser;
  const params = useLocalSearchParams();
  const profileUid = params.uid as string | undefined;

  
  const viewingUid = profileUid ?? user?.uid ?? null;

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [avatarKey, setAvatarKey] = useState<string>("avatar1");
  const [listedItems, setListedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const AVATAR_MAP: Record<string, any> = {
    avatar1: require("../../assets/images/user1.png"),
    avatar2: require("../../assets/images/user2.png"),
    avatar3: require("../../assets/images/user3.png"),
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) return result.assets[0].uri;
    return null;
  };

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

 
  useEffect(() => {
    const fetchUserData = async () => {
      if (!viewingUid) return;

      const userDocRef = doc(db, "users", viewingUid);
      const userSnap = await getDoc(userDocRef);

      let finalName = "User";
      let university = "Simon Fraser University";
      let avatarUrl: string | null = null;
      let backgroundUrl: string | null = null;

      if (userSnap.exists()) {
        const data = userSnap.data();
        finalName = (data.fullName as string) || finalName;
        university = (data.university as string) || university;
        avatarUrl = (data.avatarUrl as string) || null;
        backgroundUrl = (data.backgroundUrl as string) || null;
      }

      const presenceRef = doc(db, "presence", viewingUid);
      const presenceSnap = await getDoc(presenceRef);

      if (presenceSnap.exists()) {
        const pData = presenceSnap.data() as any;
        if (pData.displayName) finalName = pData.displayName;
        if (pData.avatarKey) setAvatarKey(pData.avatarKey);
      }

      setUserProfile({
        fullName: finalName,
        university,
        avatarUrl,
        backgroundUrl,
      });
      setLoading(false);
    };

    fetchUserData();
  }, [viewingUid]);

 
  useEffect(() => {
    const fetchListedItems = async () => {
      if (!viewingUid) return;

      const q = query(
        collection(db, "items"),
        where("sellerId", "==", viewingUid)
      );
      const snap = await getDocs(q);

      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setListedItems(items);
    };

    fetchListedItems();
  }, [viewingUid]);

  const openDetail = (id: string) => {
    router.push(`/item/${id}`);
  };

 
  const handleMarkAsSold = async (item: any) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      await updateDoc(doc(db, "items", item.id), {
        status: "sold",
        soldAt: serverTimestamp(),
        soldBy: currentUser.uid,
      });

      await addDoc(collection(db, "users", currentUser.uid, "sold"), {
        itemId: item.id,
        completedAt: serverTimestamp(),
      });

      setListedItems((prev) =>
        prev.map((it) =>
          it.id === item.id ? { ...it, status: "sold" } : it
        )
      );
    } catch (e) {
      console.log("mark as sold error:", e);
    }
  };


  const handleUnmarkSold = async (item: any) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
  
      await updateDoc(doc(db, "items", item.id), {
        status: "active",
        soldAt: null,
        soldBy: null,
      });

      const soldRef = collection(db, "users", currentUser.uid, "sold");
      const snap = await getDocs(soldRef);
      for (const docSnap of snap.docs) {
        if (docSnap.data().itemId === item.id) {
          await deleteDoc(
            doc(db, "users", currentUser.uid, "sold", docSnap.id)
          );
        }
      }

   
      setListedItems((prev) =>
        prev.map((it) =>
          it.id === item.id ? { ...it, status: "active" } : it
        )
      );
    } catch (e) {
      console.log("undo sold error:", e);
    }
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

  const avatarSource =
    avatarKey && AVATAR_MAP[avatarKey]
      ? AVATAR_MAP[avatarKey]
      : require("../../assets/images/user1.png");

  const isOwnProfile = viewingUid === user?.uid;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
  
    
        <View style={styles.profileHeader}>
          <TouchableOpacity
            disabled={!isOwnProfile}
            onPress={async () => {
              if (!isOwnProfile || !user) return;
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
              setUserProfile((prev) => ({
                ...prev!,
                backgroundUrl: downloadURL,
              }));
            }}
          >
            <Image
              source={
                userProfile.backgroundUrl
                  ? { uri: userProfile.backgroundUrl }
                  : avatarSource
              }
              style={styles.backgroundImage}
              blurRadius={userProfile.backgroundUrl ? 0 : 10}
            />
          </TouchableOpacity>

          <View style={styles.profileInfoContainer}>
            <Image source={avatarSource} style={styles.avatar} />
            <View style={styles.profileTextContainer}>
              <Text style={styles.profileName}>{userProfile.fullName}</Text>
            </View>
          </View>

          <View style={styles.universityBadge}>
            <Ionicons name="location-outline" size={12} color="#888" />
            <Text style={styles.universityText}>{userProfile.university}</Text>
          </View>
        </View>

    
        <View style={styles.itemsContainer}>
          {listedItems.length === 0 ? (
            <Text style={styles.noItems}>No items listed yet.</Text>
          ) : (
            listedItems.map((item) => {
              const isSold = item.status === "sold";
              return (
                <View key={item.id} style={styles.itemCard}>
                  <TouchableOpacity
                    style={{ flexDirection: "row", flex: 1 }}
                    onPress={() => openDetail(item.id)}
                  >
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.itemImage}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{item.title}</Text>
                      <Text style={styles.itemPrice}>${item.price}</Text>

                      {isSold && (
                        <Text style={styles.soldTag}>Sold</Text>
                      )}
                    </View>
                  </TouchableOpacity>

             
                  {isOwnProfile && (
                    <>
                      {!isSold ? (
                   
                        <TouchableOpacity
                          style={styles.soldButton}
                          onPress={() => handleMarkAsSold(item)}
                        >
                          <Text style={styles.soldButtonText}>Sold</Text>
                        </TouchableOpacity>
                      ) : (
                   
                        <TouchableOpacity
                          style={styles.undoButton}
                          onPress={() => handleUnmarkSold(item)}
                        >
                          <Text style={styles.undoButtonText}>Undo</Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
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

  profileTextContainer: { flex: 1, marginLeft: 15, marginBottom: 30 },
  profileName: { fontSize: 22, fontWeight: "bold", color: "#fff" },

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

  itemsContainer: { padding: 20 },
  noItems: { color: "#999", textAlign: "center", marginTop: 20 },

  itemCard: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    alignItems: "center",
  },
  itemImage: { width: 70, height: 70, borderRadius: 8, marginRight: 12 },
  itemName: { fontSize: 16, fontWeight: "600" },
  itemPrice: { color: "#FF7E3E", marginTop: 4 },

  soldTag: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
    color: "#888",
  },

  soldButton: {
    backgroundColor: "#FF7E3E",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "center",
    marginLeft: 8,
  },
  soldButtonText: {
    color: "#fff",
    fontWeight: "600",
  },

 
  undoButton: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "center",
    marginLeft: 8,
  },
  undoButtonText: {
    color: "#111827",
    fontWeight: "600",
  },
});
