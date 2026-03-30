import json

with open("c:/Users/sudanva/Desktop/Spice_garden/frontend/src/data/menu.json", "r") as f:
    data = json.load(f)

for item in data:
    name = item["name"]
    if name == "Butter Chicken":
        item["image_url"] = "/dishes/butter_chicken.png"
    elif name == "Paneer Tikka":
        item["image_url"] = "/dishes/paneer_tikka.png"
    elif name == "Chicken Biryani (5Pcs)":
        item["image_url"] = "/dishes/chicken_biryani.png"
    elif name == "Tandoori Chicken (Half)":
        item["image_url"] = "/dishes/tandoori_chicken.png"
    elif "Gobi" in name and "Manchurian" in name:
        item["image_url"] = "/dishes/gobi_manchurian.png"
    else:
        # Check if the dish is generic enough maybe
        item["image_url"] = ""

with open("c:/Users/sudanva/Desktop/Spice_garden/frontend/src/data/menu.json", "w") as f:
    json.dump(data, f, indent=2)
print("Updated menu images")
