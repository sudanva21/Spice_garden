import json

MENU_FILE = "c:/Users/sudanva/Desktop/Spice_garden/frontend/src/data/menu.json"

with open(MENU_FILE, "r") as f:
    data = json.load(f)

# The 6 hyper-realistic signature images we generated perfectly
keepers = [
    "/dishes/butter_chicken.png",
    "/dishes/paneer_tikka.png",
    "/dishes/chicken_biryani.png",
    "/dishes/tandoori_chicken.png",
    "/dishes/gobi_manchurian.png",
    "/dishes/fish_fry.png"
]

for item in data:
    url = item.get("image_url")
    if url:
        # If it's not one of our perfectly generated local images, strip it
        if url not in keepers:
            item.pop("image_url")
            
with open(MENU_FILE, "w") as f:
    json.dump(data, f, indent=2)

print("Reverted to glass UI for items without signature images.")
