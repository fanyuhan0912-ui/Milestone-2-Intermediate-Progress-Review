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
      // 1. 创建 Auth 用户
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 2. 在 Auth 里保存名字（可选）
      await updateProfile(user, {
        displayName: fullName,
      });

      // 3. 在 Firestore 里建 users 文档
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
      // @ts-ignore（如果你用 ts 可以加这一行或者改一下类型判断）
      if (error.code === "auth/email-already-in-use")
        message = "This email is already in use.";
      // @ts-ignore
      if (error.code === "auth/invalid-email")
        message = "Please enter a valid email.";
      // @ts-ignore
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#234594",
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  illustrationWrapper: {
    alignItems: "center",
  
  },
  illustration: {
    width: "85%",
    height: 180,
  },
  card: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    color: "#111827",
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
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
  button: {
    marginTop: 16,
    backgroundColor: "#fe8a0e",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  bottomText: {
    fontSize: 13,
    color: "#4B5563",
  },
  bottomLink: {
    marginLeft: 4,
    fontSize: 13,
    color: "#2f6fed",
    fontWeight: "600",
  },
});
