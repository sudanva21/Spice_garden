import json
import requests
import os
import re
import time
import base64

MENU_FILE = "c:/Users/sudanva/Desktop/Spice_garden/frontend/src/data/menu.json"
DISHES_DIR = "c:/Users/sudanva/Desktop/Spice_garden/frontend/public/dishes"
API_KEY = "sk-VFUNuGtielkvB11fgnXoWDAEA59oYQp4z05JNL2V2fCMQGsF"
URL = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image"

os.makedirs(DISHES_DIR, exist_ok=True)

with open(MENU_FILE, "r") as f:
    data = json.load(f)

headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": f"Bearer {API_KEY}",
    "User-Agent": "SpiceGarden/1.0"
}

print(f"Starting SDXL generation from index 210 for missing menu items...")

generated_count = 0
failed_count = 0

for i, item in enumerate(data):
    if i < 210:
        continue
        
    if item.get("image_url"):
        continue  # Already has an image mapped!
        
    name = item["name"]
    category = item["category"]
    
    safe_name = re.sub(r'[^a-zA-Z0-9_\-]', '_', name).lower()
    img_filename = f"{safe_name}.jpg"
    img_path = os.path.join(DISHES_DIR, img_filename)
    
    if os.path.exists(img_path) and os.path.getsize(img_path) > 10000:
        item["image_url"] = f"/dishes/{img_filename}"
        with open(MENU_FILE, "w") as f:
            json.dump(data, f, indent=2)
        continue
        
    style = "Professional food photography, highly detailed, photorealistic, cinematic lighting, shallow depth of field, high-end restaurant plating."
    
    if "Soups" in category:
        base_prompt = f"A steaming bowl of Indian {name}, garnished perfectly, resting on an dark dining table."
    elif "Starters" in category or "Chinese" in category:
        base_prompt = f"A delicious plate of {name}, an appetizer, beautifully garnished with fresh herbs and spices, served on a premium plate."
    elif "Breads" in category:
        base_prompt = f"Freshly baked, hot {name}, brushed with butter or garlic, served in a traditional basket."
    elif "Biryani" in category or "Rice" in category:
        base_prompt = f"A royal serving of authentic Indian {name}, layered with aromatic basmati rice and rich spices."
    elif "Desserts" in category:
        base_prompt = f"A mouth-watering premium Indian dessert, {name}, beautifully presented on an elegant dessert plate."
    elif "Beverages" in category or "Milk Shakes" in category:
        base_prompt = f"A refreshing, cold glass of {name}, perfectly presented with condensation on the glass."
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

    print(f"[{i}/{len(data)}] Generating SDXL for missing item: {name}...")
    try:
        response = requests.post(URL, headers=headers, json=body, timeout=60)
        if response.status_code == 200:
            res_data = response.json()
            for index, image in enumerate(res_data.get("artifacts", [])):
                if image["finishReason"] == "SUCCESS":
                    with open(img_path, "wb") as f_img:
                        f_img.write(base64.b64decode(image["base64"]))
                    item["image_url"] = f"/dishes/{img_filename}"
                    print(f"  Success: {img_filename}")
                    generated_count += 1
                else:
                    print(f"  Filter blocked/Error: {image['finishReason']}")
        else:
            print(f"  Failed for {name}: {response.status_code} - {response.text}")
            failed_count += 1
            if response.status_code == 429 or response.status_code == 401:
                print("  => API limits hit or unauthorized. Stopping script.")
                break
            
    except Exception as e:
        print(f"  Exception for {name}: {e}")
        failed_count += 1
        
    with open(MENU_FILE, "w") as f:
        json.dump(data, f, indent=2)
        
    time.sleep(2)

print(f"\n--- DONE: Generated {generated_count} new images. Failed/Skipped: {failed_count} ---")
