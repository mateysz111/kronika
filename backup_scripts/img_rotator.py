from PIL import Image
import os
import re

input_folder = ""
output_folder = ""

prefix = "kronika"

os.makedirs(output_folder, exist_ok=True)

valid_extensions = (".jpg", ".jpeg", ".png", ".webp", ".bmp")

# naturalne sortowanie (żeby 2 < 10 < 100)
def natural_key(text):
    return [int(t) if t.isdigit() else t.lower()
            for t in re.split(r'(\d+)', text)]

files = sorted(os.listdir(input_folder), key=natural_key)

counter = 1

for filename in files:
    if not filename.lower().endswith(valid_extensions):
        continue

    input_path = os.path.join(input_folder, filename)

    name, ext = os.path.splitext(filename)

    new_name = f"{prefix}_{counter}{ext}"
    output_path = os.path.join(output_folder, new_name)

    try:
        with Image.open(input_path) as img:
            rotated = img.rotate(-90, expand=True)  # 90° w prawo
            rotated.save(output_path)

        print(f"{filename} -> {new_name}")
        counter += 1

    except Exception as e:
        print("Błąd:", filename, e)