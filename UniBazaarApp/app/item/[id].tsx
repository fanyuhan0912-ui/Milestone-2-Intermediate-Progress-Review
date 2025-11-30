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
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../firebase/firebaseConfig";

import { Ionicons } from "@expo/vector-icons";

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 点击「Chat with seller」的逻辑
  const handleChatPress = async () => {
    if (!auth.currentUser) {
      Alert.alert("Login required", "Please log in to chat with the seller.");
      return;
    }

    const currentUserId = auth.currentUser.uid;
    const sellerId = item.sellerId;

    if (!sellerId) {
      Alert.alert("Error", "Seller not found.");
      return;
    }

    if (currentUserId === sellerId) {
      Alert.alert("Notice", "You can't chat with yourself.");
      return;
    }

    // 生成一个稳定的 chatId： itemId + 两个用户 id（排序后）
    const pair = [currentUserId, sellerId].sort();
    const chatId = `${item.id}_${pair[0]}_${pair[1]}`;

    const chatRef = doc(db, "chats", chatId);
    const snap = await getDoc(chatRef);

    if (!snap.exists()) {
      // 第一次创建这个会话
      await setDoc(chatRef, {
        itemId: item.id,
        itemTitle: item.title,
        buyerId: currentUserId, // 当前在看商品的人
        sellerId: sellerId,
        participants: [currentUserId, sellerId],
        lastMessage: "",
        lastMessageAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
    }

    // 之后我们会创建 /chat/[id].tsx 聊天页面
    router.push({
      pathname: "/chat/[id]",
      params: { id: chatId },
    });
  };

  // 🔹 从 Firestore 取商品数据
  useEffect(() => {
    if (!id) return;

    const fetch = async () => {
      const ref = doc(db, "items", id as string);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setItem({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    };

    fetch();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.center}>
        <Text>Item not found.</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        {/* 返回按钮 */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={26} color="#333" />
        </TouchableOpacity>

        {/* 商品图片 */}
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.body}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.price}>${item.price}</Text>

          <Text style={styles.sectionLabel}>Seller</Text>
          <Text style={styles.seller}>User: {item.sellerId}</Text>

          <Text style={styles.sectionLabel}>Category</Text>
          <Text style={styles.category}>
            {item.category ? item.category.toUpperCase() : "N/A"}
          </Text>

          <Text style={styles.sectionLabel}>Condition</Text>
          <Text style={styles.condition}>
            {item.condition || "No condition provided."}
          </Text>

          <Text style={styles.sectionLabel}>Description</Text>
          <Text style={styles.description}>
            {item.description || "No description provided."}
          </Text>
        </View>
      </ScrollView>

      {/* 底部 Chat 按钮 */}
      <View style={styles.chatButtonContainer}>
        <TouchableOpacity style={styles.chatButton} onPress={handleChatPress}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={20}
            color="#fff"
          />
          <Text style={styles.chatButtonText}>Chat with seller</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  backButton: {
    position: "absolute",
    top: 50,
    left: 18,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.7)",
    padding: 6,
    borderRadius: 10,
  },

  image: {
    width: "100%",
    height: 300,
    backgroundColor: "#f3f3f3",
  },

  body: {
    padding: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },

  price: {
    fontSize: 22,
    fontWeight: "600",
    color: "#FE8A0D",
    marginBottom: 20,
  },

  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 4,
    color: "#224594",
  },

  description: {
    fontSize: 14,
    lineHeight: 20,
    color: "#444",
  },

  seller: {
    fontSize: 14,
    color: "#444",
  },

  category: {
    fontSize: 14,
    color: "#444",
  },

  condition: {
    fontSize: 14,
    color: "#444",
  },

  chatButtonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  chatButton: {
    backgroundColor: "#2f6fed", // 蓝色
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  chatButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
