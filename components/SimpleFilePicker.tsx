import { ThemedText } from "@/components/ThemedText";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { launchImageLibrary } from "react-native-image-picker";

interface SimpleFilePickerProps {
  onImageSelected: (imageUri: string) => void;
  disabled?: boolean;
}

export function SimpleFilePicker({
  onImageSelected,
  disabled = false,
}: SimpleFilePickerProps) {
  const selectImage = () => {
    launchImageLibrary(
      {
        mediaType: "photo",
        quality: 0.8,
        maxWidth: 1200,
        maxHeight: 1200,
        selectionLimit: 1,
      },
      (response) => {
        if (response.didCancel || response.errorMessage) {
          return;
        }

        if (response.assets && response.assets[0]) {
          const imageUri = response.assets[0].uri;
          if (imageUri) {
            onImageSelected(imageUri);
          }
        }
      }
    );
  };

  return (
    <TouchableOpacity
      style={[simpleStyles.button, disabled && simpleStyles.disabled]}
      onPress={selectImage}
      disabled={disabled}
    >
      <ThemedText style={simpleStyles.buttonText}>📎 Adicionar Foto</ThemedText>
    </TouchableOpacity>
  );
}

const simpleStyles = StyleSheet.create({
  button: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  disabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
