import json
import re
import os

raw_text = """
Seafood Special
Bangada (Rawa Fry / Tawa Fry) - APC
Bangada Masala Fry - APC
Bangada Curry - APC
Surmai (Rawa Fry / Tawa Fry) - APC
Surmai Masala Fry - APC
Surmai Curry - APC
Prawns Ghee Roast - APC
Tandoori Prawns - APC
Prawns (Rawa Fry / Tawa Fry) - APC
Prawns Masala Fry - APC
Prawns Curry - APC
Chicken & Mutton (Regional)
Chicken Ghee Roast - 320.00
Mangalorean Chicken Sukka - 295.00
Chicken Kundapur - 295.00
Mutton Ghee Roast - 380.00
Mutton Sukka - 380.00
Neer Dosa Per Plate (4Pcs) - 80.00
Choice of Soup (Veg)
Tomato Soup - 160.00
Vegetable Clear Soup - 160.00
Vegetable Manchow Soup - 160.00
Hot & Sour Vegetable Soup - 160.00
Sweet Corn Vegetable Soup - 160.00
Lemon Corriander Soup - 160.00
Choice of Soup (Non-Veg)
Chicken Clear Soup - 170.00
Chicken Manchow Soup - 170.00
Hot & Sour Chicken Soup - 170.00
Sweet Corn Chicken Soup - 170.00
Lemon Corriander Chicken Soup - 170.00
Small Bites
Roast Papad - 30.00
Fry Papad - 35.00
Masala Papad - 45.00
French Fries - 160.00
Corn Basket - 190.00
Starters Tandoor (Vegetarian)
Corn Tikki - 230.00
Hara Bhara Kabab - 230.00
Starters Tandoor (Paneer)
Paneer Tikka - 240.00
Paneer Malai Tikka - 260.00
Lasooni Paneer Tikka - 260.00
Paneer Banjara Tikka - 260.00
Starters Tandoor (Non-Vegetarian)
Tangadi Kebab (1Pcs) - 170.00
Chicken Tikka - 290.00
Chicken Banjara Kebab - 290.00
Chicken Angaray - 310.00
Chicken Malai Kebab - 310.00
Tandoori Chicken (Half) - 420.00
Tandoori Chicken (Full) - 840.00
Chinese Starters (Non-Vegetarian)
Chicken - 65 - 265.00
Chicken Manchurian / Chilly - 275.00
Chicken Szechwan - 285.00
Chicken Black Pepper - 285.00
Chicken Salt and Pepper - 285.00
Chicken Drumstick (6 Pcs) - 320.00
Chicken Chinatown (6 Pcs) - 355.00
Chinese Starters (Vegetarian)
Gobi Manchurian / Chilly - 170.00
Vegetable Manchurian / Chilly - 190.00
Gobi 65 / Veg 65 - 165.00
Vegetable Crispy - 190.00
Vegetable Drumstick - 200.00
Babycorn Manchurian / Chilly - 190.00
Babycorn Crispy - 190.00
Paneer Manchurian / Chilly - 220.00
Gobi China Town - 220.00
Paneer China Town - 230.00
Baby Corn Chinatown - 230.00
Mushroom Manchurian / Chilly - 280.00
Paneer Satay - 280.00
Egg Starters
Egg Manchurian / Chilly - 160.00
Egg-65 - 160.00
Egg Szechwan - 170.00
Egg China Town - 170.00
Traditional Uttar Karnataka Food
Yangai Badanikai - 210.00
Stuff Capsicum - 210.00
Bhendi Masala - 210.00
Noogikai Fry - 170.00
Bhendi Fry - 190.00
Spice Chef's Special Items (Vegetarian)
Lahsuni Palak - 250.00
Panjabi Aloo Gobi Masala - 270.00
Veg Peshawari - 280.00
Malavani Veg Curry - 280.00
Dahi Bhendi Masala - 280.00
Sham Savera - 290.00
Paneer Tikka Lababdar - 290.00
Veg Nijami Handi - 290.00
Reshmi Paneer - 290.00
Veg Lazeez - 290.00
Mutter Paneer Burji - 300.00
Paneer Kurachan - 300.00
Main Course Indian (Vegetarian)
Vegetable Maratha / Kholapuri - 240.00
Vegetable Hydrabadi - 240.00
Vegetable Jalfrezie - 240.00
Vegetable Tawa Masala - 240.00
Veg Diwani Handi - 240.00
Veg Kalcharani - 240.00
Vegetable Handi - 240.00
Vegetable Chatapata - 240.00
Vegetable Angaray - 240.00
Babycorn Masala - 250.00
Vegetable Bhoona Masala - 250.00
Methi Malai Mutter - 260.00
Vegetable Kheema Masala - 270.00
Malai Kofta - 280.00
Main Course Paneer
Palak Paneer - 245.00
Paneer Mutter - 245.00
Paneer Tawa Masala - 245.00
Paneer Lajawab - 245.00
Paneer Burji - 260.00
Paneer Butter Masala - 260.00
Paneer Tikka Masala - 260.00
Paneer Burji Masala - 290.00
Main Course Kadhai
Vegetable Kadhai - 240.00
Babycorn Kadhai - 240.00
Paneer Kadhai - 270.00
Kaju Kadhai - 280.00
Main Course Kaju
Kaju Masala / Curry - 270.00
Kaju Kolhapuri - 270.00
Kaju Makhanwala - 290.00
Kaju Hydrabadi - 290.00
Kaju Methi Masala - 290.00
Kaju Paneer Masala - 290.00
Choice of Dal
Dal Fry - 140.00
Dal Tadka - 150.00
Dal Kolhapuri - 160.00
Dal Palak - 170.00
Dal Mathi - 170.00
Butter Dal Fry - 180.00
Salad and Raithas
Curd - 50.00
Butter Milk - 50.00
Masala Butter Milk - 60.00
Mix Vegetable Raitha - 60.00
Green Salad - 80.00
Spice Chef's Special Items (Non-Veg)
Chicken Banjara Masala - 310.00
Murg Salan Masala - 310.00
Murg Lahsuni - 310.00
Murg Methi - 310.00
Murg Lazeez - 310.00
Murg Phadi Masala - 310.00
Murg Bhoona - 310.00
Badami Murg Pista - 310.00
Mutton Bhoona - 380.00
Mutton Sagwala - 380.00
Murg Matka Handi (Half / Full) - 600.00 / 1200.00
Main Course Indian (Chicken)
Chicken Maratha / Kolhapuri - 285.00
Chicken Hydrabadi - 285.00
Chicken Masala / Curry - 285.00
Chicken Handi - 285.00
Chicken Rogan Josh - 285.00
Chicken Tikka Masala - 295.00
Butter Chicken - 295.00
Murg Massulam - 295.00
Chicken Tangadi Masala (2 Pieces) - 325.00
Chicken Half / Full
Half Chicken - 490.00
Murg Mussalam Half - 490.00
Butter Chicken Half - 490.00
Full Chicken - 980.00
Murg Mussalam Full - 980.00
Butter Chicken Full - 980.00
Main Course Mutton
Mutton Masala - 345.00
Mutton Maratha / Kolhapuri - 345.00
Mutton Rogan Josh - 345.00
Mutton Handi - 345.00
Mutton Khema Masala - 370.00
Main Course Egg
Boiled Egg - 45.00
Egg Omlette - 65.00
Egg Burji - 65.00
Egg Half Fry - 70.00
Egg Masala / Curry - 140.00
Egg Kolhapuri - 150.00
Egg Hydrabadi - 150.00
Egg Makhanwala - 160.00
Egg Nawabi - 160.00
Egg Burji Masala - 160.00
Choice of Roti
Roti - 20.00 (AC: 25.00)
Butter Roti - 25.00 (AC: 30.00)
Kulcha - 30.00 (AC: 35.00)
Butter Kulcha - 35.00 (AC: 40.00)
Naan - 40.00 (AC: 45.00)
Butter Naan - 45.00 (AC: 50.00)
Paper Roti - 55.00 (AC: 55.00)
Tandoori Lachha Parotha - 60.00 (AC: 90.00)
Garlic Naan - 80.00 (AC: 100.00)
Butter Garlic Naan - 100.00 (AC: 110.00)
Chilly Garlic Naan - 120.00 (AC: 120.00)
Butter Garlic Chilly Naan - (AC Only: 130.00)
Cheese Garlic Chilly Naan - 140.00 (AC: Cheese Chilly Garlic Naan - 150.00)
Choice of Rice
Plain Rice - 100.00 (AC: 100.00)
Jeera Rice - 140.00 (AC: 130.00)
Ghee Rice - 150.00 (AC: 140.00)
Curd Rice - 150.00 (AC: 140.00)
Dal Khichdi - 160.00 (AC: 150.00)
Dal Khichdi Kolhapuri - 170.00 (AC: 160.00)
Palak Rice - 170.00 (AC: 160.00)
Choice of Pulao
Veg Pulao - 180.00 (AC: 180.00)
Green Peas Pulao - 180.00 (AC: 180.00)
Onion Mint Pulao - 180.00 (AC: 180.00)
Kaju Pulao - 220.00 (AC: 220.00)
Choice of Biryani (Veg)
Veg Biryani - 220.00
Paneer Tikka Biryani - 230.00
Choice of Biryani (Non-Veg)
Egg Biryani - 195.00
Chicken Biryani (3Pcs) - 240.00
Chicken Biryani (5Pcs) - 270.00
Chicken Tikka Biryani (5Pcs) - 290.00
Mutton Biryani (3Pcs) - 310.00
Mutton Biryani (5Pcs) - 360.00
Choice of Rice Chinese (Veg)
Jeera Fried Rice - 130.00
Veg Fried Rice - 150.00
Garlic Fried Rice - 160.00
Veg Schezwan Fried Rice - 165.00
Kaju Fried Rice - 190.00
Choice of Rice Chinese (Non-Veg)
Egg Fried Rice - 160.00
Egg Schezwan Fried Rice - 170.00
Chicken Fried Rice - 190.00
Chicken Schezwan Fried Rice - 195.00
Choice of Noodles (Veg)
Veg Hakka Noodles - 150.00
Veg Schezwan Noodles - 160.00
Garlic Chilly Noodles - 165.00
Choice of Noodles (Non-Veg)
Egg Noodles - 150.00
Egg Schezwan Noodles - 160.00
Chicken Hakka Noodles - 190.00
Chicken Schezwan Noodles - 190.00
Choice of Dessert
Mousse (Chocolate / Strawberry) - 45.00
Cold Pastry Slice - 45.00
Hot Gulab Jamoon - 50.00
Ice-Cream - 50.00
Fruit Truffle - 70.00
Sizzling Brownie - 150.00
Choice of Milk Shakes and Mocktails
Vanilla Milk Shake - 100.00
Mango Milk Shake - 100.00
Blue Lagoon - 120.00
Mojito - 150.00
Choice of Beverages (Cold)
Water Bottle (1Ltr) - 20.00
Soft Drink - 25.00
Fresh Lime Water (Sweet / Salt) - 25.00
Fresh Lime Soda (Sweet / Salt) - 40.00
"""

