import json

with open("c:/Users/sudanva/Desktop/Spice_garden/frontend/src/data/menu.json", "r") as f:
    data = json.load(f)

for item in data:
    name = item["name"]
    # Re-use existing images based on keywords
    if item.get("image_url"):
        continue
    
    # Assign existing images fallback
    if "Bangada" in name or "Surmai" in name or "Fish" in name:
        item["image_url"] = "/dishes/fish_fry.png"
    elif "Paneer" in name and not "Biryani" in name:
        item["image_url"] = "/dishes/paneer_tikka.png"
    elif "Tandoori Chicken" in name:
        item["image_url"] = "/dishes/tandoori_chicken.png"
    elif "Chicken" in name and "Biryani" not in name and "Soup" not in name:
        item["image_url"] = "/dishes/butter_chicken.png"
    elif "Biryani" in name:
        item["image_url"] = "/dishes/chicken_biryani.png"
    elif "Gobi" in name or "Manchurian" in name:
        item["image_url"] = "/dishes/gobi_manchurian.png"
        
with open("c:/Users/sudanva/Desktop/Spice_garden/frontend/src/data/menu.json", "w") as f:
    json.dump(data, f, indent=2)

print("Updated fallback images")
