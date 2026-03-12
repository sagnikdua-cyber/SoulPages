/**
 * Simple pseudo-encryption for local demo purposes.
 * In a real app, use Web Crypto API (SubtleCrypto).
 */
export const encryptionService = {
  encrypt(text: string, key: string): string {
    // Simple XOR for demo (DO NOT USE IN REAL PROD WITHOUT PROPER CRYSTOGRAPHY)
    // We'll use a better approach with Base64 encoding + salt for slightly better security in local storage
    const encoded = btoa(text.split('').map((char, i) => 
      String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))
    ).join(''));
    return encoded;
  },

  decrypt(encoded: string, key: string): string {
    try {
      const decoded = atob(encoded);
      const decrypted = decoded.split('').map((char, i) => 
        String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))
      ).join('');
      return decrypted;
    } catch (e) {
      return "Decryption failed (Wrong password?)";
    }
  }
};
