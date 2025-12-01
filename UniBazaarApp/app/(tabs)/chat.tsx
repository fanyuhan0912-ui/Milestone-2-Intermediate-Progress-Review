import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db, auth } from "../../firebase/firebaseConfig"; // 路径跟 add.tsx 一样

type Chat = {
  id: string;
  itemTitle: string;
  buyerId: string;
  sellerId: string;
  lastMessage?: string;
};

export default function ChatListScreen() {
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUser = auth.currentUser;
  const userId = currentUser?.uid;

  

  useEffect(() => {
    // 没登录就不查
    if (!userId) {
      setLoading(false);
      return;
    }

    // 查询所有 participants 里包含自己的 chat 文档
    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", userId),
      orderBy("lastMessageAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data: Chat[] = snap.docs.map((d) => ({
        id: d.id,
        itemTitle: d.data().itemTitle || "",
        buyerId: d.data().buyerId,
        sellerId: d.data().sellerId,
        lastMessage: d.data().lastMessage || "",
      }));
      setChats(data);
      setLoading(false);
    });

    // 组件卸载时取消监听
    return () => unsub();
  }, [userId]);

  // 没登陆的情况
  if (!userId) {
    return (
      <View style={styles.center}>
        <Text>Please log in to view your chats.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (chats.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No chats yet.</Text>
      </View>
    );
  }

  return (

    

   
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Messages</Text>
      </View>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isBuyer = item.buyerId === userId; // 用这个判断你是买家还是卖家

          return (
            <TouchableOpacity
              style={[
                styles.chatCard,
                isBuyer ? styles.chatCardBuyer : styles.chatCardSeller,
              ]}
              onPress={() =>
              router.push({
                pathname: "/chat/[id]",
                params: { id: String(item.id) },  // 确保是 string
              })
            }

            >
              <Text style={styles.itemTitle}>{item.itemTitle}</Text>
              <Text style={styles.role}>
                {isBuyer ? "You are the buyer" : "You are the seller"}
              </Text>
              {item.lastMessage ? (
                <Text
                  style={styles.lastMessage}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.lastMessage}
                </Text>
              ) : null}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", paddingTop:60,paddingHorizontal: 12 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingBottom: 20,
    paddingLeft:5,
  },

headerText: {
  fontSize: 22,
  fontWeight: "700",
  color: "#222",
},


  chatCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  // 🔵 你是买家的聊天（蓝色）
  chatCardBuyer: {
    backgroundColor: "#E3F0FF",
  },
  // 🟠 你是卖家的聊天（橙色）
  chatCardSeller: {
    backgroundColor: "#FFE7CF",
  },

  itemTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  role: {
    fontSize: 13,
    color: "#555",
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 13,
    color: "#333",
  },
});
