import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { db, auth } from "../../firebase/firebaseConfig";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

export default function PurchasedScreen() {
  const navigation = useNavigation();
  const [purchasedItems, setPurchasedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUser = auth.currentUser;

  // ⭐ 加载 purchased 列表 + 再根据 itemId 加载真实 item 信息
  useEffect(() => {
    if (!currentUser) return;

    const loadPurchasedItems = async () => {
      try {
        const purchasedRef = collection(
          db,
          "users",
          currentUser.uid,
          "purchased"
        );
        const purchasedSnap = await getDocs(purchasedRef);

        const purchasedList: any[] = [];

        // 每个 purchased item 都有 itemId → 需要从 items/{itemId} 获取真实信息
        for (const docSnap of purchasedSnap.docs) {
          const { itemId, completedAt } = docSnap.data();

          // 去 items collection 取真实 item 数据
          const itemRef = doc(db, "items", itemId);
          const itemDataSnap = await getDoc(itemRef);

          if (itemDataSnap.exists()) {
            purchasedList.push({
              id: docSnap.id,
              itemId,
              completedAt,
              ...itemDataSnap.data(), // 包含 title、price、imageUrl...
            });
          }
        }

        console.log("🔥 Purchased loaded:", purchasedList);
        setPurchasedItems(purchasedList);
      } catch (e) {
        console.log("❌ Error loading purchased:", e);
      } finally {
        setLoading(false);
      }
    };

    loadPurchasedItems();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() =>
        navigation.navigate("itemDetail", { id: item.itemId }) // 未来你有 itemDetail 再开
      }
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.itemImage}
        resizeMode="cover"
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.title}</Text>

        <Text style={styles.itemPrice}>${item.price ?? "—"}</Text>

        <Text style={styles.date}>
          Purchased on:{" "}
          {item.completedAt?.toDate?.().toLocaleDateString?.() ?? "Unknown"}
        </Text>

        <TouchableOpacity style={styles.reviewButton}>
          <Text style={styles.reviewButtonText}>Write a Review</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Purchased</Text>

        <View style={{ width: 24 }} />
      </View>

      {/* Loading & Empty */}
      {loading ? (
        <Text style={{ padding: 20 }}>Loading...</Text>
      ) : purchasedItems.length === 0 ? (
        <Text style={{ padding: 20 }}>No purchased items yet.</Text>
      ) : (
        <FlatList
          data={purchasedItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 15,
    paddingTop: 60,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  listContainer: { padding: 10 },

  itemContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    alignItems: "center",
  },

  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
    backgroundColor: "#eee",
  },

  itemDetails: {
    flex: 1,
    marginLeft: 15,
  },

  itemName: {
    fontSize: 16,
    fontWeight: "bold",
  },

  itemPrice: {
    fontSize: 15,
    color: "#FE8A0D",
    marginVertical: 4,
  },

  date: {
    fontSize: 13,
    color: "#777",
    marginBottom: 8,
  },

  reviewButton: {
    marginTop: 5,
    alignSelf: "flex-start",
    backgroundColor: "#224594",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  reviewButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
