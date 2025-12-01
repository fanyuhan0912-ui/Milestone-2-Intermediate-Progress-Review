import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { auth } from "../firebase/firebaseConfig";

import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      Alert.alert("Login Successful", `Welcome back, ${user.email}!`);
      router.replace("(tabs)/home");
    } catch (error) {
      let message = "Login failed.";
      if (error.code === "auth/invalid-email") message = "Invalid email address.";
      if (error.code === "auth/user-not-found") message = "User not found.";
      if (error.code === "auth/wrong-password") message = "Incorrect password.";
      if (error.code === "auth/invalid-credential")
        message = "Invalid email or password.";

      Alert.alert("Error", message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo placeholder (your owl image goes here) */}
      <View style={styles.logoWrapper}>
        <View style={styles.logoCircle}>
          {/* Replace owl.png with your own image */}
          <Image
            source={require("./image/loginImg2.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* White Card */}
      <View style={styles.card}>
        <Text style={styles.title}>Login to UniBazaar</Text>

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email</Text>
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
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>

        {/* Bottom text */}
      <View style={styles.bottomRow}>
        <Text style={styles.bottomText}>Don't have an account? </Text>

        <TouchableOpacity onPress={() => router.push("/signup")}>
          <Text style={styles.signUpLink}>Sign up</Text>
        </TouchableOpacity>
      </View>


      
      </View>
    </View>
  );
}

const THEME_BLUE = "#234594";
const THEME_ORANGE = "#fe8a0e";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_BLUE,
    justifyContent: "center",
    alignItems: "center",
  },
  //bottom button
    bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },

  bottomText: {
    fontSize: 14,
    color: "#4B5563",
  },

  signUpLink: {
    fontSize: 14,
    color: "#2f6fed",   // 蓝色
    textDecorationLine: "underline",
    fontWeight: "600",
  },


  /* Owl / Logo */
  logoWrapper: {
    position: "absolute",
    top: 80,
    zIndex: 10,
    alignItems: "center",
  },

  logoImage: {
    width:150,
    height: 150,
  },

  /* White Box */
  card: {
    width: "88%",
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 30,
    marginTop: 110,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
    color: "#333",
  },

  inputGroup: {
    marginBottom: 16,
  },

  inputLabel: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 4,
  },
  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 10,
    backgroundColor: "#F9FAFB",
  },

  loginButton: {
    marginTop: 10,
    height: 46,
    borderRadius: 23,
    backgroundColor: THEME_ORANGE,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },
  bottomLink: {
    fontSize: 12,
    color: "#999",
  },

  otherText: {
    marginTop: 22,
    fontSize: 12,
    color: "#C0C0C0",
    textAlign: "center",
  },

  iconRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    backgroundColor: "#FAFAFA",
  },
});
