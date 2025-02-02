import { StyleSheet, View, Clipboard } from "react-native";
import { ThemedText } from "@/components/ThemedText";

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
// 4jxaeNQgRDzervdaoK8mg8Wqe4SoSNo65eNA6pJ95hqu
//  91757d256b1f10eb9e8255918bc295463a4ddf08e30c
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>{title}</ThemedText>
      <View style={styles.messageContainer}>
        <ThemedText style={styles.message} numberOfLines={2} ellipsizeMode="middle">
          {message}
        </ThemedText>
        <ThemedText style={styles.copyButton} onPress={handleCopy}>
          Copy
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  messageContainer: {
    width: '100%',
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
    marginRight: 10,
  },
  copyButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#0a7ea4',
    borderRadius: 4,
    color: 'white',
  },
});