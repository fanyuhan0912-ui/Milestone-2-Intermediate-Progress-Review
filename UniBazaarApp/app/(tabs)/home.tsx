import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, ActivityIndicator, TouchableOpacity } from "react-native";
import { db } from "../../firebase/firebaseConfig"; 
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

type Item = {
  id: string;
  title?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  sellerId?: string;
  createdAt?: number;
};

export default function HomeScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "items"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: Item[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        setItems(rows);
        setLoading(false);
      },
      (err) => {
        console.error("onSnapshot items error:", err);
        setLoading(false);
      }
    );

    return () => unsub();
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
        <Text style={{ fontSize: 16, fontWeight: "600" }}>No items yet.</Text>
        <Text style={{ marginTop: 6, opacity: 0.6 }}>Go to Post tab to create one.</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity
      activeOpacity={0.75}
      style={{
        padding: 12,
        borderBottomWidth: 1,
        borderColor: "#eee",
        flexDirection: "row",
        backgroundColor: "white",
      }}
    >
      {/* the left side image*/}
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

      {/* right side text*/}
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: "600", fontSize: 16 }} numberOfLines={1}>
          {item.title || "(Untitled)"}{" "}
          {typeof item.price === "number" ? `· $${item.price}` : ""}
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
