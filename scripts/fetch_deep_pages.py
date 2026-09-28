import urllib.request
import json

FIGMA_TOKEN = "figd_SNS3DJxBOwYz4FMAoO0XWkY0BbEVaIGPaSzKJbAE"
FILE_KEY = "wI7kc2uAnHpIpsCIH3v5Id"

def fetch_nodes(node_ids, filename):
    ids_str = ",".join(node_ids)
    url = f"https://api.figma.com/v1/files/{FILE_KEY}/nodes?ids={ids_str}&depth=8"
    req = urllib.request.Request(url, headers={"X-Figma-Token": FIGMA_TOKEN})
    print(f"Fetching {node_ids}...")
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode('utf-8')
            with open(filename, 'w', encoding='utf-8') as out:
                out.write(content)
            print(f"Saved to {filename}")
    except Exception as e:
        print(f"Error fetching: {e}")

# Fetch home (2107:6466), new in (2107:6802), about us (2107:7281), product page (2107:7385)
fetch_nodes(["2107:6466", "2107:6802", "2107:7281", "2107:7385"], "figma_all_pages_deep.json")
