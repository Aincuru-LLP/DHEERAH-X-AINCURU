import urllib.request
import json
import os

TOKEN = 'figd_SNS3DJxBOwYz4FMAoO0XWkY0BbEVaIGPaSzKJbAE'
KEY = 'wI7kc2uAnHpIpsCIH3v5Id'

# Get node IDs of Frame 370 in each D product page
ids_to_check = '2107:8704,2107:7644,2107:8174,2107:9234'
url = f'https://api.figma.com/v1/files/{KEY}/nodes?ids={ids_to_check}&depth=2'
req = urllib.request.Request(url, headers={'X-Figma-Token': TOKEN})
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode('utf-8'))

banner_node_map = {}
for nid, nval in data['nodes'].items():
    doc = nval['document']
    page_name = doc.get('name')
    f370 = doc['children'][0]
    f370_id = f370.get('id')
    print(f"Page: {page_name} -> Frame 370 ID: {f370_id}")
    banner_node_map[f370_id] = page_name

# Now export these exact frames at 2x scale as PNG from Figma API
export_ids = ','.join(banner_node_map.keys())
export_url = f'https://api.figma.com/v1/images/{KEY}?ids={export_ids}&format=png&scale=2'
req_export = urllib.request.Request(export_url, headers={'X-Figma-Token': TOKEN})
with urllib.request.urlopen(req_export) as resp:
    export_data = json.loads(resp.read().decode('utf-8'))

print("Export results:", export_data.get('images', {}).keys())

os.makedirs('public/figma-assets/banners', exist_ok=True)

name_map = {
    'D product 1': 'maxis-hero.png',
    'D product 2': 'kalamkari-hero.png',
    'D product 3': 'raw-silk-hero.png',
    'D product 4': 'salwar-suits-hero.png',
}

for node_id, img_url in export_data.get('images', {}).items():
    p_name = banner_node_map.get(node_id)
    file_name = name_map.get(p_name, f"banner-{node_id.replace(':', '-')}.png")
    out_path = os.path.join('public', 'figma-assets', 'banners', file_name)
    print(f"Downloading {file_name} from {img_url[:60]}...")
    urllib.request.urlretrieve(img_url, out_path)
    print(f"Saved {out_path} ({os.path.getsize(out_path)} bytes)")
