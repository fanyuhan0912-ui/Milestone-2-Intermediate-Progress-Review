import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { auth, db } from "../../firebase/firebaseConfig";
import { signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";


const AVATAR_OPTIONS = [

  {
    key: "avatar1",
    source: require("../../assets/images/user1.png"),
  },
  {
    key: "avatar2",
    source: require("../../assets/images/user2.png"),
  },
  {
    key: "avatar3",
    source: require("../../assets/images/user3.png"),
  },

];

export default function ProfileScreen() {
  const user = auth.currentUser;

  const [userName, setUserName] = useState<string>(
    user?.displayName || "UniBazaar User"
  );
  const [avatarKey, setAvatarKey] = useState<string>("chair");
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);

  // 当前头像的图片
  const currentAvatarSource =
    AVATAR_OPTIONS.find((a) => a.key === avatarKey)?.source ||
    AVATAR_OPTIONS[0].source;

  // Read user information from Firestore.
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      try {
        // 如果你用的是 "users" 集合，把这里的 "presence" 改成 "users"
        const ref = doc(db, "presence", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as any;
          if (data.displayName) setUserName(data.displayName);
          if (data.avatarKey) setAvatarKey(data.avatarKey);
        } else if (user.displayName) {
          setUserName(user.displayName);
        }
      } catch (e) {
        console.log("load user profile error:", e);
      }
    };

    loadUserProfile();
  }, [user]);

  // 点击头像：打开弹窗
  const handleAvatarPress = () => {
    setAvatarModalVisible(true);
  };

  // 选择某个头像：更新本地 state + Firestore
  const handleSelectAvatar = async (key: string) => {
    setAvatarKey(key);
    setAvatarModalVisible(false);

    if (!user) return;

    try {
      const ref = doc(db, "presence", user.uid); // 或 "users"
      await setDoc(
        ref,
        {
          avatarKey: key,
        },
        { merge: true }
      );
    } catch (e) {
      console.log("save avatar error:", e);
    }
  };

  // 退出登录
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // 跳转到 profile_pages 下面的子页面
  const handleNavigation = (path: string) => {
    // 例如 path = "/profile_pages/userHomepage"
    router.push(path as any);
  };

return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 顶部标题栏 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="settings-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>

      {/* 个人信息卡片 */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handleNavigation("/profile_pages/userHomepage")}
      >
        <View style={styles.profileCard}>
          {/* 头像：可点击打开弹窗 */}
          <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.8}>
            <Image source={currentAvatarSource} style={styles.avatar} />
          </TouchableOpacity>

          {/* 名字 + 星级 */}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userName}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFBA00" />
              <Ionicons name="star" size={16} color="#FFBA00" />
              <Ionicons name="star" size={16} color="#FFBA00" />
              <Ionicons name="star" size={16} color="#FFBA00" />
              <Ionicons name="star-half" size={16} color="#FFBA00" />
            </View>
          </View>

          {/* 右侧箭头 */}
          <TouchableOpacity
            onPress={() => handleNavigation("/profile_pages/userHomepage")}
          >
            <Ionicons
              name="chevron-forward-outline"
              size={24}
              color="#C7C7CC"
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Section: Buying */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Buying</Text>
        <View style={styles.iconGrid}>
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => handleNavigation("/profile_pages/favourite")}
          >
            <Ionicons name="heart-outline" size={22} color="#224594" />
            <Text style={styles.iconLabel}>Favourites</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => handleNavigation("/profile_pages/purchased")}
          >
            <Ionicons name="cart-outline" size={22} color="#224594" />
            <Text style={styles.iconLabel}>Purchased</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Section: Selling */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Selling</Text>
        <View style={styles.iconGrid}>
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => handleNavigation("/profile_pages/listed")}
          >
            <Ionicons name="pricetag-outline" size={22} color="#FE8A0D" />
            <Text style={styles.iconLabel}>Listed</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => handleNavigation("/profile_pages/sold")}
          >
            <Ionicons name="checkmark-done-outline" size={22} color="#FE8A0D" />
            <Text style={styles.iconLabel}>Sold</Text>
          </TouchableOpacity>
        </View>
      </View>

     <View style={styles.section}>
        <Text style={styles.sectionTitleLogout}>Logout</Text>
        <View style={styles.iconGrid}>
            <TouchableOpacity style={styles.iconContainerLogout}
            onPress={() => handleNavigation("../login")}
          >
            <Ionicons name="log-out-outline" size={22} color="#ff0000ff" />
            <Text style={styles.iconLabel}>Logout</Text>
          </TouchableOpacity>
          
        </View>
      </View>




      {/* ===== 头像选择弹窗 ===== */}
      <Modal
        visible={avatarModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAvatarModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose your avatar</Text>

            <View style={styles.avatarGrid}>
              {AVATAR_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.avatarChoice,
                    avatarKey === opt.key && styles.avatarChoiceSelected,
                  ]}
                  onPress={() => handleSelectAvatar(opt.key)}
                >
                  <Image source={opt.source} style={styles.avatarChoiceImage} />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setAvatarModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
            
          </View>
        </View>
      </Modal>
</View>
    </SafeAreaView>
  );
}
// ========= 样式 =========
const styles = StyleSheet.create({
  // 外层 SafeArea，只负责占满 & 背景色
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 12,
    backgroundColor: "#EEE",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
   sectionTitleLogout: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color:"#d81f1fff"
  },
  iconGrid: {
    flexDirection: "row",
  },
  iconContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
    iconContainerLogout: {
    flex: 1,
    backgroundColor: "#ffe3e3ff",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  iconLabel: {
    marginTop: 4,
    fontSize: 13,
    color: "#444",
  },

  // ==== Modal 相关 ====
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  avatarGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  avatarChoice: {
    padding: 4,
    borderRadius: 40,
  },
  avatarChoiceSelected: {
    borderWidth: 2,
    borderColor: "#2f6fed",
  },
  avatarChoiceImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  modalCloseButton: {
    alignSelf: "center",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#EEE",
  },
  modalCloseText: {
    fontSize: 14,
    color: "#333",
  },
});
