import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function StudentLoginScreen() {
  const router = useRouter();
  const colors = useColors();
  const [studentName, setStudentName] = useState("");
  const [studentPin, setStudentPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!studentName.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    setLoading(true);
    try {
      await AsyncStorage.setItem(
        "studentInfo",
        JSON.stringify({
          name: studentName,
          pin: studentPin,
          loginTime: new Date().toISOString(),
        })
      );

      router.push("/(tabs)/student-home");
    } catch (error) {
      Alert.alert("Error", "Failed to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center items-center px-6 py-12">
          <View className="mb-12 items-center">
            <Text className="text-4xl font-bold text-primary mb-2">
              Language Practice
            </Text>
            <Text className="text-lg text-muted text-center">
              Let's learn together!
            </Text>
          </View>

          <View className="w-full max-w-sm bg-surface rounded-3xl p-8 shadow-lg border border-border">
            <Text className="text-2xl font-bold text-foreground mb-6 text-center">
              Welcome, Student!
            </Text>

            <View className="mb-6">
              <Text className="text-base font-semibold text-foreground mb-2">
                Your Name
              </Text>
              <TextInput
                className="w-full bg-background border-2 border-border rounded-2xl px-4 py-3 text-base text-foreground"
                placeholder="Enter your name"
                placeholderTextColor={colors.muted}
                value={studentName}
                onChangeText={setStudentName}
                editable={!loading}
              />
            </View>

            <View className="mb-8">
              <Text className="text-base font-semibold text-foreground mb-2">
                PIN (Optional)
              </Text>
              <TextInput
                className="w-full bg-background border-2 border-border rounded-2xl px-4 py-3 text-base text-foreground"
                placeholder="Enter PIN if provided"
                placeholderTextColor={colors.muted}
                value={studentPin}
                onChangeText={setStudentPin}
                secureTextEntry
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className="w-full bg-primary rounded-2xl py-4 items-center justify-center"
              style={loading ? { opacity: 0.6 } : {}}
            >
              {loading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text className="text-lg font-bold text-background">
                  Start Learning
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View className="mt-12 items-center">
            <Text className="text-sm text-muted text-center">
              Ask your teacher for your PIN if you have one
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
