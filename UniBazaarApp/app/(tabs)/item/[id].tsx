import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";   // ⭐⭐ 你现在缺这个 ⭐⭐

import { Ionicons } from "@expo/vector-icons";

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams();   // 获取 item ID
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    <ScrollView style={styles.container}>
      
      {/* 返回按钮 */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={26} color="#333" />
      </TouchableOpacity>

      {/* 图片 */}
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.body}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.price}>${item.price}</Text>

        <Text style={styles.sectionLabel}>Description</Text>
        <Text style={styles.description}>
          {item.description || "No description provided."}
        </Text>

        <Text style={styles.sectionLabel}>Seller</Text>
        <Text style={styles.seller}>User: {item.sellerId}</Text>

        <Text style={styles.sectionLabel}>Category</Text>
        <Text style={styles.category}>
          {item.category ? item.category.toUpperCase() : "N/A"}
        </Text>
      </View>
    </ScrollView>
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
});
