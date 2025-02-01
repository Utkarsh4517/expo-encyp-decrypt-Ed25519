import { StyleSheet, TextInput, View } from "react-native";
import { useState } from "react";
import { ThemedText } from "@/components/ThemedText";

type EncryptionFormProps = {
  onEncrypt: (message: string, recipientKey: string) => void;
};

export function EncryptionForm({ onEncrypt }: EncryptionFormProps) {
  const [message, setMessage] = useState('');
  const [recipientKey, setRecipientKey] = useState('');

  const handleSubmit = () => {
    onEncrypt(message, recipientKey);
    setMessage('');
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Encrypt Message</ThemedText>
      
      <TextInput
        style={styles.input}
        placeholder="Recipient's Public Key"
        value={recipientKey}
        onChangeText={setRecipientKey}
        multiline
      />
      
      <TextInput
        style={[styles.input, styles.messageInput]}
        placeholder="Message to encrypt"
        value={message}
        onChangeText={setMessage}
        multiline
      />

      <ThemedText 
        style={styles.button}
        onPress={handleSubmit}
      >
        Encrypt
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