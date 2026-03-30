import json

MENU_FILE = "c:/Users/sudanva/Desktop/Spice_garden/frontend/src/data/menu.json"

with open(MENU_FILE, "r") as f:
    data = json.load(f)

signature_mapping = {
    "Butter Chicken": "/dishes/butter_chicken.png",
    "Paneer Tikka": "/dishes/paneer_tikka.png",
    "Chicken Biryani (5Pcs)": "/dishes/chicken_biryani.png",
    "Tandoori Chicken (Half)": "/dishes/tandoori_chicken.png",
    "Gobi Manchurian / Chilly": "/dishes/gobi_manchurian.png",
    "Bangada Rawa Fry/Tawa Fry": "/dishes/fish_fry.png"
}

index = 100
for i, item in enumerate(data):
    name = item["name"]
    # Provide the generated hyper-realistic signature images
    if name in signature_mapping:
        item["image_url"] = signature_mapping[name]
        continue
        
    # Build generic category
    cat = item["category"]
    keywords = "indian,food,"
    if "Soups" in cat: keywords += "soup"
    elif "Starters" in cat: keywords += "appetizer"
    elif "Chinese" in cat: keywords += "chinese"
    elif "Breads" in cat: keywords += "naan"
    elif "Biryani" in cat: keywords += "biryani"
    elif "Desserts" in cat: keywords += "dessert"
    elif "Non-Veg" in cat: keywords += "meat"
    else: keywords += "curry"
    
    # Guarantee 100% strict uniqueness using the index as a seed
    item["image_url"] = f"https://loremflickr.com/500/350/{keywords}?lock={index}"
    index += 1

with open(MENU_FILE, "w") as f:
    json.dump(data, f, indent=2)

print("Updated menu.json with fully diverse, non-repeating image URLs.")
