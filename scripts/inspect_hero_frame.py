import json

with open('figma_mobile_nodes.json', 'r', encoding='utf-8-sig') as f:
    data = json.load(f)

home = data['nodes']['2126:10432']['document']
frame306 = None
for child in home.get('children', []):
    if child.get('id') == '2126:10454':
        frame306 = child
        break

def print_tree(node, depth=0):
    indent = '  ' * depth
    box = node.get('absoluteBoundingBox')
    print(f"{indent}{node.get('id')} {node.get('name')} {node.get('type')} {box}")
    if 'characters' in node:
        print(f"{indent}  TEXT: {repr(node['characters'])}")
    if 'fills' in node:
        for fill in node.get('fills', []):
            if fill.get('type') == 'IMAGE':
                print(f"{indent}  IMAGE FILL: {fill.get('imageRef')} scaleMode={fill.get('scaleMode')} transform={fill.get('imageTransform')}")
    for c in node.get('children', []):
        print_tree(c, depth + 1)

print_tree(frame306)
