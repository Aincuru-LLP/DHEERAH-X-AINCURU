import json

print("=== MOBILE (2138:12501) ===")
with open('figma_about_node.json', 'r', encoding='utf-8') as f:
    mob = json.load(f)['nodes']['2138:12501']['document']

for c in mob.get('children', []):
    cbox = c.get('absoluteBoundingBox', {})
    print(f"Child: [{c.get('type')}] {c.get('name')} ({c.get('id')}) {cbox.get('width')}x{cbox.get('height')}")

print("\n=== DESKTOP (2107:7281) ===")
with open('figma_about_desktop.json', 'r', encoding='utf-8') as f:
    desk = json.load(f)['nodes']['2107:7281']['document']

for c in desk.get('children', []):
    cbox = c.get('absoluteBoundingBox', {})
    print(f"Child: [{c.get('type')}] {c.get('name')} ({c.get('id')}) {cbox.get('width')}x{cbox.get('height')}")
