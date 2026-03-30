import json
import re
import urllib.request
import urllib.parse
import os
import time

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

images_used = set(keepers)

for i, item in enumerate(data):
    name = item["name"]
    # Check if this item gets a keeper generated image
    if name in keeper_mapping:
        item["image_url"] = "/dishes/" + keeper_mapping[name]
        continue
        
    safe_name = re.sub(r'[^a-zA-Z0-9_\-]', '_', name).lower()
    img_filename = f"{safe_name}.jpg"
    img_path = os.path.join(DISHES_DIR, img_filename)
    
    # Check if we already successfully downloaded it (skip)
    if os.path.exists(img_path) and os.path.getsize(img_path) > 5000:
        item["image_url"] = f"/dishes/{img_filename}"
        continue
        
    # Search Wikimedia Commons
    category_hint = item["category"]
    search_term = name.split('/')[0].split('-')[0].strip() # simplify names like 'Gobi Manchurian / Chilly' -> 'Gobi Manchurian'
    query = f"{search_term} food"
    
    print(f"Searching Wikipedia for {search_term}...")
    try:
        url = f"https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&generator=search&gsrsearch={urllib.parse.quote(query)}&pithumbsize=600"
        req = urllib.request.Request(url, headers={'User-Agent': 'SpiceApp/1.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            res_data = json.loads(response.read().decode())
            
        success = False
        pages = res_data.get('query', {}).get('pages', {})
        for page_id, page_info in pages.items():
            if 'thumbnail' in page_info:
                img_url = page_info['thumbnail']['source']
                
                # prevent same image mapping to different things
                if img_url in images_used:
                    continue
                
                print(f"  Downloading {img_url}...")
                req_img = urllib.request.Request(img_url, headers={'User-Agent': 'SpiceApp/1.0'})
                with urllib.request.urlopen(req_img, timeout=10) as img_res, open(img_path, 'wb') as out_file:
                    out_file.write(img_res.read())
                    
                if os.path.getsize(img_path) > 5000:
                    success = True
                    item["image_url"] = f"/dishes/{img_filename}"
                    images_used.add(img_url)
                    images_used.add(img_filename)
                    print(f"  Success: {name}")
                    break
                    
        if not success:
            print(f"  Could not find/download image for {name}. Applying generic food image placeholder.")
            # Unsplash generic placeholder trick: redirect to a random food image (though unsplash source is down, we use random text placeholder or clear it)
            # To strictly NOT repeat, we can clear the image so the beautiful text layout takes over, or put a unique placeholder.
            # I will clear it so the glass card text UI shines instead of repeating an image.
            item.pop("image_url", None)
            
    except Exception as e:
        print(f"Failed search for {name}: {e}")
        item.pop("image_url", None)
        
    # Rate limiting 
    time.sleep(0.5)

with open(MENU_FILE, "w") as f:
    json.dump(data, f, indent=2)
print("Finished downloading images from Wikipedia and updating menu.")
