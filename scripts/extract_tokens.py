import json

def get_fonts_and_colors(file_path):
    fonts = set()
    colors = set()
    texts = []
    
    with open(file_path, 'r', encoding='utf-8-sig') as f:
        data = json.load(f)
        
    def walk(n):
        if isinstance(n, dict):
            # Check style
            st = n.get('style')
            if isinstance(st, dict) and st.get('fontFamily'):
                fonts.add((st.get('fontFamily'), st.get('fontWeight'), st.get('fontSize')))
            # Check fills
            for f in n.get('fills', []):
                if isinstance(f, dict):
                    if f.get('type') == 'SOLID' and isinstance(f.get('color'), dict):
                        c = f['color']
                        r = int(c.get('r', 0) * 255)
                        g = int(c.get('g', 0) * 255)
                        b = int(c.get('b', 0) * 255)
                        colors.add(f"#{r:02x}{g:02x}{b:02x}")
            # Check text characters
            txt = n.get('characters')
            if txt and isinstance(txt, str):
                texts.append((n.get('name'), txt.strip(), st.get('fontFamily') if isinstance(st, dict) else ''))
                
            for v in n.values():
                walk(v)
        elif isinstance(n, list):
            for item in n:
                walk(item)
            
    walk(data)
    print(f"=== {file_path} ===")
    print("\nFONTS:")
    for font in sorted(list(fonts), key=lambda x: (x[0], x[2] or 0)):
        print(f"  {font[0]} - weight: {font[1]} - size: {font[2]}px")
        
    print("\nCOLORS:")
    for color in sorted(list(colors)):
        print(f"  {color}")
        
    print(f"\nSAMPLE TEXTS ({len(texts)} total):")
    for name, txt, fam in texts[:25]:
        print(f"  [{fam}] {name}: {repr(txt[:60])}")

get_fonts_and_colors('figma_home_deep.json')
