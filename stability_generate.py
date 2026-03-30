import json
import requests
import os
import re
import time
import base64

MENU_FILE = "c:/Users/sudanva/Desktop/Spice_garden/frontend/src/data/menu.json"
DISHES_DIR = "c:/Users/sudanva/Desktop/Spice_garden/frontend/public/dishes"
API_KEY = "sk-ROWoXHEOJxKa8rrXoaMs1ESagVy9RymJ7wEgMdE738HETjzl"
URL = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image"

os.makedirs(DISHES_DIR, exist_ok=True)

with open(MENU_FILE, "r") as f:
    data = json.load(f)

keepers = {
    "Butter Chicken": "/dishes/butter_chicken.png",
    "Paneer Tikka": "/dishes/paneer_tikka.png",
    "Chicken Biryani (5Pcs)": "/dishes/chicken_biryani.png",
    "Tandoori Chicken (Half)": "/dishes/tandoori_chicken.png",
    "Gobi Manchurian / Chilly": "/dishes/gobi_manchurian.png",
    "Bangada Rawa Fry/Tawa Fry": "/dishes/fish_fry.png"
}

headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": f"Bearer {API_KEY}",
    "User-Agent": "SpiceGarden/1.0"
}

print("Resuming generation pipeline with Stability AI API (SDXL 1024)...")
for i, item in enumerate(data):
    name = item["name"]
    category = item["category"]
    
    if name in keepers:
        item["image_url"] = keepers[name]
        continue
        
    safe_name = re.sub(r'[^a-zA-Z0-9_\-]', '_', name).lower()
    img_filename = f"{safe_name}.jpg"
    img_path = os.path.join(DISHES_DIR, img_filename)
    
    item["image_url"] = f"/dishes/{img_filename}"
    
    # If it's already generated via SDXL, skip completely
    if os.path.exists(img_path) and os.path.getsize(img_path) > 10000:
        continue
        
    style = "Professional food photography, highly detailed, photorealistic, cinematic lighting, shallow depth of field, high-end restaurant plating."
    
    if "Soups" in category:
        base_prompt = f"A steaming bowl of Indian {name}, garnished perfectly, resting on an dark dining table."
    elif "Starters" in category or "Chinese" in category:
        base_prompt = f"A delicious plate of {name}, an appetizer, beautifully garnished with fresh herbs and spices, served on a premium plate."
    elif "Breads" in category:
        base_prompt = f"Freshly baked, hot {name}, brushed with butter or garlic, served in a traditional basket."
    elif "Biryani" in category:
        base_prompt = f"A royal serving of authentic Indian {name}, layered with aromatic basmati rice and rich spices."
    elif "Desserts" in category:
        base_prompt = f"A mouth-watering premium Indian dessert, {name}, beautifully presented on an elegant dessert plate."
    else:
        base_prompt = f"A stunning, appetizing plate of authentic Indian {name}, beautifully presented."
        
    prompt = f"{base_prompt} {style}"
    
    body = {
        "text_prompts": [{"text": prompt, "weight": 1}],
        "cfg_scale": 7,
        "height": 1024,
        "width": 1024,
        "samples": 1,
        "steps": 30,
        "style_preset": "photographic"
    }

    print(f"[{i}/{len(data)}] Generating SDXL image for {name}...")
    try:
        response = requests.post(URL, headers=headers, json=body, timeout=60)
        if response.status_code == 200:
            res_data = response.json()
            for index, image in enumerate(res_data.get("artifacts", [])):
                if image["finishReason"] == "SUCCESS":
                    with open(img_path, "wb") as f_img:
                        f_img.write(base64.b64decode(image["base64"]))
                    print(f"  Success: {img_filename}")
                else:
                    print(f"  Filter blocked/Error: {image['finishReason']}")
        else:
            print(f"  Failed for {name}: {response.status_code} - {response.text}")
            item.pop("image_url", None)
            
    except Exception as e:
        print(f"  Exception for {name}: {e}")
        item.pop("image_url", None)
        
    # Write json constantly so next reload has it
    with open(MENU_FILE, "w") as f:
        json.dump(data, f, indent=2)
        
    # Respect rate limits
    time.sleep(2)

print("\n--- DONE GENERATING SDXL IMAGES ---")
