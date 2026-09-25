package com.cloudestorage.service;

public interface FileStorageService {
    // storedFilename e numele fizic pe disc (UUID, nu numele original al userului)
    void store(String storedFilename, byte[] encryptedData);
    byte[] retrieve(String storedFilename);
    void delete(String storedFilename);
}
