import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../firebase/firebaseConfig";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  limit,
} from "firebase/firestore";

type Msg = {
  id: string;
  uid: string;
  displayName?: string;
  text: string;
  createdAt?: any; // Firestore Timestamp | number
};

const ROOM_PATH = ["chats", "global", "messages"]; // chats/global/messages

export default function ChatScreen() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const listRef = useRef<FlatList<Msg>>(null);


  useEffect(() => {
    const q = query(
      collection(db, ...ROOM_PATH),
      orderBy("createdAt", "desc"),
      limit(50)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: Msg[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            uid: data.uid,
            displayName: data.displayName,
            text: data.text || "",
            createdAt: data.createdAt,
          };
        });
        setMessages(rows);
        setLoading(false);
      },
      (err) => {
        console.error("chat onSnapshot error:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const user = auth.currentUser;

    if (!user) return;

    try {
      await addDoc(collection(db, ...ROOM_PATH), {
        uid: user.uid,
        displayName: user.displayName || user.email || "Anonymous",
        text: trimmed,
        createdAt: serverTimestamp(),
      });
      setText("");
      // 轻微滚动到最新
      setTimeout(() => listRef.current?.scrollToOffset({ offset: 0, animated: true }), 50);
    } catch (e) {
      console.error("send message failed:", e);
    }
  };

  const renderItem = ({ item }: { item: Msg }) => {
    const mine = item.uid === auth.currentUser?.uid;
    return (
      <View
        style={{
          paddingHorizontal: 12,
          marginVertical: 6,
          width: "100%",
          flexDirection: "row",
          justifyContent: mine ? "flex-end" : "flex-start",
        }}
      >
        <View
          style={{
            maxWidth: "78%",
            backgroundColor: mine ? "#2f6fed" : "#f0f1f5",
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 14,
            borderBottomRightRadius: mine ? 2 : 14,
            borderBottomLeftRadius: mine ? 14 : 2,
          }}
        >
          {!mine && (
            <Text style={{ fontSize: 11, color: "#666", marginBottom: 2 }}>
              {item.displayName || "Student"}
            </Text>
          )}
          <Text style={{ color: mine ? "white" : "#111", fontSize: 15 }}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Loading chat…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderItem}
        inverted
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 8 }}
      />

      {/* 底部输入区 */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 10,
          borderTopWidth: 1,
          borderColor: "#eee",
          backgroundColor: "#fff",
        }}
      >
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Say something…"
          style={{
            flex: 1,
            backgroundColor: "#f5f6fa",
            borderRadius: 20,
            paddingHorizontal: 14,
            paddingVertical: Platform.OS === "ios" ? 12 : 8,
            marginRight: 8,
          }}
          multiline
        />
        <TouchableOpacity
          onPress={send}
          activeOpacity={0.8}
          style={{
            backgroundColor: text.trim() ? "#2f6fed" : "#cbd3ff",
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 20,
          }}
          disabled={!text.trim()}
        >
          <Text style={{ color: "white", fontWeight: "700" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
