import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  Alert,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "../../firebase/firebaseConfig";
import { addDoc, collection } from "firebase/firestore";

const DRAFT_KEY = "add_draft_v1";

// category
const CATEGORY_OPTIONS = [
  { key: "furniture", label: "Furniture" },
  { key: "books", label: "Books" },
  { key: "clothing", label: "Clothing" },
  { key: "electronics", label: "Electronics" },
];

// condition
const condition_OPTIONS = [
  { key: "brandNew", label: "Brand New" },
  { key: "barelyUsed", label: "Barely Used" },
  { key: "gentlyUsed", label: "Gently Used" },
  { key: "fairCondition", label: "Fair Condition" },
  { key: "needRepair", label: "Need Repair" },
];

function Label({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontWeight: "600", marginTop: 12 }}>{children}</Text>;
}

function PrimaryButton({
  title,
  onPress,
  disabled,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={{
        backgroundColor: disabled ? "#c9c9c9" : "#FF7E3E",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 16,
      }}
    >
      <Text style={{ color: "white", fontWeight: "700" }}>{title}</Text>
    </TouchableOpacity>
  );
}

function OutlineButton({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        borderWidth: 1,
        borderColor: "#cfcfcf",
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
      }}
    >
      <Text style={{ fontWeight: "600" }}>{title}</Text>
    </TouchableOpacity>
  );
}

export default function AddScreen() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<string>("");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 当前选择的分类
  const [category, setCategory] = useState<string>("furniture");
  // 🔹 新增：当前选择的物品状况（Condition）
  const [condition, setCondition] = useState<string>("brandNew");

  // 载入草稿
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(DRAFT_KEY);
        if (raw) {
          const d = JSON.parse(raw);
          setTitle(d.title ?? "");
          setPrice(d.price ?? "");
          setDescription(d.description ?? "");
          setImageUri(d.imageUri ?? null);
          setCategory(d.category ?? "furniture");
          setCondition(d.condition ?? "brandNew");
        }
      } catch {}
    })();
  }, []);

  // 保存草稿（把 condition 也一起存）
  useEffect(() => {
    const draft = JSON.stringify({
      title,
      price,
      description,
      imageUri,
      category,
      condition,
    });
    AsyncStorage.setItem(DRAFT_KEY, draft).catch(() => {});
  }, [title, price, description, imageUri, category, condition]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "We need access to your photos.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!res.canceled) setImageUri(res.assets[0].uri);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "We need access to your camera.");
      return;
    }
    const res = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });
    if (!res.canceled) setImageUri(res.assets[0].uri);
  };

  const submit = async () => {
    if (!title.trim())
      return Alert.alert("Missing field", "Title is required.");
    if (!price.trim() || isNaN(Number(price)))
      return Alert.alert("Invalid price", "Price must be a number.");

    try {
      setSubmitting(true);
      await addDoc(collection(db, "items"), {
        title: title.trim(),
        price: Number(price),
        description: description.trim(),
        imageUrl: imageUri ?? "",
        sellerId: auth?.currentUser?.uid || "anon",
        createdAt: Date.now(),
        // ✅ 把分类写进 Firestore
        category: category,
        // ✅ 把物品状况写进 Firestore
        condition: condition,
      });

      await AsyncStorage.removeItem(DRAFT_KEY);
      setSubmitting(false);
      Alert.alert("Success", "Item posted!");

      // 重置表单
      setTitle("");
      setPrice("");
      setDescription("");
      setImageUri(null);
      setCategory("furniture");
      setCondition("brandNew");
    } catch (e: any) {
      setSubmitting(false);
      console.error(e);
      Alert.alert("Error", e?.message || "Failed to post");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "#fff" }}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: 60,
          paddingHorizontal: 16,
          paddingBottom: 24,
        }}
      >
        <Text
          style={{ fontSize: 20, fontWeight: "700", marginBottom: 8 }}
        >
          Post a new item
        </Text>

        {/* Title */}
        <Label>Title</Label>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="IKEA Desk"
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 10,
            padding: 12,
            marginTop: 6,
          }}
        />

        {/* Price */}
        <Label>Price</Label>
        <TextInput
          value={price}
          onChangeText={setPrice}
          placeholder="e.g. 60"
          keyboardType="numeric"
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 10,
            padding: 12,
            marginTop: 6,
          }}
        />

        {/* Category 选择 */}
        <Label>Category</Label>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            marginTop: 8,
          }}
        >
          {CATEGORY_OPTIONS.map((opt) => {
            const isActive = category === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setCategory(opt.key)}
                activeOpacity={0.8}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: isActive ? "#2f6fed" : "#d4d4d4",
                  backgroundColor: isActive ? "#E3F0FF" : "#ffffff",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: isActive ? "700" : "500",
                    color: isActive ? "#224594" : "#555",
                  }}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 🔹 新增：Condition 选择 */}
        <Label>Condition</Label>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            marginTop: 8,
          }}
        >
          {condition_OPTIONS.map((opt) => {
            const isActive = condition === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setCondition(opt.key)}
                activeOpacity={0.8}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: isActive ? "#FF7E3E" : "#d4d4d4",
                  backgroundColor: isActive ? "#FFF1E8" : "#ffffff",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: isActive ? "700" : "500",
                    color: isActive ? "#CC4F0F" : "#555",
                  }}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Description */}
        <Label>Description</Label>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Condition, pickup location, etc."
          multiline
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 10,
            padding: 12,
            height: 100,
            marginTop: 6,
            textAlignVertical: "top",
          }}
        />

        {/* Photo */}
        <Label>Photo</Label>
        <View
          style={{ flexDirection: "row", gap: 10, marginTop: 8 }}
        >
          <View style={{ flex: 1 }}>
            <OutlineButton
              title="Choose from library"
              onPress={pickImage}
            />
          </View>
          <View style={{ flex: 1 }}>
            <OutlineButton
              title="Take a photo"
              onPress={takePhoto}
            />
          </View>
        </View>

        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={{
              width: "100%",
              height: 220,
              borderRadius: 12,
              marginTop: 12,
              backgroundColor: "#f2f2f2",
            }}
          />
        ) : null}

        <PrimaryButton
          title={submitting ? "Posting..." : "Post item"}
          onPress={submit}
          disabled={submitting}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
