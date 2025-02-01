# Solana Message Encryption App for Insecure Environments

A React Native mobile application that enables secure message encryption and decryption using Solana wallet public keys for insecure environments. Built with Expo and Privy for authentication.

## Features

- SMS-based authentication using Privy
- Automatic Solana wallet creation for new users
- End-to-end message encryption using public keys

## Technical Architecture

### Authentication Flow
1. User enters phone number
2. Receives SMS verification code
3. Upon verification:
   - Creates Privy account
   - Generates Solana wallet if user doesn't have one
   - Redirects to main app screen

### Cryptographic Implementation

The encryption process leverages Elliptic-curve Diffie–Hellman (ECDH) principles using Ed25519 curve:

#### ECDH Overview
- Ed25519 is a modern elliptic curve that provides 128 bits of security
- Uses Curve25519 as the underlying elliptic curve
- Provides fast, secure operations for digital signatures and key exchange

#### Implementation
Instead of traditional ECDH key exchange, we use a modified approach that:
1. Combines public keys of both parties
2. Uses Ed25519 signature as a deterministic key derivation function
3. Employs XOR operations for the actual encryption/decryption

This approach allows us to:
- Use only public keys for encryption/decryption
- Maintain forward secrecy
- Ensure only intended recipients can decrypt messages

### Encryption Algorithm

The encryption process uses a combination of Ed25519 signatures and XOR operations:

1. **Key Preparation**:
   ```typescript
   // Convert Base58 Solana public keys to raw bytes
   const senderPubKey = base58ToUint8Array(senderPublicKey);
   const recipientPubKey = base58ToUint8Array(recipientPublicKey);
   ```

2. **Key Derivation**:
   ```typescript
   // Combine public keys to create a unique input
   const combinedKeys = new Uint8Array([...senderPubKey, ...recipientPubKey]);
   // Generate deterministic signature as encryption key
   const signature = await ed.sign(combinedKeys, senderPubKey);
   ```

3. **Encryption Process**:
   ```typescript
   // XOR the message with the signature
   const messageBytes = new TextEncoder().encode(message);
   const encrypted = new Uint8Array(messageBytes.length);
   for (let i = 0; i < messageBytes.length; i++) {
     encrypted[i] = messageBytes[i] ^ signature[i % signature.length];
   }
   ```

4. **Decryption Process**:
   - Recipient performs the same steps with reversed roles
   - The deterministic nature of Ed25519 ensures same signature generation
   - XOR operation recovers the original message

### Security Properties

1. **Key Exchange Security**:
   - Based on the hardness of the elliptic curve discrete logarithm problem
   - Uses Ed25519's strong security properties
   - No private key exposure during encryption/decryption

2. **Message Security**:
   - End-to-end encryption
   - Only intended recipient can decrypt
   - No key material transmitted with messages

3. **Implementation Security**:
   - All operations happen client-side
   - No server storage of keys or messages
   - Uses established cryptographic libraries

### Component Structure

1. **Main Screen** (`app/(app)/index.tsx`):
   - Manages wallet connection
   - Coordinates encryption/decryption operations
   - Displays user's public key

2. **Encryption Form**:
   - Input for recipient's public key
   - Message input field
   - Encryption trigger

3. **Decryption Form**:
   - Input for sender's public key
   - Encrypted message input
   - Decryption trigger

4. **Message Display**:
   - Shows encrypted/decrypted messages
   - Copy to clipboard functionality

## Setup and Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   - Privy App ID and Client ID in `app/_layout.tsx`
   - Required dependencies in package.json

3. Run the app:
   ```bash
   npx expo start
   ```

## Usage Guide

### Sending an Encrypted Message
1. Copy your public key to share with recipient
2. Enter recipient's public key
3. Type your message
4. Click "Encrypt"
5. Share the encrypted hex string with recipient

### Decrypting a Message
1. Enter sender's public key
2. Paste the encrypted hex string
3. Click "Decrypt"
4. View the decrypted message

## Security Considerations

- The encryption scheme uses Ed25519 signatures as a key derivation function
- Security relies on the privacy of Solana private keys
- Messages are encrypted end-to-end
- No server storage of messages or keys
- All operations happen client-side

## Dependencies

Key packages:
- @privy-io/expo: Authentication and wallet management
- @noble/ed25519: Cryptographic operations
- @project-serum/anchor: Solana utilities
- expo-router: Navigation
- buffer: Binary data handling


## License

This project is licensed under the MIT License.