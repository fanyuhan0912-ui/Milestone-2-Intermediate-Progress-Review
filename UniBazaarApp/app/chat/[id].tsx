import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db, auth } from "../../firebase/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";


type Message = {
  id: string;
  text: string;
  senderId: string;
  createdAt?: any;
};

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams(); // chatId
  const chatId = String(id);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatTitle, setChatTitle] = useState<string>("Chat");
  const [chatInfo, setChatInfo] = useState<any>(null);

  const flatListRef = useRef<FlatList>(null);

  const currentUser = auth.currentUser;
  const userId = currentUser?.uid;

  // 🔹 读 chat 文档（拿 itemTitle，当成顶部标题）
  useEffect(() => {
    const loadChatInfo = async () => {
      const chatRef = doc(db, "chats", chatId);
      const snap = await getDoc(chatRef);
      if (snap.exists()) {
        setChatInfo(snap.data());
        if (snap.data().itemTitle) {
            setChatTitle(snap.data().itemTitle);
            }
      }
    };
    loadChatInfo();
  }, [chatId]);

  // 🔹 监听 messages 子集合，实时更新消息列表
  useEffect(() => {
    const msgsCol = collection(db, "chats", chatId, "messages");
    const q = query(msgsCol, orderBy("createdAt", "asc"));

    const unsub = onSnapshot(q, (snap) => {
      const list: Message[] = snap.docs.map((d) => ({
        id: d.id,
        text: d.data().text,
        senderId: d.data().senderId,
        createdAt: d.data().createdAt,
      }));
      setMessages(list);
      setLoading(false);

      // 自动滚动到底部
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return () => unsub();
  }, [chatId]);

    // ⭐⭐⭐ Step 3：完成交易函数（买家→purchased，卖家→sold）
    const handleCompleteTransaction = async () => {
      if (!chatInfo || !chatInfo.itemId || !chatInfo.sellerId || !chatInfo.buyerId) {
        alert("交易信息缺失");
        return;
      }

      const itemId = chatInfo.itemId;
      const sellerId = chatInfo.sellerId;
      const buyerId = chatInfo.buyerId;

      try {
        if (userId === buyerId) {
          // ⭐ 我是买家 → 添加到 purchased
          await setDoc(
            doc(db, "users", buyerId, "purchased", itemId),
            { itemId, completedAt: new Date() }
          );
          alert("已添加到 Purchased！");
        } else if (userId === sellerId) {
          // ⭐ 我是卖家 → 添加到 sold
          await setDoc(
            doc(db, "users", sellerId, "sold", itemId),
            { itemId, completedAt: new Date()}
          );
          alert("已添加到 Sold！");
        } else {
          alert("你不是买家也不是卖家，不能完成交易");
        }
      } catch (e) {
        console.log(e);
        alert("交易失败，请稍后重试");
      }
    };


  // 🔹 发送消息
  const handleSend = async () => {
    if (!userId) {
      alert("Please log in to send messages.");
      return;
    }
    if (!input.trim()) return;

    const text = input.trim();
    setInput("");

    const msgsCol = collection(db, "chats", chatId, "messages");

    // 1) 往 messages 子集合里加一条
    await addDoc(msgsCol, {
      text,
      senderId: userId,
      createdAt: serverTimestamp(),
    });

    // 2) 更新 chats 里的 lastMessage / lastMessageAt
    const chatRef = doc(db, "chats", chatId);
    await updateDoc(chatRef, {
      lastMessage: text,
      lastMessageAt: serverTimestamp(),
    });
  };

  if (!userId) {
    return (
      <View style={styles.center}>
        <Text>Please log in to use chat.</Text>
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

  const renderItem = ({ item }: { item: Message }) => {
    const isMe = item.senderId === userId;
    return (
      <View
        style={[
          styles.messageRow,
          isMe ? styles.messageRowMe : styles.messageRowOther,
        ]}
      >
        <View
          style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}
        >
          <Text style={isMe ? styles.textMe : styles.textOther}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      {/* 顶部简单 header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {chatTitle}
        </Text>
      </View>

      {chatInfo && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              router.push({
                pathname: "/profile_pages/userHomepage",
                params: { uid: chatInfo.sellerId },
              });
            }}
          >
            <Text style={styles.actionText}>Check Info</Text>
          </TouchableOpacity>

          <TouchableOpacitydle
            style={styles.actionBtn}
            onPress={() => handleCompleteTransaction()}
          >
            <Text style={styles.actionText}>Transact Complete
            </Text>
          </TouchableOpacity>
        </View>
      )}


      {/* 消息列表 */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.messagesContainer}
      />

      {/* 底部输入框 */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backBtn: {
    marginRight: 8,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },

  actionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
  },

  actionBtn: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingVertical: 10,
    marginHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },

  actionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },


  messagesContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  messageRow: {
    flexDirection: "row",
    marginVertical: 4,
  },
  messageRowMe: {
    justifyContent: "flex-end",
  },
  messageRowOther: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "75%",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 16,
  },
  bubbleMe: {
    backgroundColor: "#224594",
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: "#FE8A0D",
    borderBottomLeftRadius: 4,
  },
  textMe: {
    color: "#ffffff",
    fontSize: 18,
  },
  textOther: {
    color: "#111827",
    fontSize: 18,
  },

  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 25,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 12,
    backgroundColor: "#f9fafb",
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: "#224594",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

});

