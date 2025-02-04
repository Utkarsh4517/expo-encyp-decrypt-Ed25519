import { StyleSheet, View, TouchableOpacity } from "react-native";
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

ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));


export default function HomeScreen() {
  const { logout } = usePrivy();
  const wallet = useEmbeddedSolanaWallet();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText style={styles.title}>Solana Message Encryption</ThemedText>
        
        <MessageDisplay 
          title="Your Public Key:" 
          message={wallet?.wallets?.[0]?.publicKey} 
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.encryptButton]} 
            onPress={() => router.push('/(app)/encrypt')}
          >
            <ThemedText style={styles.buttonText}>Encrypt</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.decryptButton]} 
            onPress={() => router.push('/(app)/decrypt')}
          >
            <ThemedText style={styles.buttonText}>Decrypt</ThemedText>
          </TouchableOpacity>

       
        </View>
        <View style={{height: 20}}> </View>
        <TouchableOpacity 
            style={[styles.button, styles.messagesButton]} 
            onPress={() => router.push('/(app)/messages')}
          >
            <ThemedText style={styles.buttonText}>Messages</ThemedText>
          </TouchableOpacity>
      </View>

      <ThemedText style={styles.logoutButton} onPress={() => {
        logout();
        router.replace("/login");
      }}>
        Logout
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 40,
  },
  button: {
    width: 150,
    height: 150,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  encryptButton: {
    backgroundColor: '#4CAF50',
  },
  decryptButton: {
    backgroundColor: '#f44336',
  },
  messagesButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
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

