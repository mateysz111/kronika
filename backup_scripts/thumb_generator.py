from PIL import Image, ImageOps
from pathlib import Path

input_dir = Path("img/big/50-lecie")
output_dir = Path("img/thumbs/50-lecie")

output_dir.mkdir(parents=True, exist_ok=True)

for image_path in input_dir.iterdir():

    if image_path.suffix.lower() not in [".jpg", ".jpeg", ".png", ".webp"]:
        continue

    img = Image.open(image_path)

    # auto orientacja EXIF
    img = ImageOps.exif_transpose(img)

    # resize
    img.thumbnail((400, 400))

    output_path = output_dir / f"{image_path.stem}.webp"

    img.save(
        output_path,
        "WEBP",
        quality=50,
        method=6
    )

    print("Done:", output_path)