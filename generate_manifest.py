import os
import json

BASE_DIR = "img"
OUTPUT_FILE = "data/manifest.json"

IMAGE_EXT = (".jpg", ".jpeg", ".png", ".webp")

manifest = {}

def natural_sort_key(s):
    # sort 1,2,10 poprawnie
    import re
    return [int(t) if t.isdigit() else t.lower()
            for t in re.split(r"(\d+)", s)]

for folder in os.listdir(BASE_DIR):
    folder_path = os.path.join(BASE_DIR, folder)

    if not os.path.isdir(folder_path):
        continue

    files = [
        f for f in os.listdir(folder_path)
        if f.lower().endswith(IMAGE_EXT)
    ]

    files.sort(key=natural_sort_key)

    manifest[folder] = [
        f"{BASE_DIR}/{folder}/{file}"
        for file in files
    ]

os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=2, ensure_ascii=False)

print("OK - wygenerowano manifest")
print(json.dumps(manifest, indent=2))