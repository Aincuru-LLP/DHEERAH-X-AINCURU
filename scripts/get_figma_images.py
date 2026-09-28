import urllib.request
import json
import os

FIGMA_TOKEN = "figd_SNS3DJxBOwYz4FMAoO0XWkY0BbEVaIGPaSzKJbAE"
FILE_KEY = "wI7kc2uAnHpIpsCIH3v5Id"

def get_image_urls():
    url = f"https://api.figma.com/v1/files/{FILE_KEY}/images"
    req = urllib.request.Request(url, headers={"X-Figma-Token": FIGMA_TOKEN})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

data = get_image_urls()
meta = data.get('meta', {})
images = meta.get('images', {})
print(f"Total image fills in file: {len(images)}")

os.makedirs('public/figma-assets', exist_ok=True)

# Save mapping to json
with open('figma_images_map.json', 'w', encoding='utf-8') as f:
    json.dump(images, f, indent=2)

print("Saved figma_images_map.json")
