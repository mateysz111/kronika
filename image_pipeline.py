from PIL import Image, ImageOps
from pathlib import Path
import os
import re

# =========================
# CONFIG
# =========================

input_folder = Path("img/source")

output_big = Path("img/big")
output_thumb = Path("img/thumb")

prefix = "kronika"
SET_NAME = "kronika"

ENABLE_ROTATION = True
ROTATION_ANGLE = -90

MEDIUM_SIZE = (1600, 1600)
THUMB_SIZE = (400, 400)

QUALITY_BIG = 80
QUALITY_THUMB = 50

VALID_EXT = (".jpg", ".jpeg", ".png", ".webp")


# =========================
# OUTPUT STRUCTURE
# =========================

big_set_dir = output_big / SET_NAME
thumb_set_dir = output_thumb / SET_NAME

big_set_dir.mkdir(parents=True, exist_ok=True)
thumb_set_dir.mkdir(parents=True, exist_ok=True)

# =========================
# NATURAL SORT
# =========================
def natural_key(s):
    return [int(t) if t.isdigit() else t.lower()
            for t in re.split(r"(\d+)", s)]


files = sorted(os.listdir(input_folder), key=natural_key)

counter = 1

total = len([f for f in files if f.lower().endswith(VALID_EXT)])

print(f"Find {total} files\n")


# =========================
# PROCESSING
# =========================
for filename in files:

    if not filename.lower().endswith(VALID_EXT):
        continue

    input_path = input_folder / filename
    name = f"{prefix}_{counter}.webp"

    try:
        with Image.open(input_path) as img:

            # EXIF FIX
            img = ImageOps.exif_transpose(img)

            # ROTATION (OPTIONAL)
            if ENABLE_ROTATION:
                img = img.rotate(ROTATION_ANGLE, expand=True)

            # ================= BIG (ORIGINAL) =================
            big_path = big_set_dir / name
            img.save(big_path, "WEBP", quality=QUALITY_BIG, method=6)

            # ================= THUMB =================
            thumb = img.copy()
            thumb.thumbnail(THUMB_SIZE)

            thumb_path = thumb_set_dir / name
            thumb.save(
                thumb_path,
                "WEBP",
                quality=QUALITY_THUMB,
                method=6
            )

        print(f"[{counter}] {filename} -> {name}")
        counter += 1

    except Exception as e:
        print("Błąd:", filename, e)

print("\nDONE ✔")
