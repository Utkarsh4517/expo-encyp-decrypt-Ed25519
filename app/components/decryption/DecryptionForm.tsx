import { StyleSheet, TextInput, View } from "react-native";
import { useState } from "react";
import { ThemedText } from "@/components/ThemedText";

type DecryptionFormProps = {
  onDecrypt: (encryptedMessage: string, senderKey: string) => void;
};

export function DecryptionForm({ onDecrypt }: DecryptionFormProps) {
  const [encryptedMessage, setEncryptedMessage] = useState('');
  const [senderKey, setSenderKey] = useState('');

  const handleSubmit = () => {
    onDecrypt(encryptedMessage, senderKey);
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Decrypt Message</ThemedText>
      
      <TextInput
        style={styles.input}
        placeholder="Sender's Public Key"
        value={senderKey}
        onChangeText={setSenderKey}
        multiline
      />
      
      <TextInput
        style={[styles.input, styles.messageInput]}
        placeholder="Encrypted message (hex)"
        value={encryptedMessage}
        onChangeText={setEncryptedMessage}
        multiline
      />

      <ThemedText 
        style={styles.button}
        onPress={handleSubmit}
      >
        Decrypt
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: "#0a7ea4",
    padding: 16,
    borderRadius: 8,
    textAlign: "center",
    color: "white",
  },
});