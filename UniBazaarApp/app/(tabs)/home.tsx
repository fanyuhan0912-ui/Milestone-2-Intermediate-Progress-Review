// app/(tabs)/home.tsx
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, ActivityIndicator, TouchableOpacity } from "react-native";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
// 注意：这个路径要能指向你项目根目录下的 firebase/firebaseConfig.js
// 你的结构是 app/(tabs)/home.tsx → app/ → 项目根 → firebase/
// 所以用 "../../firebase/firebaseConfig"
import { db } from "../../firebase/firebaseConfig";

type Item = {
  id: string;
  title?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  sellerId?: string;
};

export default function HomeScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
useEffect(() => {
  // 订阅 Firestore items 集合，按 createdAt 倒序
  const q = query(collection(db, "items"), orderBy("createdAt", "desc"));

  const unsub = onSnapshot(
    q,
    (snap) => {
      const rows: Item[] = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          title: data?.title,
          description: data?.description,
          price: typeof data?.price === "number" ? data.price : undefined,
          imageUrl: data?.imageUrl,
          sellerId: data?.sellerId,
        };
      });
      setItems(rows);
      setLoading(false);
    },
    (err) => {
      console.error("items onSnapshot error:", err);
      setLoading(false);
    }
  );

  return () => unsub(); // 
}, []);


  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Loading items…</Text>
      </View>
    );
  }

  if (!items.length) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 20 }}>
        <Text style={{ fontSize: 16, opacity: 0.7 }}>No items yet.</Text>
        <Text style={{ marginTop: 8, opacity: 0.6 }}>Go to Post tab to create one.</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity
      style={{
        padding: 12,
        borderBottomWidth: 1,
        borderColor: "#eee",
        flexDirection: "row",
        backgroundColor: "white",
      }}
      activeOpacity={0.7}
    >
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={{ width: 84, height: 84, borderRadius: 8, backgroundColor: "#f2f2f2", marginRight: 12 }}
        />
      ) : (
        <View
          style={{
            width: 84,
            height: 84,
            borderRadius: 8,
            backgroundColor: "#f5f5f5",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Text style={{ fontSize: 12, color: "#888" }}>No Image</Text>
        </View>
      )}

      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: "600", fontSize: 16 }} numberOfLines={1}>
          {item.title || "(Untitled)"} {typeof item.price === "number" ? `· $${item.price}` : ""}
        </Text>
        <Text numberOfLines={2} style={{ marginTop: 4, color: "#444" }}>
          {item.description || "No description."}
        </Text>
        <Text style={{ marginTop: 6, fontSize: 12, color: "#888" }}>
          by {item.sellerId ? item.sellerId.slice(0, 6) : "unknown"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={items}
      keyExtractor={(it) => it.id}
      renderItem={renderItem}
      contentContainerStyle={{ paddingBottom: 24 }}
    />
  );
}
