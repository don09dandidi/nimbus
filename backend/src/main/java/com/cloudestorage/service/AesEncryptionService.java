package com.cloudestorage.service;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

// AES-256-GCM: fiecare fișier e criptat cu aceeași cheie server-side (MVP), dar cu un IV
// (vector de inițializare) unic per fișier, generat random și stocat împreună cu datele
// criptate — necesar pentru ca GCM să fie sigur (IV nu trebuie NICIODATĂ refolosit cu aceeași cheie)
//
// notă de arhitectură: aceasta e o versiune "server-managed key", nu zero-knowledge — cheia
// stă pe server (data/master.key), nu derivată din parola userului. E o decizie MVP explicită,
// documentată în riscuri: protejează împotriva unui disc furat, dar nu împotriva unui atacator
// care are acces complet la server. Zero-knowledge real (cheie derivată din parolă, per user)
// e planificat ca îmbunătățire, nu implementat în etapa 1.
public class AesEncryptionService implements EncryptionService {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_TAG_LENGTH_BITS = 128;
    private static final int IV_LENGTH_BYTES = 12;
    private static final String KEY_FILE_PATH = "data/master.key";

    private final SecretKey key;
    private final SecureRandom random = new SecureRandom();

    public AesEncryptionService() {
        this.key = loadOrGenerateKey();
    }

    @Override
    public byte[] encrypt(byte[] plainData) {
        try {
            byte[] iv = new byte[IV_LENGTH_BYTES];
            random.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv));

            byte[] cipherText = cipher.doFinal(plainData);

            // stocăm IV + ciphertext împreună — IV nu e secret, doar trebuie unic
            ByteBuffer buffer = ByteBuffer.allocate(iv.length + cipherText.length);
            buffer.put(iv);
            buffer.put(cipherText);
            return buffer.array();

        } catch (Exception e) {
            throw new RuntimeException("Eroare la criptarea fișierului: " + e.getMessage(), e);
        }
    }

    @Override
    public byte[] decrypt(byte[] encryptedData) {
        try {
            ByteBuffer buffer = ByteBuffer.wrap(encryptedData);
            byte[] iv = new byte[IV_LENGTH_BYTES];
            buffer.get(iv);
            byte[] cipherText = new byte[buffer.remaining()];
            buffer.get(cipherText);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv));

            return cipher.doFinal(cipherText);

        } catch (Exception e) {
            throw new RuntimeException("Eroare la decriptarea fișierului: " + e.getMessage(), e);
        }
    }

    private SecretKey loadOrGenerateKey() {
        try {
            Path keyPath = Path.of(KEY_FILE_PATH);

            if (Files.exists(keyPath)) {
                byte[] keyBytes = Base64.getDecoder().decode(Files.readString(keyPath).trim());
                return new SecretKeySpec(keyBytes, "AES");
            }

            KeyGenerator keyGen = KeyGenerator.getInstance("AES");
            keyGen.init(256);
            SecretKey newKey = keyGen.generateKey();

            Files.createDirectories(keyPath.getParent());
            Files.writeString(keyPath, Base64.getEncoder().encodeToString(newKey.getEncoded()));

            return newKey;

        } catch (IOException | NoSuchAlgorithmException e) {
            throw new RuntimeException("Eroare la inițializarea cheii de criptare: " + e.getMessage(), e);
        }
    }
}
