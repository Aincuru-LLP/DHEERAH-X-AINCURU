import json

with open('figma_about_node.json', 'r', encoding='utf-8') as f:
    mob_data = json.load(f)['nodes']['2138:12501']['document']

with open('figma_about_desktop.json', 'r', encoding='utf-8') as f:
    desk_data = json.load(f)['nodes']['2107:7281']['document']

def analyze_section(frame, label):
    print(f"\n==================== {label} ({frame.get('name')}, ID: {frame.get('id')}) ====================")
    box = frame.get('absoluteBoundingBox', {})
    print(f"Size: {box.get('width')} x {box.get('height')}")
    print(f"LayoutMode: {frame.get('layoutMode')}, itemSpacing: {frame.get('itemSpacing')}")
    print(f"Padding: T:{frame.get('paddingTop',0)} R:{frame.get('paddingRight',0)} B:{frame.get('paddingBottom',0)} L:{frame.get('paddingLeft',0)}")
    print(f"AlignItems: primary={frame.get('primaryAxisAlignItems')}, counter={frame.get('counterAxisAlignItems')}")
    
    for c in frame.get('children', []):
        cbox = c.get('absoluteBoundingBox', {})
        print(f"  Child: {c.get('name')} [{c.get('type')}] size={cbox.get('width')}x{cbox.get('height')} pos=({cbox.get('x')},{cbox.get('y')})")
        if c.get('layoutMode'):
            print(f"    layoutMode={c.get('layoutMode')} spacing={c.get('itemSpacing')} pad={c.get('paddingLeft')},{c.get('paddingTop')}")
        # Check text children inside c
        def find_text_and_img(node, depth=2):
            indent = "    " * depth
            if node.get('type') == 'TEXT':
                st = node.get('style', {})
                chars = node.get('characters', '').strip().replace('\n', ' ')
                print(f"{indent}TEXT: '{chars}'")
                print(f"{indent}  fontFamily={st.get('fontFamily')} size={st.get('fontSize')} weight={st.get('fontWeight')} lineHeight={st.get('lineHeightPx')} letterSpacing={st.get('letterSpacing')} align={st.get('textAlignHorizontal')}")
            for f in node.get('fills', []):
                if f.get('type') == 'IMAGE':
                    print(f"{indent}IMAGE: ref={f.get('imageRef')} scaleMode={f.get('scaleMode')}")
            for sc in node.get('children', []):
                find_text_and_img(sc, depth + 1)
        find_text_and_img(c)

print("###################### MOBILE (393px) ######################")
for c in mob_data.get('children', []):
    if c.get('name') not in ['Frame 429', 'Frame 295']: # Skip footer & navbar
        analyze_section(c, f"Mobile: {c.get('name')}")

print("\n###################### DESKTOP (1440px) ######################")
for c in desk_data.get('children', []):
    if c.get('name') not in ['Frame 350', 'Frame 295']: # Skip footer & navbar
        analyze_section(c, f"Desktop: {c.get('name')}")
