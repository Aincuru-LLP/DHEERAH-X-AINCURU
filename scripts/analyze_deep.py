import json

def analyze_deep(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    fonts = {}
    colors = set()
    images = {}
    
    def walk(n):
        if isinstance(n, dict):
            st = n.get('style')
            if isinstance(st, dict) and st.get('fontFamily'):
                key = (st.get('fontFamily'), st.get('fontWeight'), st.get('fontSize'), st.get('letterSpacing'))
                fonts[key] = fonts.get(key, 0) + 1
                
            for f in n.get('fills', []):
                if isinstance(f, dict):
                    if f.get('type') == 'SOLID' and isinstance(f.get('color'), dict):
                        c = f['color']
                        r = int(c.get('r', 0) * 255)
                        g = int(c.get('g', 0) * 255)
                        b = int(c.get('b', 0) * 255)
                        colors.add(f"#{r:02x}{g:02x}{b:02x}")
                    elif f.get('type') == 'IMAGE' and f.get('imageRef'):
                        images[f.get('imageRef')] = n.get('name', 'unnamed')
                        
            for v in n.values():
                walk(v)
        elif isinstance(n, list):
            for item in n:
                walk(item)
                
    walk(data)
    
    print("=== FONTS FOUND ===")
    for (fam, weight, size, spacing), count in sorted(fonts.items(), key=lambda x: -x[1]):
        print(f"  {fam} (weight: {weight}, size: {size}px, spacing: {spacing}) -> {count} occurrences")
        
    print("\n=== COLORS FOUND ===")
    for c in sorted(list(colors)):
        print(f"  {c}")
        
    print(f"\n=== IMAGES FOUND: {len(images)} ===")
    for img_ref, name in list(images.items())[:20]:
        print(f"  {img_ref}: {name}")

analyze_deep('figma_all_pages_deep.json')
