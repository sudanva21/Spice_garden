import json
import re
import urllib.request
import os
import time
from duckduckgo_search import DDGS

MENU_FILE = "c:/Users/sudanva/Desktop/Spice_garden/frontend/src/data/menu.json"
DISHES_DIR = "c:/Users/sudanva/Desktop/Spice_garden/frontend/public/dishes"
os.makedirs(DISHES_DIR, exist_ok=True)

with open(MENU_FILE, "r") as f:
    data = json.load(f)

# Optional: keep some original generated ones
keepers = ["butter_chicken.png", "paneer_tikka.png", "chicken_biryani.png", "tandoori_chicken.png", "gobi_manchurian.png", "fish_fry.png"]
keeper_mapping = {
    "Butter Chicken": "butter_chicken.png",
    "Paneer Tikka": "paneer_tikka.png",
    "Chicken Biryani (5Pcs)": "chicken_biryani.png",
    "Tandoori Chicken (Half)": "tandoori_chicken.png",
    "Gobi Manchurian / Chilly": "gobi_manchurian.png",
    "Bangada Rawa Fry/Tawa Fry": "fish_fry.png"
}

ddgs = DDGS()

for i, item in enumerate(data):
    name = item["name"]
    # Check if this item gets a keeper generated image
    if name in keeper_mapping:
        item["image_url"] = "/dishes/" + keeper_mapping[name]
        continue
        
    safe_name = re.sub(r'[^a-zA-Z0-9_\-]', '_', name).lower()
    img_filename = f"{safe_name}.jpg"
    img_path = os.path.join(DISHES_DIR, img_filename)
    
    # Check if we already downloaded it (skip)
    if os.path.exists(img_path):
        item["image_url"] = f"/dishes/{img_filename}"
        continue
        
    # Search DDG
    query = f"{name} Indian dish restaurant high quality"
    if "Chinese" in item["category"] or "Noodles" in name:
        query = f"{name} Indo Chinese restaurant dish high resolution"
    elif "Soup" in item["category"]:
        query = f"{name} Indian restaurant high resolution"
        
    print(f"Searching for {name}...")
    try:
        results = ddgs.images(query, max_results=3, size='Medium')
        urls = [r['image'] for r in results] if results else []
        success = False
        
        # Add basic headers since Wikipedia and some sites block simple urllib
        req_headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        for url in urls:
            try:
                print(f"  Trying {url}...")
                # Download
                req = urllib.request.Request(url, headers=req_headers)
                with urllib.request.urlopen(req, timeout=5) as response, open(img_path, 'wb') as out_file:
                    out_file.write(response.read())
                
                # Check if it's actually an image
                if os.path.getsize(img_path) > 5000:
                    success = True
                    item["image_url"] = f"/dishes/{img_filename}"
                    print(f"  Success: {name}")
                    break
            except Exception as e:
                print(f"  Failed: {e}")
                pass
                
        if not success:
            print(f"  Could not find/download image for {name}")
    except Exception as e:
        print(f"Failed search for {name}: {e}")
        
    # Rate limiting
    time.sleep(1)

with open(MENU_FILE, "w") as f:
    json.dump(data, f, indent=2)
print("Finished downloading images and updating menu.")
