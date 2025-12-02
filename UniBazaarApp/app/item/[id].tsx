// app/item/[id].tsx
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
  Dimensions,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import {
  doc,
  getDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from "firebase/firestore";

import { db, auth } from "../../firebase/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { useFavorites } from "../FavoritesContext";

// 和你项目里的 Item 保持兼容
interface Item {
  id: string;
  title?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  sellerId?: string;
  category?: string;
  condition?: string;
  createdAt?: number;
  distanceKm?: number;
}

interface Seller {
  uid: string;
  fullName: string;
  avatarUrl?: string | null;
  avatarKey?: string | null;

}

const { width } = Dimensions.get("window");

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [item, setItem] = useState<Item | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);

  // ⭐ 收藏状态（来自 FavoritesContext）
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const isFav = item ? isFavorite(item.id) : false;

  const AVATAR_MAP: Record<string, any> = {
  avatar1: require("../../assets/images/user1.png"),
  avatar2: require("../../assets/images/user2.png"),
  avatar3: require("../../assets/images/user3.png"),
};
  const sellerAvatarSource =
    seller?.avatarKey && AVATAR_MAP[seller.avatarKey]
      ? AVATAR_MAP[seller.avatarKey]
      : require("../../assets/images/user3.png");



  // 🔹 从 Firestore 获取商品和卖家数据
  useEffect(() => {
    if (!id) return;

    const fetchItemAndSeller = async () => {
      try {
        // A. 商品
        const itemDocRef = doc(db, "items", id as string);
        const itemDocSnap = await getDoc(itemDocRef);

        if (!itemDocSnap.exists()) {
          console.error("Item not found");
          setItem(null);
        } else {
          const data = itemDocSnap.data() as Omit<Item, "id">;
          const fetchedItem: Item = { id: itemDocSnap.id, ...data };
          setItem(fetchedItem);

          // B. 卖家 (presence 集合，文档 id = sellerId)
          if (fetchedItem.sellerId) {
          
          const sellerDocRef = doc(db, "presence", fetchedItem.sellerId);
          const sellerDocSnap = await getDoc(sellerDocRef);

          if (sellerDocSnap.exists()) {
            const sellerData = sellerDocSnap.data() as any;
            setSeller({
              uid: sellerDocSnap.id,
              fullName: sellerData.displayName || "UniBazaar User",
              avatarKey: sellerData.avatarKey || null,   // ⭐ 跟 profile 写入的字段对上
            });
          } else {
            setSeller({
              uid: fetchedItem.sellerId,
              fullName: "UniBazaar User",
              avatarKey: null,
            });
          }


          }
        }
      } catch (err) {
        console.error("Error fetching item details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItemAndSeller();
  }, [id]);

  // 🔹 Chat 按钮
  const handleChatPress = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert("Please log in", "You need to log in to chat with sellers.");
      return;
    }
    if (!item || !item.sellerId) {
      Alert.alert("Item not loaded", "Please wait for the item to load.");
      return;
    }

    const userId = currentUser.uid;

    if (userId === item.sellerId) {
      Alert.alert("Notice", "You cannot chat with yourself.");
      return;
    }

    try {
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
        chatId = snap.docs[0].id;
      } else {
        const newChatRef = await addDoc(chatsRef, {
          buyerId: userId,
          sellerId: item.sellerId,
          itemId: item.id,
          itemTitle: item.title ?? "",
          participants: [userId, item.sellerId], // 方便 chat list 查询
          lastMessage: "",
          lastMessageAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        });
        chatId = newChatRef.id;
      }

      router.push(`/chat/${chatId}`);
    } catch (err) {
      console.error("Error entering chat:", err);
      Alert.alert("Error", "Failed to open chat. Please try again later.");
    }
  };

  // 🔹 点击卖家头像/名字
  const handleSellerPress = () => {
    if (!seller) return;
    Alert.alert("Go to Seller", `Navigate to profile for ${seller.fullName}?`);
    // 以后可以：router.push(`/user/${seller.uid}`)
  };

  // 🔹 loading & not found
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

  // 🔹 页面 UI
  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 顶部大图 + 返回 + 收藏 */}
        <View style={styles.imageWrapper}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
          ) : (
            <View style={[styles.itemImage, styles.imagePlaceholder]}>
              <Text>No Image</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>

      

          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(item)}
          >
            <Ionicons
              name={isFav ? "heart" : "heart-outline"}
              size={24}
              color={isFav ? "#ff4b5c" : "#555"}
            />
          </TouchableOpacity>
        </View>

        {/* 卖家 + 评分 */}
        <View style={styles.sellerRow}>
          <TouchableOpacity style={styles.sellerInfo} onPress={handleSellerPress}>
            
            <Image source={sellerAvatarSource} style={styles.sellerAvatar} />
            <Text style={styles.sellerName}>
              {seller?.fullName || "UniBazaar User"}
            </Text>
          </TouchableOpacity>

          <View style={styles.ratingBox}>
            <Ionicons name="star" size={16} color="#FBBF24" />
            <Text style={styles.ratingText}>4.8</Text>
          </View>
        </View>

        {/* 标题 + 分类 pill */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>{item.title ?? "Untitled item"}</Text>
          {item.category ? (
            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText}>{item.category}</Text>
            </View>
          ) : null}
        </View>

        {/* 描述 */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionLabel}>Description</Text>
          <Text style={styles.description}>
            {item.description || "No description provided."}
          </Text>
        </View>

        {/* 留出底部栏空间 */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* 底部：价格 + Chat 按钮 */}
      <View style={styles.bottomBar}>
        <View style={styles.priceBlock}>
          <Text style={styles.priceLabel}>Price</Text>
          <Text style={styles.priceValue}>
            {item.price != null ? `$${item.price}` : "N/A"}
          </Text>
        </View>

        <TouchableOpacity style={styles.chatButton} onPress={handleChatPress}>
          <Text style={styles.chatButtonText}>Chat with seller</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // 顶部大图区域
  imageWrapper: {
    position: "relative",
    width,
    height: width,
    backgroundColor: "#f5f5f5",
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 16,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  favoriteButton: {
    position: "absolute",
    top: 50,
    right: 16,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },

  // 卖家 + 评分
  sellerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal: 20,
    paddingVertical:20,
  
    
    backgroundColor:"#E3F0FF"
  },
  sellerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  sellerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#f0f0f0",
  },
  sellerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7E6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "600",
    color: "#F59E0B",
  },

  // 标题 + 分类 pill
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 12,
  },
  title: {
    flex: 1,
    fontSize: 25,
    fontWeight: "700",
    marginRight: 12,
    color: "#111827",
  },
  categoryPill: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#F9FAFB",
  },
  categoryPillText: {
    fontSize: 15,
    color: "#4B5563",
    fontWeight: "500",
  },

  // 描述
  descriptionContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#374151",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: "#4B5563",
  },

  // 底部栏
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  priceBlock: {
    marginRight: 16,
  },
  priceLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  priceValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#224594",
  },
  chatButton: {
    flex: 1,
    backgroundColor: "#224594", 
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  chatButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
