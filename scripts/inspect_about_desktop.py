import json

with open('figma_about_desktop.json', 'r', encoding='utf-8') as f:
    desk = json.load(f)['nodes']['2107:7281']['document']

def inspect_frame(n, prefix=""):
    name = n.get('name')
    nid = n.get('id')
    nbox = n.get('absoluteBoundingBox', {})
    w, h = nbox.get('width', 0), nbox.get('height', 0)
    ntype = n.get('type')
    
    text_info = ""
    if ntype == 'TEXT':
        text_info = f" TEXT: '{n.get('characters', '').strip()}' font={n.get('style', {}).get('fontFamily')} {n.get('style', {}).get('fontSize')}px fw{n.get('style', {}).get('fontWeight')}"
    
    img_info = ""
    for f in n.get('fills', []):
        if f.get('type') == 'IMAGE':
            img_info += f" IMG_REF: {f.get('imageRef')} scaleMode={f.get('scaleMode')}"
        elif f.get('type') == 'SOLID':
            c = f.get('color', {})
            img_info += f" BG: rgb({int(c.get('r',0)*255)},{int(c.get('g',0)*255)},{int(c.get('b',0)*255)})"
    
    print(f"{prefix}[{ntype}] {name} ({nid}) {w:.0f}x{h:.0f}{text_info}{img_info}")
    for c in n.get('children', []):
        inspect_frame(c, prefix + "  ")

print("=== DESKTOP FRAMES ===")
for c in desk.get('children', []):
    inspect_frame(c)
