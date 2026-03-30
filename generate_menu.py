import json
import re

text = """
SEE FOOD SPECIAL
BANGADA RAWA FRY/TAWA FRY 380
BANGADA MASALA FRY 320
SURMAI RAWA FRY/TAWA FRY APC
SURMAI MASALA FRY APC
PRAWNS RAWA FRY/TAWA FRY APC
PRAWNS MASALA FRY APC
PRAWNS GHEE ROAST APC
TANDOORI PRAWNS APC
CHOICE OF SOUP ( VEG )
TOMATO SOUP 160
VEGETABLE CLEAR SOUP 160
VEGETABLE MANCHOW SOUP 160
HOT & SOUR VEGETABLE SOUP 160
SWEET CORN VEGETABLE SOUP 160
LEMON CORRIANDER SOUP 160
CHOICE OF SOUP ( NON-VEG )
CHICKEN CLEAR SOUP 170
CHICKEN MANCHOW SOUP 170
HOT & SOUR CHICKEN SOUP 170
SWEET CORN CHICKEN SOUP 170
LEMON CORRIANDER CHICKEN SOUP 170
SMALL BITES
ROAST PAPAD 30
FRY PAPAD 35
MASALA PAPAD 45
FRENCH FRIES 160
CORN BASKET 190
STARTERS TANDOOR
CORN TIKKI 230
HARA BHARA KABAB 230
TANGADI KEBAB (1PCS) 170
CHICKEN TIKKA 290
CHICKEN BANJARA KEBAB 290
PANEER TIKKA 240
PANEER MALAI TIKKA 260
CHICKEN MALAI KEBAB 310
CHICKEN ANGARAY 310
TANDOORI CHICKEN (HALF) 420
TANDOORI CHICKEN (FULL) 840
CHINESE STARTERS
CHICKEN MANCHURIAN / CHILLY 275
CHICKEN - 65 265
CHICKEN SZECHWAN 285
CHICKEN BLACK PEPPER 285
GOBI MANCHURIAN / CHILLY 170
VEGETABLE MANCHURIAN / CHILLY 190
GOBI 65 / VEG 65 165
VEGETABLE CRISPY 190
PANEER MANCHURIAN / CHILLY 220
EGG STARTERS
EGG MANCHURIAN / CHILLY 160
EGG 65 160
EGG SZECHWAN 170
TRADITIONAL UTTAR KARNATAKA FOOD
YANGAI BADANIKAI 210
STUFF CAPSICUM 210
BHENDI MASALA 210
VEG PESHAWARI 280
MALAVANI VEG CURRY 280
DAHI BHENDI MASALA 280
PANJABI ALOO GOBI MASALA 270
LAHSUNI PALAK 250
SPICE CHEF’S SPECIAL ITEMS
MUTTER PANEER BURJI 300
PANEER TIKKA LABABDAR 290
CHICKEN BANJARA MASALA 310
MURG SALAN MASALA 310
MURG MATKA HANDI (HALF) 600
MUTTON SAGWALA 380
MAIN COURSE INDIAN
VEGETABLE MARATHA / KHOLAPURI 240
VEGETABLE HYDRABADI 240
VEGETABLE JALFREZIE 240
MALAI KOFTA 280
PALAK PANEER 245
PANEER BUTTER MASALA 260
BUTTER CHICKEN 295
CHICKEN TIKKA MASALA 295
MUTTON MASALA 345
CHOICE OF ROTI
ROTI 20
BUTTER ROTI 25
KULCHA 30
BUTTER KULCHA 35
NAAN 40
BUTTER NAAN 45
GARLIC NAAN 80
CHOICE OF RICE & BIRYANI
PLAIN RICE 100
JEERA RICE 140
GHEE RICE 150
CURD RICE 150
VEG PULAO 180
EGG BIRYANI 195
VEG BIRYANI 220
CHICKEN BIRYANI (5Pcs) 270
MUTTON BIRYANI (3Pcs) 310
CHOICE OF NOODLES
VEG HAKKA NOODLES 150
VEG SCHEZWAN NOODLES 160
CHICKEN HAKKA NOODLES 190
CHOICE OF DESSERT
HOT GULAB JAMOON 50
ICE-CREAM 50
SIZZLING BROWNIE 150
"""

lines = text.strip().split('\n')
menu_items = []
current_category = ""
for line in lines:
    line = line.strip()
    if not line:
        continue
    # checking if line is category (no numbers)
    if not re.search(r'\d+$|APC$', line):
        current_category = line
        continue
    
    # parse item and price
    match = re.search(r'^(.*?)\s+(\d+|APC)$', line)
    if match:
        name = match.group(1).strip()
        price = match.group(2).strip()
        
        # map to broad categories for UI
        ui_category = "All"
        if "SOUP" in current_category: ui_category = "Soups"
        elif "STARTER" in current_category or "BITES" in current_category: ui_category = "Starters"
        elif "CHINESE" in current_category or "NOODLES" in current_category: ui_category = "Chinese"
        elif "ROTI" in current_category: ui_category = "Breads"
        elif "RICE" in current_category or "BIRYANI" in current_category: ui_category = "Biryani"
        elif "DESSERT" in current_category: ui_category = "Desserts"
        elif "MUTTON" in current_category or "CHICKEN" in current_category or "EGG" in current_category or "SEE FOOD" in current_category: ui_category = "Main Course (Non-Veg)"
        else: ui_category = "Main Course (Veg)"
        
        if "CHICKEN" in name or "MUTTON" in name or "EGG" in name or "PRAWNS" in name or "BANGADA" in name or "SURMAI" in name:
            is_veg = False
        else:
            is_veg = True
            
        if ui_category == "Main Course (Veg)" and not is_veg:
            ui_category = "Main Course (Non-Veg)"
            
        menu_items.append({
            "name": name.title(),
            "price": price,
            "category": ui_category,
            "is_veg": is_veg,
            "description": ""
        })

with open("c:/Users/sudanva/Desktop/Spice_garden/frontend/src/data/menu.json", "w") as f:
    json.dump(menu_items, f, indent=2)

print("Created menu.json")
