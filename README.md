# CloudEStorage — aplicație completă (MVP), gata de build & deploy

## Ce conține arhiva

```
backend/    — Java (Javalin), tot ce ai avut + sesiuni, criptare AES, upload/download fișiere
frontend/   — React (din UserDashboard), Login/Register/MyFiles conectate la backend-ul real
Dockerfile  — imagine unică (frontend + backend), multi-stage
k8s/        — manifeste pentru clusterul tău K3s (HP EliteBook + Sony VAIO)
DEPLOY.md   — pași exacți de build și deploy pe clusterul tău
```

## ATENȚIE — o limitare pe care trebuie s-o știi înainte să predai

Codul a fost scris integral aici, dar **nu am putut compila efectiv proiectul Java în acest mediu** — sandboxul în care lucrez nu are acces la Maven Central (repo-ul de unde se descarcă dependințele), deci n-am putut rula `mvn compile` ca să confirm 100% că totul e sintactic perfect.

Am scris codul cu atenție, verificat manual linie cu linie, și am evitat deliberat orice parte din API-ul Javalin de care nu eram sigur (ex. am înlocuit o clasă `Cookie` cu risc de API incert cu setare directă de header HTTP, garantat corectă). Dar **primul test real e la tine, când rulezi `mvn compile`.**

**Dacă apare vreo eroare de compilare**, trimite-mi mesajul exact de eroare — o reparăm în câteva minute, e mult mai rapid decât să pretind că e "gata" fără să fi verificat.

## Ce funcționează (MVP real, nu mockup)

- Register, login, cu sesiune reală (cookie HttpOnly/Secure/SameSite=Strict)
- Logout, logout-all-devices (revocare sesiuni)
- Upload fișier → criptat AES-256-GCM → scris pe disc
- Listare fișiere proprii (din DB reală)
- Download fișier → decriptat automat
- Ștergere fișier (soft delete)
- Frontend (Login, Register, My Files) conectat la aceste endpoint-uri reale, nu la date mock

## Ce rămâne mockup / neconectat (transparent, nu ascuns)

- Foldere, versionare, comentarii, partajare (ShareLink) — modelul de date există în backend, dar fără endpoint-uri/UI conectate încă (etapa 2-3 din plan)
- 2FA — nu implementat (etapa 2 din plan; pagina UI există ca mockup)
- Butoanele de download/delete din interiorul tabelului de fișiere (meniul per-rând din `FileTable`) — nu le-am conectat încă, doar upload + listare + endpoint-urile din spate există
- Criptarea e cu cheie server-side (`data/master.key`), nu zero-knowledge — decizie MVP documentată deja în riscurile proiectului

## Recomandare sinceră

Nu duce asta direct la prezentare fără să rulezi tu întâi `mvn compile` și fără să testezi manual fluxul (register → login → upload → download) local, exact cum ai făcut și până acum. Dacă ceva nu merge, vreau să știu exact ce, ca să reparăm punctual — nu să presupunem că totul e perfect doar pentru că arată complet.
