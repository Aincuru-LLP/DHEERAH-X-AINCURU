import json

with open('figma_about_node.json', 'r', encoding='utf-8') as f:
    mob = json.load(f)['nodes']['2138:12501']['document']

with open('figma_about_desktop.json', 'r', encoding='utf-8') as f:
    desk = json.load(f)['nodes']['2107:7281']['document']

def dump_section_specs(section, name):
    print(f"\n--- {name} ---")
    box = section.get('absoluteBoundingBox', {})
    print(f"Size: {box.get('width')} x {box.get('height')}")
    for child in section.get('children', []):
        cname = child.get('name')
        cbox = child.get('absoluteBoundingBox', {})
        w, h = cbox.get('width'), cbox.get('height')
        aspect = w / h if h else 0
        print(f"  Child: {cname} | size={w}x{h} (aspect={aspect:.2f})")
        # Text styles
        for c2 in child.get('children', []):
            for c3 in c2.get('children', [c2]):
                if c3.get('type') == 'TEXT':
                    chars = c3.get('characters', '').strip().replace('\n', ' ')
                    st = c3.get('style', {})
                    print(f"    Text: '{chars[:40]}...'")
                    print(f"      font={st.get('fontFamily')} size={st.get('fontSize')} weight={st.get('fontWeight')} lh={st.get('lineHeightPx')} ls={st.get('letterSpacing')}")

print("================ MOBILE SPECS ================")
for c in mob.get('children', []):
    if c.get('name') in ['Frame 321', 'Frame 367', 'Frame 430', 'Frame 431']:
        dump_section_specs(c, f"Mobile {c.get('name')}")

print("\n================ DESKTOP SPECS ================")
for c in desk.get('children', []):
    if c.get('name') in ['Frame 383', 'Frame 316', 'Frame 321', 'Frame 381', 'Frame 359']:
        dump_section_specs(c, f"Desktop {c.get('name')}")
