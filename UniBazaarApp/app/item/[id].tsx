import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions, // 用于获取屏幕宽度
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from "firebase/firestore";

import { db, auth } from "../../firebase/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";

// 1. 定义更详细的数据类型
interface Item {
  id: string;
  title: string;
  price: number;
  description: string;
  imageUrl: string;
  sellerId: string;
  category?: string;
  condition?: string;
}

interface Seller {
  uid: string;
  fullName: string;
  avatarUrl?: string | null;
}

const { width } = Dimensions.get("window");

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null); // 新增 state 用于存储卖家信息
  const [loading, setLoading] = useState(true);

  // 🔹 从 Firestore 获取商品和卖家数据 (增强版)
  useEffect(() => {
    if (!id) return;

    const fetchItemAndSeller = async () => {
      try {
        // A. 获取商品信息
        const itemDocRef = doc(db, "items", id as string);
        const itemDocSnap = await getDoc(itemDocRef);

        if (!itemDocSnap.exists()) {
          console.error("Item not found!");
          setItem(null); // 明确设为 null
        } else {
          const itemData = itemDocSnap.data() as Omit<Item, "id">;
          const fetchedItem = { id: itemDocSnap.id, ...itemData };
          setItem(fetchedItem);

          // B. 根据商品中的 sellerId 获取卖家信息
// B. 根据商品中的 sellerId 获取卖家信息
          const sellerDocRef = doc(db, "presence", fetchedItem.sellerId);
          const sellerDocSnap = await getDoc(sellerDocRef);

          if (sellerDocSnap.exists()) {
            const sellerData = sellerDocSnap.data();
            setSeller({
              uid: sellerDocSnap.id,
              fullName: sellerData.displayName || "UniBazaar User",
              avatarUrl: sellerData.avatarUrl || null,
            });
          } else {
            setSeller({ uid: fetchedItem.sellerId, fullName: "UniBazaar User" });
          }

        }
      } catch (error) {
        console.error("Error fetching item details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItemAndSeller();
  }, [id]);

  // 🔹 点击「Chat with seller」的逻辑 (保留你的已有逻辑)
  // 🔹 点击「Chat with seller」的逻辑
  const handleChatPress = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Please log in", "You need to log in to chat with sellers.");
      return;
    }
    if (!item) {
      Alert.alert("Item not loaded", "Please wait for the item to load.");
      return;
    }

    const userId = currentUser.uid;

    // 不允许给自己发消息
    if (userId === item.sellerId) {
      Alert.alert("Notice", "You cannot chat with yourself.");
      return;
    }

    try {
      // 1️⃣ 先看看这个 buyer + seller + item 的 chat 是否已经存在
      const chatsRef = collection(db, "chats");
      const q = query(
        chatsRef,
        where("buyerId", "==", userId),
        where("sellerId", "==", item.sellerId),
        where("itemId", "==", item.id)
      );

      const snap = await getDocs(q);

      let chatId: string;

      if (!snap.empty) {
        // 已经有聊天，直接用第一个
        chatId = snap.docs[0].id;
      } else {
        // 2️⃣ 没有，就新建一个 chat 文档
        const newChatRef = await addDoc(chatsRef, {
          buyerId: userId,
          sellerId: item.sellerId,
          itemId: item.id,
          itemTitle: item.title,
          lastMessage: "",
          lastMessageAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        });

        chatId = newChatRef.id;
      }

      // 3️⃣ 跳转到 chat 详情页面
      router.push(`/chat/${chatId}`);
      // 如果你的文件路径是 /app/(tabs)/chat/[id].tsx
      // 那就改成：router.push(`/(tabs)/chat/${chatId}`);
    } catch (err) {
      console.error("Error entering chat:", err);
      Alert.alert("Error", "Failed to open chat. Please try again later.");
    }
  };

  // 🔹 点击卖家头像或名字 (新功能)
  const handleSellerPress = () => {
    if (!seller) return;
    Alert.alert("Go to Seller's Page", `Navigate to profile for ${seller.fullName}?`);
    // 未来实现: router.push(`/user/${seller.uid}`);
  };


  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2f6fed" />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.center}>
        <Text>Item not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
            <Text style={{ color: "#2f6fed" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 3. 全新的 JSX 布局
  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 返回按钮 */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        {/* 卖家信息 */}
        <TouchableOpacity style={styles.sellerContainer} onPress={handleSellerPress}>
          <Image
            source={
              seller?.avatarUrl
                ? { uri: seller.avatarUrl }
                : require("../../assets/images/chair.png") // 准备一张默认头像
            }
            style={styles.sellerAvatar}
          />
          <View>
            <Text style={styles.sellerName}>{seller?.fullName || "Loading..."}</Text>
          </View>
        </TouchableOpacity>

        {/* 价格和标题 */}
        <View style={styles.mainInfoContainer}>
          <Text style={styles.price}>${item.price}</Text>
          <Text style={styles.title}>{item.title}</Text>
        </View>

        {/* 描述和分类等 */}
        <View style={styles.descriptionContainer}>
            <Text style={styles.sectionLabel}>Description</Text>
            <Text style={styles.description}>{item.description || "No description provided."}</Text>

            <Text style={styles.sectionLabel}>Category</Text>
            <Text style={styles.category}>{item.category || "N/A"}</Text>

            <Text style={styles.sectionLabel}>Condition</Text>
            <Text style={styles.condition}>{item.condition || "N/A"}</Text>
        </View>

        {/* 商品大图 */}
        <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />

        {/* 留出底部操作栏的空间 */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 底部操作栏 */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="heart-outline" size={24} color="#555" />
          <Text style={styles.iconText}>Favorite</Text>
        </TouchableOpacity>

        {/* 保留你的聊天按钮 */}
        <TouchableOpacity style={styles.chatButton} onPress={handleChatPress}>
          <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
          <Text style={styles.chatButtonText}>Chat with seller</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

// 4. 全新的样式表 (保留你的App色调)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  backButton: {
    position: "absolute",
    top: 10,
    left: 15,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.7)",
    padding: 8,
    borderRadius: 20,
  },

  sellerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginTop: 60, // 为返回按钮留出空间
    marginBottom: 20,
  },
  sellerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  sellerName: {
    fontSize: 16,
    fontWeight: "600",
  },

  mainInfoContainer: {
    paddingHorizontal: 20,
  },
  price: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FE8A0D", // 你的App橙色
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 8,
    lineHeight: 30,
  },

  descriptionContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    color: "#224594", // 你的App蓝色
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: "#444",
    marginTop: 4,
  },
  category: { fontSize: 15, color: "#444", marginTop: 4 },
  condition: { fontSize: 15, color: "#444", marginTop: 4 },

  itemImage: {
    width: width,
    height: width,
    marginTop: 20,
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    paddingBottom: 25, // 适配iPhone底部安全区域
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  iconButton: {
    alignItems: "center",
  },
  iconText: {
    fontSize: 11,
    color: "#555",
    marginTop: 2,
  },
  chatButton: {
    flex: 1,
    backgroundColor: "#2f6fed", // 你的App蓝色
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 20,
  },
  chatButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
