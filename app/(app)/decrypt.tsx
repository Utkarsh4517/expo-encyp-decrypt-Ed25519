import { SafeAreaView, StyleSheet, View } from "react-native";
import { useEmbeddedSolanaWallet } from "@privy-io/expo";
import { router } from "expo-router";
import * as ed from '@noble/ed25519';
import { useState } from "react";
import { sha512 } from "@noble/hashes/sha512";
import { ThemedView } from "@/components/ThemedView";
import { MessageDisplay } from "../components/MessageDisplay";
import { DecryptionForm } from "../components/decryption/DecryptionForm";
import { ThemedText } from "@/components/ThemedText";
import { base58ToUint8Array, hexToUint8Array } from "../utils/utils";

ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

export default function DecryptScreen() {
  const wallet = useEmbeddedSolanaWallet();
  const [decryptedMessage, setDecryptedMessage] = useState('');

  const handleDecrypt = async (encryptedHex: string, senderKey: string) => {
    try {
      if (!wallet?.wallets?.[0]?.publicKey) {
        alert('Please connect your wallet first');
        return;
      }

      const senderPubKey = base58ToUint8Array(senderKey);
      const recipientPubKey = base58ToUint8Array(wallet.wallets[0].publicKey);
      
      const combinedKeys = new Uint8Array([...senderPubKey, ...recipientPubKey]);
      const signature = await ed.sign(combinedKeys, recipientPubKey);
      
      const encryptedBytes = hexToUint8Array(encryptedHex);
      const decrypted = new Uint8Array(encryptedBytes.length);
      for (let i = 0; i < encryptedBytes.length; i++) {
        decrypted[i] = encryptedBytes[i] ^ signature[i % signature.length];
      }

      setDecryptedMessage(new TextDecoder().decode(decrypted));
    } catch (error) {
      alert('Decryption failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <SafeAreaView style={{flex: 1}}>

        
    <ThemedView style={styles.container}>
      <ThemedText style={styles.backButton} onPress={() => router.back()}>
        ← Back
      </ThemedText>
      
      <View style={styles.content}>
        <ThemedText style={styles.title}>Decrypt Message</ThemedText>
        <DecryptionForm onDecrypt={handleDecrypt} />
        <MessageDisplay 
          title="Decrypted Message:" 
          message={decryptedMessage} 
        />
      </View>
    </ThemedView>
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    flex: 1,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  backButton: {
    fontSize: 18,
    color: '#0a7ea4',
  },
});