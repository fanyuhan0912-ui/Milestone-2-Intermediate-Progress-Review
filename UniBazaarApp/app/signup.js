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

