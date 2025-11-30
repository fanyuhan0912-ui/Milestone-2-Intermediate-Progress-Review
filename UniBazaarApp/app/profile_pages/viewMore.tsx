import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const mockAllItems = [
  {
    id: '1',
    name: 'Christmas Red Dress',
    price: '$5',
    status: 'Sold',
    date: '11-19',
    image: require('../../assets/images/chair.png'), // Replace with actual image
  },
  {
    id: '2',
    name: 'Klein blue sweater',
    price: '$5',
    status: 'Available',
    date: '11-19',
    image: require('../../assets/images/chair.png'), // Replace with actual image
  },
  {
    id: '3',
    name: 'T-shirt',
    price: '$2',
    status: 'Available',
    date: '11-19',
    image: require('../../assets/images/chair.png'), // Replace with actual image
  },
  {
    id: '4',
    name: 'BLACKPINK long sleeve shirt',
    price: '$10',
    status: 'Available',
    date: '11-18',
    image: require('../../assets/images/chair.png'), // Replace with actual image
  },
];

export default function ViewMoreScreen() {
  const navigation = useNavigation();

  const renderItem = ({ item }: { item: typeof mockAllItems[0] }) => (
    <View style={styles.itemContainer}>
      <Image source={item.image} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemInfo}>{`${item.price} · ${item.status} · Listed: ${item.date}`}</Text>
        <View style={styles.buttonContainer}>
          {item.status === 'Available' ? (
            <>
              <TouchableOpacity style={styles.markAsSoldButton}>
                <Text style={styles.markAsSoldButtonText}>Mark as Sold</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.promoteButton}>
                <Text style={styles.promoteButtonText}>Promote</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.relistButton}>
              <Text style={styles.relistButtonText}>Relist this item</Text>
            </TouchableOpacity>
          )}
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
        <Text style={styles.headerTitle}>All Listings</Text>
        <TouchableOpacity style={styles.headerDots}>
             <Ionicons name="ellipsis-horizontal" size={24} color="black" />
        </TouchableOpacity>
      </View>
       <View style={styles.reviewBanner}>
        <Ionicons name="checkbox-outline" size={24} color="#234594" />
        <View style={styles.reviewBannerTextContainer}>
            <Text style={styles.reviewBannerTitle}>Review older listings</Text>
            <Text style={styles.reviewBannerBody}>You have listings created over 3 months ago that can be purchased by buyers. Update the availability.</Text>
        </View>
         <View style={styles.reviewBannerButtons}>
            <TouchableOpacity style={styles.reviewButton}><Text style={styles.reviewButtonText}>Review</Text></TouchableOpacity>
            <TouchableOpacity style={styles.notNowButton}><Text style={styles.notNowButtonText}>Not now</Text></TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={mockAllItems}
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
  headerDots: {
      padding: 5,
  },
  reviewBanner: {
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 15,
      margin: 10,
      flexDirection: 'row',
  },
  reviewBannerTextContainer: {
      flex: 1,
      marginLeft: 10,
  },
  reviewBannerTitle: {
      fontWeight: 'bold',
      fontSize: 16,
  },
  reviewBannerBody: {
      fontSize: 14,
      color: '#555',
      marginTop: 4,
  },
    reviewBannerButtons: {
      flexDirection: 'column',
      justifyContent: 'space-around',
      marginLeft: 10,
  },
  reviewButton: {
      backgroundColor: '#E3F0FF',
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 15,
      marginBottom: 5,
  },
  reviewButtonText:{
      color: '#234594',
      fontWeight: 'bold',
  },
  notNowButton: {
       backgroundColor: '#F0F0F0',
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 15,
      marginTop: 5,
  },
  notNowButtonText: {
      color: 'black',
      fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 10,
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
    markAsSoldButton: {
    backgroundColor: '#E3F0FF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginRight: 10,
  },
  markAsSoldButtonText: {
    color: '#234594',
    fontWeight: 'bold',
  },
   promoteButton: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  promoteButtonText: {
    color: 'black',
    fontWeight: 'bold',
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