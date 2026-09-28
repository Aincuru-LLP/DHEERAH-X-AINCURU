import json

with open('figma_all_pages_deep.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

def find_node_images(n, path=""):
    if not isinstance(n, dict): return
    name = n.get('name', '')
    cur_path = f"{path} > {name}" if path else name
    for fill in n.get('fills', []):
        if isinstance(fill, dict) and fill.get('type') == 'IMAGE':
            print(f"IMAGE in [{cur_path}]: ref={fill.get('imageRef')}")
    for c in n.get('children', []):
        find_node_images(c, cur_path)

home_node = data.get('nodes', {}).get('2107:6466', {}).get('document', {})
find_node_images(home_node)
