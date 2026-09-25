package com.cloudestorage.service;

// contract pentru criptarea/decriptarea fișierelor — implementarea decide algoritmul,
// dar contractul rămâne simplu: bytes bruți intră, bytes criptați ies, și invers
public interface EncryptionService {
    byte[] encrypt(byte[] plainData);
    byte[] decrypt(byte[] encryptedData);
}
