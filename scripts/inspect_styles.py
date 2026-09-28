import json

with open('figma_about_node.json', 'r', encoding='utf-8') as f:
    mob = json.load(f)['nodes']['2138:12501']['document']

for c in mob.get('children', []):
    name = c.get('name')
    box = c.get('absoluteBoundingBox', {})
    cr = c.get('cornerRadius')
    bg = c.get('backgroundColor')
    strokes = c.get('strokes')
    print(f"Frame {name}: size={box.get('width')}x{box.get('height')}, cornerRadius={cr}, bg={bg}, strokes={strokes}")
    for sc in c.get('children', []):
        sc_cr = sc.get('cornerRadius')
        sc_box = sc.get('absoluteBoundingBox', {})
        print(f"  sub: {sc.get('name')} size={sc_box.get('width')}x{sc_box.get('height')}, cr={sc_cr}")
