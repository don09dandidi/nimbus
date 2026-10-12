# ☁️ Nimbus (CloudEStorage)

> **Proiect PBL — Vectorul de Securitate a Datelor (FAF-242, UTM)**  
> Platformă cloud privată, securizată end-to-end la nivel de stocare, cu arhitectură distribuită pe un cluster Kubernetes (K3s), interconectată prin Mesh VPN și monitorizată prin SIEM.

---

## 🛠️ Stack Tehnologic

- **Backend:** Java (Javalin), SQLite, BCrypt (hashing parole), AES-256-GCM (criptare fișiere).
- **Frontend:** React, TypeScript, Vite.
- **DevOps & Infrastructură:** Docker (Multi-stage build), Kubernetes (K3s), Tailscale Mesh VPN, Wazuh SIEM, Filebeat.

---

## 🏗️ Arhitectura Sistemului și Infrastructură

Proiectul folosește o arhitectură distribuită pe mai multe noduri fizice/virtuale, conectate securizat:
- **HP EliteBook (Windows 10 + WSL2/Ubuntu):** Găzduiește control-plane-ul K3s, baza de date SQLite, volumul criptat pentru stocarea fișierelor și imaginea aplicației (`CloudEStorage.jar`).
- **Sony VAIO (Ubuntu Linux):** Funcționează ca nod worker K3s și găzduiește serverul **Wazuh SIEM** pentru colectarea și analiza logurilor de securitate.
- **Tailscale Mesh VPN:** Asigură tunelul privat overlay între nodurile din rețea.
- **Client Browser:** Rulează interfața React și comunică prin HTTPS cu backend-ul.

---

## 📋 Cazuri de Utilizare și Funcționalități (Use Cases)

### 1. 🖥️ Interacțiunea cu Aplicația & Gestionarea Contului
- **Register Account:** Crearea unui cont nou de utilizator în sistem cu hashing de parolă. *(Implementat)*
- **Log In / Log Out:** Autentificare în interfața web și închiderea sesiunii curente. *(Implementat)*
- **Log Out All Devices:** Revocarea globală a tuturor sesiunilor active din motive de securitate. *(Implementat)*
- **Navigare și Dashboard:** Accesarea panoului principal de control pentru gestionarea resurselor proprii. *(Implementat)*

### 2. 📁 Gestionarea Fișierelor (Interacțiune & CRUD)
- **Upload File:** Încărcarea fișierelor din browser direct în cloud-ul privat. *(Implementat)*
- **List / Sort / Filter Files:** Interacțiunea cu tabelul de fișiere din interfață — listare, sortare după criterii și filtrare rapidă. *(Implementat)*
- **Download File:** Descărcarea fișierelor stocate înapoi pe dispozitivul utilizatorului. *(Implementat)*
- **Delete / Restore File:** Ștergerea logică (*soft delete*) a fișierelor din interfață și opțiunea de restaurare. *(Implementat în backend / În curs de integrare UI)*

### 3. 🔒 Securitate Avansată și Criptare (Backend & End-to-End)
- **Password Hashing:** Securizarea parolelor utilizatorilor folosind algoritmul **BCrypt**. *(Implementat)*
- **Encryption / Decryption (AES-256-GCM):** Criptarea automată a fișierelor la upload și decriptarea on-the-fly la download. *(Implementat)*
- **Sesiuni Sigure:** Utilizarea cookie-urilor de sesiune cu flag-urile `HttpOnly`, `Secure` și `SameSite=Strict`. *(Implementat)*
- **2FA (Autentificare în doi pași):** Flux suplimentar de verificare a identității. *(Mockup UI / Etapa următoare)*

### 4. 🔗 Partajare Extinsă (Sharing)
- **Create Share Link & Set Permissions:** Generare de linkuri unice de partajare cu permisiuni granulare (`READ`/`WRITE`) și parolă opțională. *(Model definit în backend)*
- **Access Shared File (Guest):** Permiterea oaspeților să acceseze fișiere partajate fără a deține un cont. *(Arhitectură pregătită)*

---

## 📁 Structura Proiectului

```text
├── backend/          # Cod sursă Java (Javalin, servicii de criptare, controlere)
├── frontend/         # Aplicație React / TypeScript (Interfață utilizator)
├── k8s/              # Manifeste Kubernetes (K3s) pentru deployment distribuit
├── Dockerfile        # Imagine unică multi-stage (Frontend + Backend)
├── DEPLOY.md         # Pași exacți pentru build și deploy pe cluster
└── README.md         # Documentația principală a proiectului
