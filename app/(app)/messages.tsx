import { useState, useEffect } from "react";
import { FlatList, SafeAreaView, StyleSheet, View } from "react-native";
import { useEmbeddedSolanaWallet } from "@privy-io/expo";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import * as ed from "@noble/ed25519";
import { useMessages } from "../context/MessageContext";
import { base58ToUint8Array, hexToUint8Array } from "../utils/utils";

export default function MessagesScreen() {
  const { messages, markAsRead } = useMessages();
  const wallet = useEmbeddedSolanaWallet();
  const [decryptedMessages, setDecryptedMessages] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    decryptNewMessages();
  }, [messages]);

  type Message = {
    id: string;
    sender_public_key: string;
    recipient_public_key: string;
    encrypted_content: string;
    created_at: string;
    is_read: boolean;
  };

  const decryptNewMessages = async () => {
    if (!wallet?.wallets?.[0]?.publicKey) return;

    const newDecrypted: { [key: string]: string } = {};

    for (const message of messages) {
      if (decryptedMessages[message.id]) continue;

      try {
        const senderPubKey = base58ToUint8Array(message.sender_public_key);
        const recipientPubKey = base58ToUint8Array(
          message.recipient_public_key
        );

        const combinedKeys = new Uint8Array([
          ...senderPubKey,
          ...recipientPubKey,
        ]);
        const signature = await ed.sign(combinedKeys, recipientPubKey);

        const encryptedBytes = hexToUint8Array(message.encrypted_content);
        const decrypted = new Uint8Array(encryptedBytes.length);

        for (let i = 0; i < encryptedBytes.length; i++) {
          decrypted[i] = encryptedBytes[i] ^ signature[i % signature.length];
        }

        newDecrypted[message.id] = new TextDecoder().decode(decrypted);

        if (!message.is_read) {
          await markAsRead(message.id);
        }
      } catch (error) {
        console.error("Error decrypting message:", error);
        newDecrypted[message.id] = "Error decrypting message";
      }
    }

    setDecryptedMessages((prev) => ({ ...prev, ...newDecrypted }));
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={styles.messageContainer}>
      <ThemedText style={styles.sender}>
        From:{" "}
        {item.sender_public_key === wallet?.wallets?.[0]?.publicKey
          ? "You"
          : item.sender_public_key}
      </ThemedText>
      <ThemedText style={styles.message}>
        {decryptedMessages[item.id] || "Decrypting..."}
      </ThemedText>
      <ThemedText style={styles.timestamp}>
        {new Date(item.created_at).toLocaleString()}
      </ThemedText>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Messages</ThemedText>
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.list}
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  list: {
    flex: 1,
  },
  messageContainer: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    marginBottom: 10,
  },
  sender: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 5,
  },
  message: {
    fontSize: 16,
    marginBottom: 5,
  },
  timestamp: {
    fontSize: 12,
    color: "#666",
  },
});
