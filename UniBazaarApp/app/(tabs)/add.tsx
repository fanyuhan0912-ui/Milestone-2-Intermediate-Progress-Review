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
        backgroundColor: disabled ? "#c9c9c9" : "#2f6fed",
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
  const [imageUri, setImageUri] = useState<string | null>(null); // file:// 或 asset://
  const [submitting, setSubmitting] = useState(false);


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
        }
      } catch {}
    })();
  }, []);




  useEffect(() => {
    const draft = JSON.stringify({ title, price, description, imageUri });
    AsyncStorage.setItem(DRAFT_KEY, draft).catch(() => {});
  }, [title, price, description, imageUri]);

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
    const res = await ImagePicker.launchCameraAsync({ quality: 0.8 });
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
      });

      // 发布成功后清除草稿
      await AsyncStorage.removeItem(DRAFT_KEY);

      setSubmitting(false);
      Alert.alert("Success", "Item posted!");
      setTitle("");
      setPrice("");
      setDescription("");
      setImageUri(null);
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
        <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 8 }}>
          Post a new item
        </Text>

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

        <Label>Photo</Label>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
          <View style={{ flex: 1 }}>
            <OutlineButton title="Choose from library" onPress={pickImage} />
          </View>
          <View style={{ flex: 1 }}>
            <OutlineButton title="Take a photo" onPress={takePhoto} />
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
