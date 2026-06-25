# HTTPS with NGINX Ingress (Local Development)

This project uses **NGINX Ingress** with **mkcert** to enable HTTPS for local development.

## 1. Install mkcert

Install mkcert and create a local Certificate Authority (CA):

```bash
mkcert -install
```

Generate a certificate for your local domain:

```bash
mkcert mcp.local
```

This generates:

```
mcp.local.pem
mcp.local-key.pem
```

---

## 2. Create the Kubernetes TLS Secret

Delete the previous secret (optional):

```bash
kubectl delete secret mcp-local-tls -n marketing-app
```

Create a new TLS secret:

```bash
kubectl create secret tls mcp-local-tls \
  --cert=mcp.local.pem \
  --key=mcp.local-key.pem \
  -n marketing-app
```

---

## 3. Configure the Ingress

Add the TLS section to your Ingress:

```yaml
spec:
  tls:
    - hosts:
        - mcp.local
      secretName: mcp-local-tls

  rules:
    - host: mcp.local
      http:
        paths:
          # Your routes...
```

Apply the changes:

```bash
kubectl apply -f ingress.yml
```

Restart the NGINX Ingress Controller:

```bash
kubectl rollout restart deployment ingress-nginx-controller -n ingress-nginx
```

---

## 4. Trust the Certificate

### Linux

If `mkcert -install` is not enough, manually trust the CA:

```bash
sudo cp "$(mkcert -CAROOT)/rootCA.pem" \
/usr/local/share/ca-certificates/mkcert.crt

sudo update-ca-certificates
```

---

### Firefox

Open:

```
about:config
```

Search for:

```
security.enterprise_roots.enabled
```

Set it to:

```
true
```

Restart Firefox.

---

### Chrome

Chrome uses your operating system's trusted certificates.

After running:

```bash
mkcert -install
```

(and updating the system trust store if needed), restart Chrome.

---

## 5. Verify

Open:

```
https://mcp.local
```

Or test with:

```bash
curl https://mcp.local
```

If everything is configured correctly, the browser will trust the certificate and display a secure HTTPS connection.

> **Note:** This setup is intended for local development. For production deployments, use a real domain with Let's Encrypt and cert-manager.
