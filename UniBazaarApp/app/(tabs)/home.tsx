import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../../firebase/firebaseConfig";
import { collection, query, onSnapshot } from "firebase/firestore";
import WeatherBanner from "../../components/WeatherBanner";
import { useFavorites } from "../FavoritesContext"; // 修正了路径

// 本地分类图片（记得把这些图片放到对应路径）
const CATEGORIES = [
  {
    key: "all",
    label: "All",
    image: require("../../assets/images/categories/all.png"),
  },
  {
    key: "furniture",
    label: "Furniture",
    image: require("../../assets/images/categories/furniture.png"),
  },
  {
    key: "books",
    label: "Books",
    image: require("../../assets/images/categories/books.png"),
  },
  {
    key: "clothing",
    label: "Clothing",
    image: require("../../assets/images/categories/clothing.png"),
  },
  {
    key: "electronics",
    label: "Electronics",
    image: require("../../assets/images/categories/electronics.png"),
  },
];



type Item = {
  id: string;
  title?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  sellerId?: string;
  createdAt?: number;
  distanceKm?: number;
  category?: string; // Firestore 里的分类字段
};

export default function HomeScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const { toggleFavorite, isFavorite } = useFavorites(); // 使用全局收藏夹
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // ========= 连接 Firestore =========
  useEffect(() => {
    const q = query(collection(db, "items"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: Item[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
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

  // ========= Loading =========
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Loading items…</Text>
      </View>
    );
  }

  // ========= 完全没有 item 时 =========
  if (!items.length) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 16, fontWeight: "600" }}>
          No items yet.
        </Text>
        <Text style={{ marginTop: 6, opacity: 0.6 }}>
          Go to Add/Post tab to create one.
        </Text>
      </View>
    );
  }

  // 当前选中的分类名称（用来替换 All Items 文本）
  const currentCategoryLabel =
    CATEGORIES.find((c) => c.key === selectedCategory)?.label ||
    "All Items";

  // 过滤出来要展示的 items
  const displayedItems =
    selectedCategory === "all"
      ? items
      : items.filter(
          (item) =>
            (item.category || "").toLowerCase() ===
            selectedCategory.toLowerCase()
        );

  // ========= 渲染单个卡片 =========
  const renderItem = ({ item }: { item: Item }) => {
    const favorite = isFavorite(item.id);
    const distance = item.distanceKm ?? 0.5; // 临时假数据

    return (
      <View style={styles.shadowWrapper}>
        <View style={styles.card}>
          {/* 图片区域 */}
          <View style={styles.imageWrapper}>
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.cardImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.cardImage, styles.noImageBox]}>
                <Text style={styles.noImageText}>No Image</Text>
              </View>
            )}

            {/* 右上角心形按钮（收藏占位） */}
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
          </View>

          {/* 底部文字区域 */}
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title || "(Untitled)"}
            </Text>

            {typeof item.price === "number" && (
              <Text style={styles.price}>${item.price}</Text>
            )}

            <View style={styles.metaRow}>
              <Ionicons name="location-sharp" size={14} color="#9ca3af" />
              <Text style={styles.metaText}>{distance} km</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // ========= 整个页面布局 =========
  return (
    <View style={styles.container}>
      {/* 顶部：问候 + Weather */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingText}>Hi, Carolyn.</Text>
          <Text style={styles.subGreeting}>Welcome to UniBrazzaar!</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <WeatherBanner />
        </View>
      </View>

      {/* 搜索栏 */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for items..."
          placeholderTextColor="#c9c9c9"
        />
      </View>

      {/* 分类 row：用图片 + 背景选中态 */}
      <View style={styles.categoryRow}>
        {CATEGORIES.map((cat) => (
          <CategoryButton
            key={cat.key}
            label={cat.label}
            image={cat.image}
            active={selectedCategory === cat.key}
            onPress={() => setSelectedCategory(cat.key)}
          />
        ))}
      </View>

      {/* All items 标题（会根据选中分类改变文字） */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{currentCategoryLabel}</Text>
        <Text style={styles.sectionCount}>
          {displayedItems.length} items
        </Text>
      </View>

      {/* 卡片背景区域（单独换颜色） */}
 
        {displayedItems.length === 0 ? (
          <View style={styles.emptyInCategory}>
            <Text style={styles.emptyInCategoryTitle}>
              No items in {currentCategoryLabel}.
            </Text>
            <Text style={styles.emptyInCategoryText}>
              Try posting a new item in this category.
            </Text>
          </View>
        ) : (
          <FlatList
            data={displayedItems}
            keyExtractor={(it) => it.id}
            renderItem={renderItem}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

  );
}

/* 分类按钮组件：图片 + 文字 + 选中浅蓝背景 */
function CategoryButton({
  label,
  image,
  active,
  onPress,
}: {
  label: string;
  image: any;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        active && styles.categoryButtonActive,
      ]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View
        style={[
          styles.categoryIconWrapper,
          active && styles.categoryIconWrapperActive,
        ]}
      >
        <Image
          source={image}
          style={styles.categoryIcon}
          resizeMode="contain"
        />
      </View>
      <Text
        style={[
          styles.categoryLabel,
          active && styles.categoryLabelActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/* 样式 */
const CARD_BG = "#ffffff";
const PAGE_BG = "#F5F5F5";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PAGE_BG,
    paddingHorizontal: 16,
    paddingTop: 40,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },

  /* Header */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#224594",
  },
  subGreeting: {
    fontSize: 13,
    color: "#6b7fa8",
    marginTop: 2,
  },

  /* Search bar */
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: "#ffe4c6",
    borderWidth: 1,
    borderColor: "#FE8A0D",

    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
   
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
  },

  /* Categories row */
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  categoryButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  categoryButtonActive: {},
  categoryIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  categoryIconWrapperActive: {
    backgroundColor: "#E3F0FF", 
  },
  categoryIcon: {
    width: 50,
    height: 50,
  },
  categoryLabel: {
    fontSize: 11,
    color: "#8fa1c6",
  },
  categoryLabelActive: {
    color: "#224594",
    fontWeight: "600",
  },

  /* Section header */
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a2340",
  },
  sectionCount: {
    fontSize: 12,
    color: "#9ca3af",
  },


  /* Card */
  shadowWrapper: {
    width: "48%",
    marginBottom: 14,

    // 阴影
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 6,
  },
  card: {
    width: "100%",
    backgroundColor: CARD_BG, // card 自己的背景色
    borderRadius: 18,
    overflow: "hidden",
  },

  imageWrapper: {
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: 180,
  },
  noImageBox: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },
  noImageText: {
    fontSize: 12,
    color: "#9ca3af",
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
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontSize: 11,
    color: "#9ca3af",
    marginLeft: 4,
  },

  /* 某分类里没有 item 时 */
  emptyInCategory: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyInCategoryTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a2340",
    marginBottom: 6,
  },
  emptyInCategoryText: {
    fontSize: 13,
    color: "#6b7280",
  },
});
