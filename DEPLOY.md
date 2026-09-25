# Deploy pe clusterul K3s (HP EliteBook + Sony VAIO)

## 0. Verifică local întâi (înainte de Docker/K8s)

```bash
cd backend
mvn compile exec:java -Dexec.mainClass="com.cloudestorage.Main"
```

Testează manual (register, login, upload, download) cu `curl` sau din frontend (`npm run dev` în `frontend/`, cu `VITE_API_URL=http://localhost:7070` într-un fișier `.env`).

Abia după ce asta merge local, treci la pașii de mai jos.

## 1. Build imagine Docker

Pe HP EliteBook, în WSL2 (Ubuntu) — ai nevoie de Docker instalat acolo (dacă nu-l ai deja):

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# apoi închide și redeschide terminalul WSL, ca grupul nou să se aplice
```

Din rădăcina proiectului (unde e `Dockerfile`):

```bash
docker build -t cloudestorage:latest .
```

## 2. Importă imaginea în containerd-ul K3s (fără registry)

K3s nu vede automat imaginile din Docker local — trebuie importată explicit în containerd-ul lui:

```bash
docker save cloudestorage:latest -o cloudestorage.tar
sudo k3s ctr images import cloudestorage.tar
```

Verifică:
```bash
sudo k3s ctr images list | grep cloudestorage
```

## 3. Aplică manifestele Kubernetes

```bash
sudo k3s kubectl apply -f k8s/00-namespace.yaml
sudo k3s kubectl apply -f k8s/01-pvc.yaml
sudo k3s kubectl apply -f k8s/02-configmap.yaml
sudo k3s kubectl apply -f k8s/03-deployment.yaml
sudo k3s kubectl apply -f k8s/04-service.yaml
```

Verifică starea:
```bash
sudo k3s kubectl get pods -n cloudestorage
sudo k3s kubectl logs -n cloudestorage -l app=cloudestorage --follow
```

Dacă pod-ul rămâne `Pending`, verifică dacă PVC-ul s-a legat:
```bash
sudo k3s kubectl get pvc -n cloudestorage
```

## 4. Accesează aplicația

Din orice device din Tailnet-ul tău:
```
http://<IP_TAILSCALE_HP_ELITEBOOK>:30070
```

(IP-ul Tailscale al HP EliteBook, cel folosit deja la join-ul clusterului — `tailscale ip -4` din PowerShell)

## 5. Dacă schimbi codul și vrei să redeploy-ezi

```bash
docker build -t cloudestorage:latest .
docker save cloudestorage:latest -o cloudestorage.tar
sudo k3s ctr images import cloudestorage.tar
sudo k3s kubectl rollout restart deployment/cloudestorage -n cloudestorage
```

## Notă despre nodul pe care rulează

Pod-ul va fi programat pe orice nod are `local-path` PVC-ul creat (de obicei nodul pe care rulează comanda `kubectl apply` prima dată, cu K3s implicit). Dacă vrei explicit pe HP EliteBook (mai multă RAM decât Sony VAIO), poți adăuga în `03-deployment.yaml`, sub `spec.template.spec`:

```yaml
nodeSelector:
  kubernetes.io/hostname: desktop-029m8cn
```
