import { ThemedText } from "@/components/ThemedText";
import { StyleSheet, View, Clipboard } from "react-native";

type MessageDisplayProps = {
  title: string;
  message?: string;
};

export function MessageDisplay({ title, message }: MessageDisplayProps) {
  if (!message) return null;

  const handleCopy = () => {
    Clipboard.setString(message);
    alert('Copied to clipboard!');
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>{title}</ThemedText>
      <View style={styles.messageContainer}>
        <ThemedText style={styles.message}>{message}</ThemedText>
        <ThemedText style={styles.copyButton} onPress={handleCopy}>
          Copy
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  messageContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  message: {
    flex: 1,
    fontSize: 14,
  },
  copyButton: {
    marginLeft: 10,
    padding: 6,
    backgroundColor: '#0a7ea4',
    borderRadius: 4,
    color: 'white',
  },
});