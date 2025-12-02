import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { auth, db } from "../firebase/firebaseConfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";  

export default function SignUpScreen() {
  const [fullName, setFullName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async () => {
    if (!fullName || !schoolName || !email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

     
      await updateProfile(user, {
        displayName: fullName,
      });

      
      await setDoc(doc(db, "users", user.uid), {
        fullName: fullName,
        university: schoolName,
        email: email,
        createdAt: new Date(),
      });

      Alert.alert("Account created", "Welcome to UniBazaar!", [
        {
          text: "Go to login",
          onPress: () => router.replace("/login"),
        },
      ]);
    } catch (error) {
      console.error("Sign up error:", error);
      let message = "Sign up failed.";
      if (error.code === "auth/email-already-in-use")
        message = "This email is already in use.";
      if (error.code === "auth/invalid-email")
        message = "Please enter a valid email.";
      if (error.code === "auth/weak-password")
        message = "Password should be at least 6 characters.";
      Alert.alert("Error", message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.illustrationWrapper}>
        <Image
          source={require("./image/loginImg2.png")}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>

      <View style={styles.card}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 10 }}
        >
          <Text style={styles.title}>Create your UniBazaar account</Text>

          {/* Full name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          {/* School name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>School name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Simon Fraser University"
              value={schoolName}
              onChangeText={setSchoolName}
            />
          </View>

          {/* School email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>School email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your university email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.bottomLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const THEME_BLUE = "#18458F"; // close to your screenshot 
const THEME_ORANGE = "#FF9F2E"; 
// button & border color 
const CARD_BG = "#FFF7EC"; // slightly warm white like your login card 
const styles = StyleSheet.create({ 
  container: { flex: 1, backgroundColor: THEME_BLUE, alignItems: "center", justifyContent: "flex-start", }, 
  illustrationWrapper: { marginTop: 40, alignItems: "center", },
   illustration: { width: 150, height: 150, }, 
   card: { width: "90%", backgroundColor: CARD_BG, borderRadius: 28, paddingHorizontal: 22, paddingTop: 24, paddingBottom: 18, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 5, flexGrow: 1, }, title: { fontSize: 20, fontWeight: "700", textAlign: "center", marginBottom: 20, color: "#333", }, 
   inputGroup: { marginBottom: 14, }, 
   label: { fontSize: 13, color: THEME_ORANGE, marginBottom: 6, }, 
   input: { height: 46, borderRadius: 14, borderWidth: 1.5, borderColor: THEME_ORANGE, backgroundColor: "#FFF", paddingHorizontal: 12, fontSize: 14, }, 
   button: { marginTop: 12, height: 48, borderRadius: 24, backgroundColor: THEME_ORANGE, justifyContent: "center", alignItems: "center", }, 
   buttonText: { color: "#FFF", fontSize: 16, fontWeight: "600", }, bottomRow: { flexDirection: "row", justifyContent: "center", marginTop: 16, }, 
   bottomText: { fontSize: 13, color: "#999", marginRight: 4, }, bottomLink: { fontSize: 13, color: THEME_ORANGE, fontWeight: "600", }, });