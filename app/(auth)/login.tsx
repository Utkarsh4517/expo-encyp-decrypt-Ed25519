import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useLoginWithSMS } from '@privy-io/expo';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');

  const { state, sendCode, loginWithCode } = useLoginWithSMS({
    onLoginSuccess(user, isNewUser) {
      router.replace('/(app)');
    },
    onError(error) {
      console.error('Login error:', error);
    },
  });

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Welcome
      </ThemedText>

      {state.status === 'initial' || state.status === 'sending-code' ? (
        <View style={styles.inputContainer}>
          <ThemedText>Enter your phone number to continue</ThemedText>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Phone number"
            placeholderTextColor="#666"
            inputMode="tel"
            autoComplete="tel"
          />
          <ThemedText
            style={[styles.button, state.status === 'sending-code' && styles.buttonDisabled]}
            onPress={() => sendCode({ phone })}
          >
            {state.status === 'sending-code' ? 'Sending code...' : 'Send Code'}
          </ThemedText>
        </View>
      ) : state.status === 'awaiting-code-input' || state.status === 'submitting-code' ? (
        <View style={styles.inputContainer}>
          <ThemedText>Enter the verification code sent to your phone</ThemedText>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder="Verification code"
            placeholderTextColor="#666"
            inputMode="numeric"
            maxLength={6}
          />
          <ThemedText
            style={[styles.button, state.status === 'submitting-code' && styles.buttonDisabled]}
            onPress={() => loginWithCode({ code, phone })}
          >
            {state.status === 'submitting-code' ? 'Verifying...' : 'Verify Code'}
          </ThemedText>
        </View>
      ) : null}

      {state.status === 'error' && (
        <ThemedText style={styles.error}>{state.error?.message}</ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#0a7ea4',
    padding: 16,
    borderRadius: 8,
    textAlign: 'center',
    color: 'white',
    fontSize: 16,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  error: {
    color: 'red',
    marginTop: 16,
    textAlign: 'center',
  },
});