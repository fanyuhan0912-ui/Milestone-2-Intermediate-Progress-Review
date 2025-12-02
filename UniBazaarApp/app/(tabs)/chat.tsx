import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { Swipeable } from "react-native-gesture-handler";
import { db, auth } from "../../firebase/firebaseConfig";

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

  // delete msg
  const handleDeleteChat = async (chatId: string) => {
    Alert.alert("Delete chat", "Are you sure you want to delete this chat?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {

            const msgsRef = collection(db, "chats", chatId, "messages");
            const msgsSnap = await getDocs(msgsRef);

            const batch = writeBatch(db);
            msgsSnap.forEach((m) => {
              batch.delete(m.ref);
            });


            const chatRef = doc(db, "chats", chatId);
            batch.delete(chatRef);

            await batch.commit();
          } catch (err) {
            console.error("Delete chat error:", err);
            Alert.alert("Error", "Failed to delete chat, please try again.");
          }
        },
      },
    ]);
  };

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

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

    return () => unsub();
  }, [userId]);

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

 
  const renderRightActions = (chat: Chat) => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => handleDeleteChat(chat.id)}
    >
      <Text style={styles.deleteText}>Delete</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Messages</Text>
      </View>

      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isBuyer = item.buyerId === userId;

          return (
            <Swipeable renderRightActions={() => renderRightActions(item)}>
              <TouchableOpacity
                style={[
                  styles.chatCard,
                  isBuyer ? styles.chatCardBuyer : styles.chatCardSeller,
                ]}
                onPress={() =>
                  router.push({
                    pathname: "/chat/[id]",
                    params: { id: String(item.id) },
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
            </Swipeable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", paddingTop: 60, paddingHorizontal: 12 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingBottom: 20,
    paddingLeft: 5,
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
  chatCardBuyer: {
    backgroundColor: "#E3F0FF",
  },
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
  // right side delete
  deleteButton: {
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    marginBottom: 10,
    borderRadius: 12,
  },
  deleteText: {
    color: "#fff",
    fontWeight: "700",
  },
});
