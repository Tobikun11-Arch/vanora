import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface InputFieldProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  error?: string;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  compact?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  error,
  keyboardType = "default",
  compact = false,
}) => {
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <View
        style={[
          styles.inputWrapper,
          compact && styles.inputWrapperCompact,
          error && styles.errorBorder,
        ]}
      >
        {leftIcon && (
          <MaterialCommunityIcons
            name={leftIcon}
            size={compact ? 18 : 20}
            color="#999"
            style={styles.leftIcon}
          />
        )}
        <TextInput
          style={[styles.input, compact && styles.inputCompact]}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={() => {
              if (rightIcon === "eye" || rightIcon === "eye-off") {
                setIsSecure(!isSecure);
              }
              onRightIconPress?.();
            }}
            style={styles.rightIconButton}
          >
            <MaterialCommunityIcons
              name={isSecure ? "eye-off" : "eye"}
              size={compact ? 18 : 20}
              color="#999"
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
    width: "100%",
  },
  containerCompact: {
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eef2ef",
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f4f8f5",
  },
  inputWrapperCompact: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#f7f9f8",
  },
  errorBorder: {
    borderColor: "#ff4444",
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    color: "#000",
  },
  inputCompact: {
    paddingVertical: 6,
    fontSize: 14,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIconButton: {
    padding: 8,
  },
  errorText: {
    color: "#ff4444",
    fontSize: 12,
    marginTop: 4,
  },
});
