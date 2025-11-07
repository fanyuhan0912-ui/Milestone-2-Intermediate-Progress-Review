import React, { useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";

export default function HomeScreen() {

  const [items] = useState([
    { id: "1", title: "Casio Calculator", price: 25, description: "Like new", imageUrl: "" },
    { id: "2", title: "Textbook IAT 201", price: 15, description: "Highlight inside", imageUrl: "" },
  ]);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={{ padding: 12, borderBottomWidth: 1, borderColor: "#eee", flexDirection: "row" }}>
      <View style={{ width: 84, height: 84, backgroundColor: "#f2f2f2", borderRadius: 8, marginRight: 12,
        alignItems:"center", justifyContent:"center" }}>
        <Text style={{ color: "#888" }}>{item.imageUrl ? "IMG" : "No Image"}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: "600", fontSize: 16 }} numberOfLines={1}>
          {item.title} · ${item.price}
        </Text>
        <Text numberOfLines={2} style={{ marginTop: 4, color: "#444" }}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={items}
      keyExtractor={(it) => it.id}
      renderItem={renderItem}
      contentContainerStyle={{ paddingBottom: 24 }}
    />
  );
}
