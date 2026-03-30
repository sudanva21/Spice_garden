import urllib.request
import re
import json

url = 'https://collection.cloudinary.com/disgfuj6r/833b7a96c84a471b3b9a1f34507e87fd'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    
    # Cloudinary collections usually store initial state in window.__PRELOADED_STATE__
    # Let's search for secure_url or just any .jpg links for res.cloudinary.com/disgfuj6r
    links = re.findall(r'https://res\.cloudinary\.com/disgfuj6r/image/upload/[A-Za-z0-9_/\.\-]*?\.jpg', html, re.IGNORECASE)
    links = list(set(links))
    
    print(f'Found {len(links)} unique .jpg cloudinary links.')
    
    if len(links) > 0:
        # Save to the JSON directly!
        import os
        target_file = os.path.join('frontend', 'src', 'data', 'gallery.json')
        
        # Sort them basically
        links.sort()
        
        gallery_data = []
        for i, url in enumerate(links):
            # Try to grab the CAM name from the URL
            match = re.search(r'(CAM\d+)', url)
            name = match.group(1) if match else f'Image {i+1}'
            gallery_data.append({
                "id": f"gal_{i+1}",
                "title": f"Gallery {name}",
                "url": url.replace('http://', 'https://')
            })
            
        with open(target_file, 'w') as f:
            json.dump(gallery_data, f, indent=2)
            
        print(f"Successfully wrote {len(links)} URLs to {target_file}")
    
except Exception as e:
    print('Failed:', e)
