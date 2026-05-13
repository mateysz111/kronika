from PIL import Image
import os
import sys

input_dir = "img/50lat"
output_dir = "img/50lat_webp"
quality = 80

os.makedirs(output_dir, exist_ok=True)

# zbierz pliki
files_list = []

for root, _, files in os.walk(input_dir):
    for file in files:
        if file.lower().endswith((".jpg", ".jpeg", ".png")):
            files_list.append(os.path.join(root, file))

total = len(files_list)

if total == 0:
    print("Brak plików do konwersji.")
    sys.exit()

print(f"Znaleziono {total} plików\n")

# konwersja
for i, path in enumerate(files_list, start=1):

    try:
        img = Image.open(path)

        rel_path = os.path.splitext(os.path.basename(path))[0] + ".webp"
        save_path = os.path.join(output_dir, rel_path)

        img.save(save_path, "webp", quality=quality, method=6)

        percent = (i / total) * 100

        # PROGRESS LINE
        print(f"[{i}/{total}] {percent:.1f}% - {os.path.basename(path)}")

    except Exception as e:
        print(f"[ERROR] {path} -> {e}")

print("\nDONE ✔")