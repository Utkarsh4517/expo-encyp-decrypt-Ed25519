import { SafeAreaView, StyleSheet, View } from "react-native";
import { useEmbeddedSolanaWallet } from "@privy-io/expo";
import { router } from "expo-router";
import * as ed from '@noble/ed25519';
import { Buffer } from 'buffer';
import { useState } from "react";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { sha512 } from "@noble/hashes/sha512";
import { ThemedView } from "@/components/ThemedView";
import { MessageDisplay } from "../components/MessageDisplay";
import { EncryptionForm } from "../components/encryption/EncryptionForm";
import { ThemedText } from "@/components/ThemedText";
import { base58ToUint8Array } from "../utils/utils";

ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

export default function EncryptScreen() {
  const wallet = useEmbeddedSolanaWallet();
  const [encryptedMessage, setEncryptedMessage] = useState('');

  const handleEncrypt = async (message: string, recipientKey: string) => {
    try {
      if (!wallet?.wallets?.[0]?.publicKey) {
        alert('Please connect your wallet first');
        return;
      }

      const senderPubKey = base58ToUint8Array(wallet.wallets[0].publicKey);
      const recipientPubKey = base58ToUint8Array(recipientKey);
      
      const combinedKeys = new Uint8Array([...senderPubKey, ...recipientPubKey]);
      const signature = await ed.sign(combinedKeys, senderPubKey);
      
      const messageBytes = new TextEncoder().encode(message);
      const encrypted = new Uint8Array(messageBytes.length);
      for (let i = 0; i < messageBytes.length; i++) {
        encrypted[i] = messageBytes[i] ^ signature[i % signature.length];
      }

      setEncryptedMessage(Buffer.from(encrypted).toString('hex'));
    } catch (error) {
      alert('Encryption failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <SafeAreaView style={{flex: 1}}>

    <ThemedView style={styles.container}>
      <ThemedText style={styles.backButton} onPress={() => router.back()}>
        ← Back
      </ThemedText>
      
      <View style={styles.content}>
        <ThemedText style={styles.title}>Encrypt Message</ThemedText>
        <EncryptionForm onEncrypt={handleEncrypt} />
        <MessageDisplay 
          title="Encrypted Message:" 
          message={encryptedMessage} 
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