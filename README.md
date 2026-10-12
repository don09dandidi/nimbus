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

## 📋 Cazuri de Utilizare (Use Cases) & Starea Implementării

### 1. 🔐 Cont și Autentificare
* **Register Account:** Înregistrare utilizator cu parolă securizată prin hash **BCrypt**. *(Implementat)*
* **Log In / Log Out:** Autentificare bazată pe sesiuni reale gestionate prin cookie-uri sigure (`HttpOnly`, `Secure`, `SameSite=Strict`). *(Implementat)*
* **Log Out All Devices:** Mecanism de revocare globală a tuturor sesiunilor active ale utilizatorului. *(Implementat)*
* **2FA (Autentificare în doi pași):** Gestionare și verificare coduri 2FA. *(Interfață de tip mockup / Etapa următoare)*

### 2. 📁 Gestionarea Fișierelor și Securitate
* **Upload File ↔ Encrypt File:** Fișierele sunt interceptate la upload și criptate automat folosind **AES-256-GCM** înainte de a fi scrise fizic pe disc. *(Implementat)*
* **Download File ✕ Decrypt File:** La cerere, fișierele criptate sunt citite de pe disc, decriptate on-the-fly și livrate ca stream securizat către proprietar. *(Implementat)*
* **List / Sort / Filter Files:** Listarea din baza de date a fișierelor deținute de utilizatorul curent. *(Implementat)*
* **Delete File (Soft Delete):** Marcarea logică a fișierelor ca șterse. *(Implementat backend)* / **Restore File** *(Planificat)*

### 3. 🔗 Partajare (Sharing) — Model de Domeniu Extins
* **Create Share Link & Set Access Permissions:** Generare de linkuri unice de partajare cu permisiuni granulare (`READ`/`WRITE`) și protecție opțională prin parolă. *(Model de domeniu definit în backend / În curs de conectare UI)*
* **Access Shared File (Guest):** Accesul oaspeților la fișierele partajate fără a necesita un cont activ. *(Arhitectură pregătită)*

---

## 📁 Structura Proiectului

```text
├── backend/          # Cod sursă Java (Javalin, servicii de criptare, controlere)
├── frontend/         # Aplicație React / TypeScript (Interfață utilizator)
├── k8s/              # Manifeste Kubernetes (K3s) pentru deployment distribuit
├── Dockerfile        # Imagine unică multi-stage (Frontend + Backend)
├── DEPLOY.md         # Pași exacți pentru build și deploy pe cluster
└── README.md         # Documentația principală a proiectului
