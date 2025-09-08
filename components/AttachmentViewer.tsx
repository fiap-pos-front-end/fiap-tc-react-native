import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTransferAttachments } from "@/hooks/firebase/useStorage";
import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { storageService } from "../services/storage";

interface AttachmentItem {
  name: string;
  downloadURL: string;
  size: number;
  type: "image" | "document" | "other";
  fullPath: string;
  created: string;
}

interface AttachmentViewerProps {
  transferId: string;
  editable?: boolean;
  onAttachmentAdded?: () => void;
}

export function AttachmentViewer({
  transferId,
  editable = false,
  onAttachmentAdded,
}: AttachmentViewerProps) {
  const { listAttachments, deleteAttachment } = useTransferAttachments();
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(true);

  useEffect(() => {
    loadAttachments();
  }, [transferId]);

  const loadAttachments = async () => {
    try {
      setLoadingAttachments(true);
      const attachmentList = await listAttachments(transferId);
      setAttachments(attachmentList);
    } catch (error) {
      console.error("Error loading attachments:", error);
    } finally {
      setLoadingAttachments(false);
    }
  };

  const handleDeleteAttachment = (attachment: AttachmentItem) => {
    Alert.alert("Excluir Anexo", `Deseja excluir "${attachment.name}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          const success = await deleteAttachment(attachment.fullPath);
          if (success) {
            loadAttachments();
            Alert.alert("Sucesso", "Anexo excluído!");
          } else {
            Alert.alert("Erro", "Falha ao excluir anexo");
          }
        },
      },
    ]);
  };

  const handleOpenAttachment = (attachment: AttachmentItem) => {
    if (attachment.type === "image") {
      Alert.alert("Visualizar Imagem", "Escolha uma opção:", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Abrir no Navegador",
          onPress: () => Linking.openURL(attachment.downloadURL),
        },
      ]);
    } else {
      Linking.openURL(attachment.downloadURL);
    }
  };

  const renderAttachment = (attachment: AttachmentItem, index: number) => (
    <ThemedView key={index} style={styles.attachmentItem}>
      <TouchableOpacity
        style={styles.attachmentContent}
        onPress={() => handleOpenAttachment(attachment)}
      >
        {attachment.type === "image" ? (
          <Image
            source={{ uri: attachment.downloadURL }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <ThemedView style={styles.documentIcon}>
            <ThemedText style={styles.documentIconText}>
              {attachment.type === "document" ? (
                <Feather name="file" size={24} color="black" />
              ) : (
                <Feather name="folder" size={24} color="black" />
              )}
            </ThemedText>
          </ThemedView>
        )}

        <ThemedView style={styles.attachmentInfo}>
          <ThemedText style={styles.attachmentName} numberOfLines={2}>
            {attachment.name}
          </ThemedText>
          <ThemedText style={styles.attachmentSize}>
            {storageService.formatFileSize(attachment.size)}
          </ThemedText>
          <ThemedText style={styles.attachmentDate}>
            {new Date(attachment.created).toLocaleDateString("pt-BR")}
          </ThemedText>
        </ThemedView>
      </TouchableOpacity>

      {editable && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteAttachment(attachment)}
        >
          <ThemedText style={styles.deleteButtonText}>
            <FontAwesome name="trash-o" size={24} color="black" />
          </ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );

  if (loadingAttachments) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="defaultSemiBold" style={styles.title}>
          Anexos
        </ThemedText>
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007bff" />
          <ThemedText style={styles.loadingText}>
            Carregando anexos...
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  if (attachments.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="defaultSemiBold" style={styles.title}>
          Anexos
        </ThemedText>
        <ThemedView style={styles.emptyContainer}>
          <ThemedText style={styles.emptyIcon}>
            <Ionicons name="attach" size={24} color="black" />
          </ThemedText>
          <ThemedText style={styles.emptyText}>Nenhum anexo</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="defaultSemiBold" style={styles.title}>
        Anexos ({attachments.length})
      </ThemedText>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.attachmentsList}
        contentContainerStyle={styles.attachmentsContent}
      >
        {attachments.map(renderAttachment)}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  title: {
    marginBottom: 15,
    color: "#333",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginLeft: 10,
    color: "#666",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 30,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  emptyText: {
    color: "#666",
    fontSize: 14,
  },
  attachmentsList: {
    marginTop: 10,
  },
  attachmentsContent: {
    paddingRight: 20,
  },
  attachmentItem: {
    width: 150,
    marginRight: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  attachmentContent: {
    alignItems: "center",
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  documentIcon: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  documentIconText: {
    fontSize: 32,
  },
  attachmentInfo: {
    alignItems: "center",
    width: "100%",
  },
  attachmentName: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  attachmentSize: {
    fontSize: 10,
    color: "#666",
    marginBottom: 2,
  },
  attachmentDate: {
    fontSize: 10,
    color: "#999",
  },
  deleteButton: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: 14,
  },
});
