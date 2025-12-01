import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { collection, query, where, getDocs, Firestore } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebaseConfig'; // 确保你的 Firebase 配置文件路径正确

// 定义商品数据结构
interface Product {
  id: string; // Firestore 文档 ID
  name: string;
  price: number;
  imageUrl: string; // 商品图片 URL
}

export default function ListedScreen() {
  const [listedItems, setListedItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取当前登录用户
  const user = auth.currentUser;

  // 从 Firebase 加载用户已上架的商品
  useEffect(() => {
    const fetchListedItems = async () => {
      // 确保用户已登录
      if (!user) {
        setError("Please log in to see your listed items.");
        setLoading(false);
        return;
      }

      try {
        // 创建一个查询，获取 'products' 集合中 'sellerId' 等于当前用户 UID 的所有商品
        const q = query(collection(db, "items"), where("sellerId", "==", user.uid));

        const querySnapshot = await getDocs(q);

        const products: Product[] = [];
        querySnapshot.forEach((doc) => {
          // doc.data() 包含商品的所有字段
          const data = doc.data();
          products.push({
            id: doc.id,
            name: data.title,
            price: data.price,
            imageUrl: data.imageUrl, // 确保你的 Firestore 文档中有 imageUrl 字段
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
  }, [user]); // 当 user 对象变化时（例如登录/退出后），重新执行

  // “推广”按钮的点击处理函数
  const handlePromote = (item: Product) => {
    // 弹出提示框，让用户确认
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
            // 在这里实现你的推广逻辑
            // 例如：更新 Firestore 中的商品状态，或者调用一个云函数
            console.log(`Promoting item: ${item.id}`);
            Alert.alert("Success", `"${item.name}" has been promoted!`);
          }
        }
      ]
    );
  };

  // 渲染每个列表项的组件
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

  // 列表为空时显示的组件
  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cube-outline" size={60} color="#CCCCCC" />
      <Text style={styles.emptyText}>You haven't listed any items yet.</Text>
      <Text style={styles.emptySubText}>Start selling by adding a new item!</Text>
    </View>
  );

  // 加载状态或错误状态的显示
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

// 样式表
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContentContainer: {
    flexGrow: 1,
    padding: 16,
  },
  // 列表项样式
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
    flex: 1, // 占据剩余空间
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
  // Promote 按钮样式
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
  // 空状态和加载状态的样式
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
    marginTop: '40%', // 视觉上更居中
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
