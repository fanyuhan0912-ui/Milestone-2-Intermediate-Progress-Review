import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../FavoritesContext';

// 商品卡片组件 (和 home.tsx 类似)
const ItemCard = ({ item }: { item: any }) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const favorite = isFavorite(item.id);

  return (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
      <TouchableOpacity
        style={styles.heartButton}
        onPress={() => toggleFavorite(item)}
        activeOpacity={0.8}
      >
        <Ionicons
          name={favorite ? "heart" : "heart-outline"}
          size={22}
          color={favorite ? "#FF7E3E" : "#ffffff"}
        />
      </TouchableOpacity>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title || "(Untitled)"}</Text>
        {typeof item.price === "number" && <Text style={styles.price}>${item.price}</Text>}
      </View>
    </View>
  );
};

export default function FavouriteScreen() {
  const navigation = useNavigation();
  const { favorites } = useFavorites(); // 从全局状态获取收藏夹列表

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favourites</Text>
        <View style={{ width: 24 }} />
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Oops, nothing here yet. Go add some from the home page!
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={({ item }) => <ItemCard item={item} />}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
        />
      )}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  listContainer: {
    padding: 10,
  },
  card: {
    width: '48%',
    margin: '1%',
    backgroundColor: 'white',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 6,
  },
  cardImage: {
    width: "100%",
    height: 180,
  },
  heartButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardBody: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1a2340",
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FE8A0D",
  },
});
