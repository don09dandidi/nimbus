package com.cloudestorage.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public class LocalFileStorageService implements FileStorageService {

    private static final String STORAGE_DIR = "data/files";

    public LocalFileStorageService() {
        try {
            Files.createDirectories(Path.of(STORAGE_DIR));
        } catch (IOException e) {
            throw new RuntimeException("Eroare la inițializarea directorului de stocare: " + e.getMessage(), e);
        }
    }

    @Override
    public void store(String storedFilename, byte[] encryptedData) {
        try {
            Files.write(Path.of(STORAGE_DIR, storedFilename), encryptedData);
        } catch (IOException e) {
            throw new RuntimeException("Eroare la scrierea fișierului pe disc: " + e.getMessage(), e);
        }
    }

    @Override
    public byte[] retrieve(String storedFilename) {
        try {
            return Files.readAllBytes(Path.of(STORAGE_DIR, storedFilename));
        } catch (IOException e) {
            throw new RuntimeException("Eroare la citirea fișierului de pe disc: " + e.getMessage(), e);
        }
    }

    @Override
    public void delete(String storedFilename) {
        try {
            Files.deleteIfExists(Path.of(STORAGE_DIR, storedFilename));
        } catch (IOException e) {
            throw new RuntimeException("Eroare la ștergerea fișierului de pe disc: " + e.getMessage(), e);
        }
    }
}
