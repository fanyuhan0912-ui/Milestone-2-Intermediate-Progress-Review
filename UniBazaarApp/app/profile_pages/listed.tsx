import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { collection, query, where, getDocs, Firestore } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebaseConfig'; 


interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string; 
}

export default function ListedScreen() {
  const [listedItems, setListedItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const user = auth.currentUser;

 
  useEffect(() => {
    const fetchListedItems = async () => {
      if (!user) {
        setError("Please log in to see your listed items.");
        setLoading(false);
        return;
      }

      try {
      
        const q = query(collection(db, "items"), where("sellerId", "==", user.uid));

        const querySnapshot = await getDocs(q);

        const products: Product[] = [];
        querySnapshot.forEach((doc) => {
      
          const data = doc.data();
          products.push({
            id: doc.id,
            name: data.title,
            price: data.price,
            imageUrl: data.imageUrl, 
          });
        });

        setListedItems(products);
      } catch (e) {
        console.error("Error fetching listed items: ", e);
        setError("Failed to load items. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchListedItems();
  }, [user]); 

 
  const handlePromote = (item: Product) => {
   
    Alert.alert(
      "Promote Item",
      `Are you sure you want to promote "${item.name}"? This may involve a fee or use a promotion slot.`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Yes, Promote",
          onPress: () => {
            console.log(`Promoting item: ${item.id}`);
            Alert.alert("Success", `"${item.name}" has been promoted!`);
          }
        }
      ]
    );
  };


  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
      </View>
      <TouchableOpacity
        style={styles.promoteButton}
        onPress={() => handlePromote(item)}
      >
        <Text style={styles.promoteButtonText}>Promote</Text>
      </TouchableOpacity>
    </View>
  );


  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cube-outline" size={60} color="#CCCCCC" />
      <Text style={styles.emptyText}>You haven't listed any items yet.</Text>
      <Text style={styles.emptySubText}>Start selling by adding a new item!</Text>
    </View>
  );

 
  if (loading) {
    return <View style={styles.centerContainer}><Text>Loading...</Text></View>;
  }

  if (error) {
    return <View style={styles.centerContainer}><Text style={styles.errorText}>{error}</Text></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={listedItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={styles.listContentContainer}
      />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContentContainer: {
    flexGrow: 1,
    padding: 16,
  },
  
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 16,
  },
  itemInfo: {
    flex: 1, 
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  itemPrice: {
    fontSize: 15,
    color: '#FF7E3E',
    marginTop: 4,
    fontWeight: 'bold',
  },
  
  promoteButton: {
    backgroundColor: '#FF7E3E',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  promoteButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: '40%',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#555555',
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#AAAAAA',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
  },
});