cat_map = {
    'Seafood Special': ('Main Course (Non-Veg)', False),
    'Chicken & Mutton (Regional)': ('Main Course (Non-Veg)', False),
    'Choice of Soup (Veg)': ('Soups', True),
    'Choice of Soup (Non-Veg)': ('Soups', False),
    'Small Bites': ('Starters', True),
    'Starters Tandoor (Vegetarian)': ('Starters', True),
    'Starters Tandoor (Paneer)': ('Starters', True),
    'Starters Tandoor (Non-Vegetarian)': ('Starters', False),
    'Chinese Starters (Non-Vegetarian)': ('Chinese', False),
    'Chinese Starters (Vegetarian)': ('Chinese', True),
    'Egg Starters': ('Starters', False),
    'Traditional Uttar Karnataka Food': ('Main Course (Veg)', True),
    "Spice Chef's Special Items (Vegetarian)": ('Main Course (Veg)', True),
    'Main Course Indian (Vegetarian)': ('Main Course (Veg)', True),
    'Main Course Paneer': ('Main Course (Veg)', True),
    'Main Course Kadhai': ('Main Course (Veg)', True),
    'Main Course Kaju': ('Main Course (Veg)', True),
    'Choice of Dal': ('Main Course (Veg)', True),
    'Salad and Raithas': ('Beverages & Salads', True),
    "Spice Chef's Special Items (Non-Veg)": ('Main Course (Non-Veg)', False),
    'Main Course Indian (Chicken)': ('Main Course (Non-Veg)', False),
    'Chicken Half / Full': ('Main Course (Non-Veg)', False),
    'Main Course Mutton': ('Main Course (Non-Veg)', False),
    'Main Course Egg': ('Main Course (Non-Veg)', False),
    'Choice of Roti': ('Breads', True),
    'Choice of Rice': ('Biryani & Rice', True),
    'Choice of Pulao': ('Biryani & Rice', True),
    'Choice of Biryani (Veg)': ('Biryani & Rice', True),
    'Choice of Biryani (Non-Veg)': ('Biryani & Rice', False),
    'Choice of Rice Chinese (Veg)': ('Chinese', True),
    'Choice of Rice Chinese (Non-Veg)': ('Chinese', False),
    'Choice of Noodles (Veg)': ('Chinese', True),
    'Choice of Noodles (Non-Veg)': ('Chinese', False),
    'Choice of Dessert': ('Desserts', True),
    'Choice of Milk Shakes and Mocktails': ('Beverages & Salads', True),
    'Choice of Beverages (Cold)': ('Beverages & Salads', True),
}

