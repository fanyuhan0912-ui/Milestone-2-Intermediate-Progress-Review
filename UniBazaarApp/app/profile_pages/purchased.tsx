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
import { router } from "expo-router";

export default function PurchasedScreen() {
  const navigation = useNavigation();
  const [purchasedItems, setPurchasedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUser = auth.currentUser;

  
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

        for (const docSnap of purchasedSnap.docs) {
          const { itemId, completedAt } = docSnap.data();

        
          const itemRef = doc(db, "items", itemId);
          const itemDataSnap = await getDoc(itemRef);

          if (itemDataSnap.exists()) {
            purchasedList.push({
              id: docSnap.id,
              itemId,
              completedAt,
              ...itemDataSnap.data(), 
            });
          }
        }

        console.log("Purchased loaded:", purchasedList);
        setPurchasedItems(purchasedList);
      } catch (e) {
        console.log("Error loading purchased:", e);
      } finally {
        setLoading(false);
      }
    };

    loadPurchasedItems();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => {
    router.push(`/item/${item.itemId}`);
  }}
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

        <TouchableOpacity style={styles.reviewButton}
        onPress={() => {
    router.push(`/item/${item.itemId}`);
  }}
        
        >
          <Text style={styles.reviewButtonText}>View Item's Detail</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      
    

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
