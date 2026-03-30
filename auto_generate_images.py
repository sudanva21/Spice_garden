import json
import urllib.request
import urllib.parse
import os
import re
import time

MENU_FILE = "c:/Users/sudanva/Desktop/Spice_garden/frontend/src/data/menu.json"
DISHES_DIR = "c:/Users/sudanva/Desktop/Spice_garden/frontend/public/dishes"
os.makedirs(DISHES_DIR, exist_ok=True)

with open(MENU_FILE, "r") as f:
    data = json.load(f)

# The 6 hyper-realistic signature images we generated perfectly
keepers = {
    "Butter Chicken": "/dishes/butter_chicken.png",
    "Paneer Tikka": "/dishes/paneer_tikka.png",
    "Chicken Biryani (5Pcs)": "/dishes/chicken_biryani.png",
    "Tandoori Chicken (Half)": "/dishes/tandoori_chicken.png",
    "Gobi Manchurian / Chilly": "/dishes/gobi_manchurian.png",
    "Bangada Rawa Fry/Tawa Fry": "/dishes/fish_fry.png"
}

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

count = 0
for item in data:
    name = item["name"]
    category = item["category"]
    
    if name in keepers:
        item["image_url"] = keepers[name]
        continue
        
    safe_name = re.sub(r'[^a-zA-Z0-9_\-]', '_', name).lower()
    img_filename = f"{safe_name}.jpg"
    img_path = os.path.join(DISHES_DIR, img_filename)
    
    item["image_url"] = f"/dishes/{img_filename}"
    
    # Skip if already generated successfully
    if os.path.exists(img_path) and os.path.getsize(img_path) > 10000:
        continue
        
    # Build a powerful AI prompt
    style = "Professional food photography, highly detailed, photorealistic, 4k resolution, cinematic lighting, shallow depth of field, elegant dark restaurant background. No text, no letters."
    
    if "Soups" in category:
        base = f"A beautiful steaming bowl of Indian {name}, garnished perfectly, resting on an elegant dark dining table."
    elif "Starters" in category or "Chinese" in category:
        base = f"A delicious plate of {name}, an appetizer, beautifully garnished with fresh herbs and spices, served on a premium ceramic plate."
    elif "Breads" in category:
        base = f"Freshly baked, hot {name}, brushed with butter or garlic, served in a traditional copper or ceramic bread basket."
    elif "Biryani" in category:
        base = f"A royal serving of authentic Indian {name}, layered with aromatic basmati rice and rich spices, served in a traditional handi or copper vessel."
    elif "Desserts" in category:
        base = f"A mouth-watering premium Indian dessert, {name}, beautifully presented on an elegant dessert plate with elegant garnishes."
    elif "Non-Veg" in category or "Veg Main" in category:
        base = f"A rich, aromatic bowl of authentic Indian {name} curry, garnished with fresh cilantro and a swirl of cream, served in a traditional copper kadai."
    else:
        base = f"A stunning, appetizing plate of authentic Indian {name}, beautifully presented in a high-end restaurant setting."
        
    prompt = f"{base} {style}"
    encoded_prompt = urllib.parse.quote(prompt)
    url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=600&height=400&nologo=true&seed={count}"
    
    print(f"Generating image for {name} using external AI API...")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=30) as response, open(img_path, 'wb') as out_file:
            out_file.write(response.read())
        print(f"  Success: {name}")
    except Exception as e:
        print(f"  Failed for {name}: {e}")
        # fallback to empty if it fails completely
        item.pop("image_url", None)
        
    count += 1
    with open(MENU_FILE, "w") as f:
        json.dump(data, f, indent=2)
        
    time.sleep(1)

print("Finished generating all images using unlimited external AI API!")
