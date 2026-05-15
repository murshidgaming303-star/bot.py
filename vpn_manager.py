import base64
import random
import io

try:
    from cryptography.hazmat.primitives.asymmetric.x25519 import X25519PrivateKey
    _HAS_CRYPTO = True
except ImportError:
    _HAS_CRYPTO = False


def generate_keypair():
    if _HAS_CRYPTO:
        priv = X25519PrivateKey.generate()
        priv_bytes = priv.private_bytes_raw()
        pub_bytes  = priv.public_key().public_bytes_raw()
        return (
            base64.b64encode(priv_bytes).decode(),
            base64.b64encode(pub_bytes).decode(),
        )
    # Fallback: random 32 bytes (for demo only — not a real WireGuard key)
    priv_bytes = bytes(random.randint(0, 255) for _ in range(32))
    pub_bytes  = bytes(random.randint(0, 255) for _ in range(32))
    return (
        base64.b64encode(priv_bytes).decode(),
        base64.b64encode(pub_bytes).decode(),
    )


def generate_client_ip():
    return f"10.8.{random.randint(2, 254)}.{random.randint(2, 254)}/32"


def build_wireguard_config(private_key, server_public_key, client_ip, endpoint, dns):
    return (
        f"[Interface]\n"
        f"PrivateKey = {private_key}\n"
        f"Address = {client_ip}\n"
        f"DNS = {dns}\n\n"
        f"[Peer]\n"
        f"PublicKey = {server_public_key}\n"
        f"Endpoint = {endpoint}\n"
        f"AllowedIPs = 0.0.0.0/0, ::/0\n"
        f"PersistentKeepalive = 25\n"
    )


def config_to_qr_bytes(config_text):
    try:
        import qrcode
        from PIL import Image

        qr = qrcode.QRCode(
            version=None,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=8,
            border=4,
        )
        qr.add_data(config_text)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        buf = io.BytesIO()
        img.save(buf, format='PNG')
        buf.seek(0)
        buf.name = "vpn_qr.png"
        return buf
    except Exception:
        return None
