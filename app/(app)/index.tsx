import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { useEmbeddedSolanaWallet, usePrivy } from "@privy-io/expo";
import { router } from "expo-router";
import * as ed from '@noble/ed25519';
import { Buffer } from 'buffer';
import { useState } from "react";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { sha512 } from "@noble/hashes/sha512";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { MessageDisplay } from "../components/MessageDisplay";
import { EncryptionForm } from "../components/encryption/EncryptionForm";
import { DecryptionForm } from "../components/decryption/DecryptionForm";

ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));
const base58ToUint8Array = (base58String: string) => {
  try {
    const decoded = bs58.decode(base58String);
    if (decoded.length !== 32) {
      throw new Error('Invalid public key length');
    }
    return decoded;
  } catch (error) {
    console.error('Error converting Base58 to Uint8Array:', error);
    throw new Error('Invalid Solana public key format');
  }
};

const hexToUint8Array = (hex: string) => {
  try {
    const cleanHex = hex.replace('0x', '');
    return new Uint8Array(Buffer.from(cleanHex, 'hex'));
  } catch (error) {
    console.error('Error converting hex to Uint8Array:', error);
    throw new Error('Invalid hex format');
  }
};

export default function HomeScreen() {
  const { logout, user } = usePrivy();
  const wallet = useEmbeddedSolanaWallet();
  const [encryptedMessage, setEncryptedMessage] = useState('');
  const [decryptedMessage, setDecryptedMessage] = useState('');

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
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Solana Message Encryption</ThemedText>
          <MessageDisplay 
            title="Your Public Key:" 
            message={wallet?.wallets?.[0]?.publicKey} 
          />
        </View>

        <View style={styles.section}>
          <EncryptionForm onEncrypt={handleEncrypt} />
          <MessageDisplay 
            title="Encrypted Message:" 
            message={encryptedMessage} 
          />
        </View>

        <View style={styles.section}>
          <DecryptionForm onDecrypt={handleDecrypt} />
          <MessageDisplay 
            title="Decrypted Message:" 
            message={decryptedMessage} 
          />
        </View>
      </ScrollView>

      <ThemedText style={styles.logoutButton} onPress={() => {
        logout();
        router.replace("/login");
      }}>
        Logout
      </ThemedText>
    </ThemedView>
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  section: {
    marginBottom: 24,
  },
  logoutButton: {
    margin: 20,
    padding: 16,
    backgroundColor: "#0a7ea4",
    borderRadius: 8,
    textAlign: "center",
    color: "white",
  },
});

