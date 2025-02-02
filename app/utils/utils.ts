import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";

export const base58ToUint8Array = (base58String: string) => {
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
  
  export const hexToUint8Array = (hex: string) => {
    try {
      const cleanHex = hex.replace('0x', '');
      return new Uint8Array(Buffer.from(cleanHex, 'hex'));
    } catch (error) {
      console.error('Error converting hex to Uint8Array:', error);
      throw new Error('Invalid hex format');
    }
  };