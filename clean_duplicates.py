import json

MENU_FILE = "c:/Users/sudanva/Desktop/Spice_garden/frontend/src/data/menu.json"

with open(MENU_FILE, "r") as f:
    data = json.load(f)

# Count image occurrences
img_counts = {}
for item in data:
    url = item.get("image_url")
    if url:
        img_counts[url] = img_counts.get(url, 0) + 1

# If duplicate, strip it
for item in data:
    url = item.get("image_url")
    if url and img_counts[url] > 1:
        # We only want strictly unique images. But wait, if we remove all duplicates, we lose the image entirely!
        # Let's keep the image for the first item that used it, and remove for the rest.
        pass

# Actually, better logic: keep the image for the main signature dish it was meant for.
signature_mapping = {
    "/dishes/butter_chicken.png": "Butter Chicken",
    "/dishes/paneer_tikka.png": "Paneer Tikka",
    "/dishes/chicken_biryani.png": "Chicken Biryani (5Pcs)",
    "/dishes/tandoori_chicken.png": "Tandoori Chicken (Half)",
    "/dishes/gobi_manchurian.png": "Gobi Manchurian / Chilly",
    "/dishes/fish_fry.png": "Bangada Rawa Fry/Tawa Fry"
}

for item in data:
    url = item.get("image_url")
    if url:
        # If it's a signature image but not the signature dish, remove it so it doesn't repeat!
        if url in signature_mapping and item["name"] != signature_mapping[url]:
            item.pop("image_url")
            
with open(MENU_FILE, "w") as f:
    json.dump(data, f, indent=2)

print("Duplicates removed.")
