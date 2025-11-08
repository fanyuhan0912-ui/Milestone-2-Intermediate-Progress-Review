import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, ScrollView, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { auth, db } from "../../firebase/firebaseConfig";
import { addDoc, collection } from "firebase/firestore";

export default function AddScreen() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<string>("");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // choose the image in library
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
    if (!res.canceled) {
      setImageUri(res.assets[0].uri);
    }
  };

  // take the picture
  const takePhoto = async () => {
    const cam = await ImagePicker.requestCameraPermissionsAsync();
    if (cam.status !== "granted") {
      Alert.alert("Permission needed", "We need access to your camera.");
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!res.canceled) {
      setImageUri(res.assets[0].uri);
    }
  };

  const submit = async () => {
    if (!title.trim()) return Alert.alert("lack of the text", "Title is required");
    if (!price.trim() || isNaN(Number(price))) return Alert.alert("lack of the text", "Price is required");

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

      setSubmitting(false);
      Alert.alert("Success", "Item posted!");
      setTitle(""); setPrice(""); setDescription(""); setImageUri(null);
    } catch (e: any) {
      setSubmitting(false);
      console.error(e);
      Alert.alert("Error", e?.message || "Failed to post");
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, backgroundColor: "#fff", flexGrow: 1 }}>
      <Text style={{ fontSize: 18,
          paddingTop:100,
          fontWeight: "700",
          marginBottom: 12 }}>Post a new item</Text>

      <Text>Title</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="IKEA Desk"
        style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginTop: 6, marginBottom: 12 }}
      />

      <Text>Price</Text>
      <TextInput
        value={price}
        onChangeText={setPrice}
        placeholder="e.g. 60"
        keyboardType="numeric"
        style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginTop: 6, marginBottom: 12 }}
      />

      <Text>Description</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Condition, pickup location, etc."
        multiline
        style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, height: 90, marginTop: 6, marginBottom: 12 }}
      />

      {/* view*/}
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={{ width: "100%", height: 220, borderRadius: 12, marginBottom: 12 }} />
      ) : null}

      <View style={{ gap: 8, marginBottom: 16 }}>
        <Button title="Choose from library" onPress={pickImage} />
        <Button title="Take a photo" onPress={takePhoto} />
      </View>

      <Button title={submitting ? "Posting..." : "Post item"} onPress={submit} disabled={submitting} />
    </ScrollView>
  );
}
