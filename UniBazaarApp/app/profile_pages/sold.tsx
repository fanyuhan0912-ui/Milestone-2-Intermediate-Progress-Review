// app/profile_pages/sold.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { auth, db } from "../../firebase/firebaseConfig";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

export default function SoldScreen() {
  const navigation = useNavigation();
  const user = auth.currentUser;

  const [soldList, setSoldList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const loadSold = async () => {
      if (!user) return;

      try {
        const soldRef = collection(db, "users", user.uid, "sold");
        const soldSnap = await getDocs(soldRef);

        const list: any[] = [];

        for (const snap of soldSnap.docs) {
          const { itemId, completedAt } = snap.data();

        
          const itemRef = doc(db, "items", itemId);
          const itemSnap = await getDoc(itemRef);

          if (itemSnap.exists()) {
            list.push({
              id: itemId,
              completedAt,
              ...itemSnap.data(),
            });
          }
        }

        setSoldList(list);
      } catch (e) {
        console.log("Error loading sold:", e);
      }

      setLoading(false);
    };

    loadSold();
  }, []);

  const renderItem = ({ item }: any) => (
    <View style={styles.itemContainer}>
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.itemImage}
      />

      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.title}</Text>

        <Text style={styles.itemInfo}>
          Sold for ${item.price}
        </Text>

        <Text style={styles.dateText}>
          Sold on {item.completedAt?.toDate?.().toLocaleDateString() ?? "N/A"}
        </Text>
      </View>
    </View>
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

        <Text style={styles.headerTitle}>Sold</Text>

        <View style={{ width: 24 }} />
      </View>

      {/* List */}
      <FlatList
        data={soldList}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

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

  backButton: {
    padding: 5,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },

  listContainer: {
    padding: 10,
  },

  itemContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: "center",
  },

  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },

  itemDetails: {
    flex: 1,
    marginLeft: 15,
  },

  itemName: {
    fontSize: 16,
    fontWeight: "bold",
  },

  itemInfo: {
    fontSize: 14,
    color: "#666",
    marginVertical: 5,
  },

  dateText: {
    fontSize: 14,
    color: "#999",
  },
});
