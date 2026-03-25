import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface StudentInfo {
  name: string;
  pin: string;
  loginTime: string;
}

const EXERCISE_TYPES = [
  { id: "quiz", title: "Quiz", icon: "📝", color: "#0a7ea4" },
  { id: "fillInBlank", title: "Fill in the Blank", icon: "✏️", color: "#ff6b6b" },
  { id: "matching", title: "Matching", icon: "🔗", color: "#f59e0b" },
];

const LANGUAGES = [
  { id: "en", title: "English", flag: "🇬🇧" },
  { id: "ar", title: "Arabic", flag: "🇸🇦" },
];

export default function StudentHomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");

  useEffect(() => {
    const loadStudentInfo = async () => {
      try {
        const info = await AsyncStorage.getItem("studentInfo");
        if (info) {
          setStudentInfo(JSON.parse(info));
        }
      } catch (error) {
        console.error("Failed to load student info:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStudentInfo();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("studentInfo");
    router.push("/(tabs)/student-login");
  };

  const handleStartExercise = (exerciseType: string) => {
    router.push({
      pathname: "/(tabs)/exercise-screen",
      params: { type: exerciseType, language: selectedLanguage },
    });
  };

  if (loading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="px-4 py-6">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-8">
            <View>
              <Text className="text-3xl font-bold text-foreground">
                Hi, {studentInfo?.name}! 👋
              </Text>
              <Text className="text-base text-muted mt-1">
                Ready to practice?
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleLogout}
              className="bg-error/10 rounded-full p-3"
            >
              <Text className="text-lg">🚪</Text>
            </TouchableOpacity>
          </View>

          {/* Language Selection */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-foreground mb-3">
              Choose Language
            </Text>
            <View className="flex-row gap-3">
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.id}
                  onPress={() => setSelectedLanguage(lang.id)}
                  className={`flex-1 rounded-2xl py-3 px-4 items-center border-2 ${
                    selectedLanguage === lang.id
                      ? "bg-primary border-primary"
                      : "bg-surface border-border"
                  }`}
                >
                  <Text className="text-2xl mb-1">{lang.flag}</Text>
                  <Text
                    className={`font-semibold ${
                      selectedLanguage === lang.id
                        ? "text-background"
                        : "text-foreground"
                    }`}
                  >
                    {lang.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Exercise Types */}
          <View>
            <Text className="text-lg font-semibold text-foreground mb-3">
              Choose Exercise Type
            </Text>
            <View className="gap-3">
              {EXERCISE_TYPES.map((exercise) => (
                <TouchableOpacity
                  key={exercise.id}
                  onPress={() => handleStartExercise(exercise.id)}
                  className="bg-surface rounded-2xl p-4 border border-border flex-row items-center justify-between active:opacity-70"
                >
                  <View className="flex-row items-center gap-4">
                    <Text className="text-4xl">{exercise.icon}</Text>
                    <View>
                      <Text className="text-lg font-semibold text-foreground">
                        {exercise.title}
                      </Text>
                      <Text className="text-sm text-muted mt-1">
                        Test your skills
                      </Text>
                    </View>
                  </View>
                  <Text className="text-2xl">→</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Stats Section */}
          <View className="mt-12 bg-primary/10 rounded-2xl p-6 border border-primary/20">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Your Progress
            </Text>
            <View className="flex-row justify-around">
              <View className="items-center">
                <Text className="text-3xl font-bold text-primary">0</Text>
                <Text className="text-sm text-muted mt-1">Exercises Done</Text>
              </View>
              <View className="items-center">
                <Text className="text-3xl font-bold text-success">0%</Text>
                <Text className="text-sm text-muted mt-1">Accuracy</Text>
              </View>
              <View className="items-center">
                <Text className="text-3xl font-bold text-warning">0</Text>
                <Text className="text-sm text-muted mt-1">Points</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
