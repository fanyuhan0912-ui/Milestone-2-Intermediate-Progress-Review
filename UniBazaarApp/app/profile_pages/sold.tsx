import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const mockSoldItems = [
  {
    id: '1',
    name: 'Christmas Red Dress',
    price: '$5',
    status: 'Sold',
    date: '11-19',
    image: require('../../assets/images/chair.png'), // Replace with actual image
  },
];

export default function SoldScreen() {
  const navigation = useNavigation();

  const renderItem = ({ item }: { item: typeof mockSoldItems[0] }) => (
    <View style={styles.itemContainer}>
      <Image source={item.image} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemInfo}>{`${item.price} · ${item.status} · Listed: ${item.date}`}</Text>
        <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.relistButton}>
                <Text style={styles.relistButtonText}>Relist this item</Text>
            </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={styles.moreOptions}>
        <Ionicons name="ellipsis-horizontal" size={24} color="#666" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sold</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={mockSoldItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
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
  listContainer: {
    padding: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemInfo: {
    fontSize: 14,
    color: '#666',
    marginVertical: 5,
  },
  buttonContainer: {
      flexDirection: 'row',
      marginTop: 8,
  },
  relistButton: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  relistButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
  moreOptions: {
    padding: 5,
  },
});