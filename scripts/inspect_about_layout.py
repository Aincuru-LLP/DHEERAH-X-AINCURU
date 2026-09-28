import json

with open('figma_about_node.json', 'r', encoding='utf-8') as f:
    mob = json.load(f)['nodes']['2138:12501']['document']

with open('figma_about_desktop.json', 'r', encoding='utf-8') as f:
    desk = json.load(f)['nodes']['2107:7281']['document']

def inspect_frame(f, indent=''):
    name = f.get('name')
    box = f.get('absoluteBoundingBox', {})
    w, h = box.get('width', 0), box.get('height', 0)
    layoutMode = f.get('layoutMode')
    primaryAxisAlign = f.get('primaryAxisAlignItems')
    counterAxisAlign = f.get('counterAxisAlignItems')
    itemSpacing = f.get('itemSpacing')
    paddingLeft = f.get('paddingLeft')
    paddingRight = f.get('paddingRight')
    paddingTop = f.get('paddingTop')
    paddingBottom = f.get('paddingBottom')
    fills = [fill.get('type') for fill in f.get('fills', [])]
    print(f"{indent}[{name}] {w}x{h} layout={layoutMode} gap={itemSpacing} align={primaryAxisAlign}/{counterAxisAlign} pad=({paddingTop},{paddingRight},{paddingBottom},{paddingLeft}) fills={fills}")
    for c in f.get('children', []):
        if c.get('type') in ['FRAME', 'INSTANCE', 'GROUP']:
            inspect_frame(c, indent + '  ')
        elif c.get('type') == 'TEXT':
            st = c.get('style', {})
            chars = c.get('characters', '').replace('\n', ' ')
            fills_color = c.get('fills', [{}])[0].get('color', {})
            align_h = st.get('textAlignHorizontal')
            print(f"{indent}  TEXT: '{chars[:40]}' font={st.get('fontFamily')} sz={st.get('fontSize')} wt={st.get('fontWeight')} align={align_h} color={fills_color}")

print("=== MOBILE SECTIONS ===")
for c in mob.get('children', []):
    if c.get('name') in ['Frame 321', 'Frame 367', 'Frame 430', 'Frame 431', 'Frame 359']:
        inspect_frame(c)

print("\n=== DESKTOP SECTIONS ===")
for c in desk.get('children', []):
    if c.get('name') in ['Frame 383', 'Frame 316', 'Frame 321', 'Frame 381', 'Frame 359']:
        inspect_frame(c)