MENU_JSON_PATH = "c:/Users/sudanva/Desktop/Spice_garden/frontend/src/data/menu.json"

if os.path.exists(MENU_JSON_PATH):
    with open(MENU_JSON_PATH, "r") as f:
        old_menu = json.load(f)
else:
    old_menu = []

image_map = {item['name'].lower(): item.get('image_url') for item in old_menu if item.get('image_url')}

parsed_items = []

current_cat_name = None

for line in raw_text.strip().split('\n'):
    line = line.strip()
    if not line:
        continue
    
    if line in cat_map:
        current_cat_name = cat_map[line]
        continue
        
    if ' - ' in line:
        parts = line.split(' - ', 1)
        name = parts[0].strip()
        
        price_part = parts[1].strip()
        # Parse price out from formats like "20.00 (AC: 25.00)" or "(AC Only: 130.00)" or "600.00 / 1200.00"
        # We can just extract the first number sequence or APC before any bracket
        price_clean = re.split(r'\(', price_part)[0].strip()
        if not price_clean:
            # e.g., "(AC Only: 130.00)" -> Just extract 130
            m = re.search(r'\d+', price_part)
            price_clean = m.group(0) if m else "APC"
            
        if '.00' in price_clean:
            price_clean = price_clean.replace('.00', '')
            
        img_url = image_map.get(name.lower())
        if not img_url:
            for old_name, old_img in image_map.items():
                if name.lower() in old_name or old_name in name.lower():
                    img_url = old_img
                    break

        cat_str, is_veg = current_cat_name if current_cat_name else ('Uncategorized', True)
        
        item = {
            "name": name,
            "price": price_clean,
            "category": cat_str,
            "is_veg": is_veg,
            "description": "",
        }
        if img_url:
            item["image_url"] = img_url
            
        parsed_items.append(item)

with open(MENU_JSON_PATH, "w") as f:
    json.dump(parsed_items, f, indent=2)

print(f"Updated menu.json with {len(parsed_items)} mapped items.")
