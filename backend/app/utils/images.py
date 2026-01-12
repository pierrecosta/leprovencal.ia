from __future__ import annotations

from dataclasses import dataclass


MAX_IMAGE_BYTES = 2 * 1024 * 1024  # 2 MiB (≈ 2 Mo)


@dataclass(frozen=True)
class ImageInfo:
    mime: str


def detect_image_mime(data: bytes) -> str | None:
    """Best-effort MIME detection for common web image formats.

    We intentionally keep this dependency-free.
    """
    if not data:
        return None

    # PNG
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"

    # JPEG
    if len(data) >= 3 and data[0:3] == b"\xff\xd8\xff":
        return "image/jpeg"

    # GIF
    if data.startswith(b"GIF87a") or data.startswith(b"GIF89a"):
        return "image/gif"

    # WEBP (RIFF....WEBP)
    if len(data) >= 12 and data[0:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "image/webp"

    return None


def validate_image_upload(*, data: bytes, declared_mime: str | None) -> ImageInfo:
    if not data:
        raise ValueError("Fichier image vide")

    if len(data) > MAX_IMAGE_BYTES:
        raise ValueError("Image trop lourde (max 2Mo)")

    detected = detect_image_mime(data)
    if not detected:
        raise ValueError("Format d'image non supporté (png, jpeg, gif, webp)")

    # If a declared mime exists, ensure it is consistent-ish.
    if declared_mime and declared_mime.startswith("image/") and declared_mime != detected:
        # Some browsers may send image/jpg vs image/jpeg; normalize by treating them as equivalent.
        if not (declared_mime == "image/jpg" and detected == "image/jpeg"):
            raise ValueError("Type MIME de l'image invalide")

    return ImageInfo(mime=detected)
