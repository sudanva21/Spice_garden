import json

MENU_FILE = "c:/Users/sudanva/Desktop/Spice_garden/frontend/src/data/menu.json"
OUT_FILE = "c:/Users/sudanva/Desktop/Spice_garden/image_generation_prompts.md"

with open(MENU_FILE, "r") as f:
    data = json.load(f)

lines = [
    "# Spice Garden Menu - Image Generation Prompts",
    "Here is the complete list of dishes that need images, along with ready-to-copy prompts to help you generate beautiful, highly accurate photorealistic images using another AI tool like Midjourney, DALL-E 3, or Adobe Firefly.",
    "",
    "## How to use",
    "Copy the prompt text and paste it directly into your image generator. Once generated, save the image as the suggested filename (e.g. `dish_name.png`) in your `frontend/public/dishes/` folder, and run the `add_images.py` script to map it.",
    ""
]

current_category = ""
for item in data:
    url = item.get("image_url")
    if not url:
        category = item["category"]
        if category != current_category:
            current_category = category
            lines.append(f"### {category}")
            lines.append("")
        
        name = item["name"]
        
        # Build prompt
        style = "Professional food photography, highly detailed, photorealistic, 4k resolution, cinematic lighting, shallow depth of field, elegant dark restaurant background."
        
        if "Soups" in category:
            base = f"A beautiful steaming bowl of Indian {name}, garnished perfectly, resting on an elegant dark dining table."
        elif "Starters" in category or "Chinese" in category:
            base = f"A delicious plate of {name}, an Indo-Chinese or Indian appetizer, beautifully garnished with fresh herbs and spices, served on a premium ceramic plate."
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
            
        prompt = f"**{name}**\n* **Prompt:** `{base} {style}`\n"
        lines.append(prompt)

with open(OUT_FILE, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))

print("Created image_generation_prompts.md")
