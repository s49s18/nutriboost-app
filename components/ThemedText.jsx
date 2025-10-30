import React from "react";
import { Text } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { Colors } from "../constants/Colors";

const ThemedText = ({ style, title = false, children, ...props }) => {
  const { themeName } = useTheme();
  const theme = Colors[themeName] ?? Colors.light;

  const textColor = title ? theme.title : theme.text;

  return (
    <Text
      style={[{ backgroundColor: theme.background, color: textColor }, style]}
      {...props}
    >
      {children}
    </Text>
  );
};

export default ThemedText;
