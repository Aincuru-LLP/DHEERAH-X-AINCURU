import urllib.request
import json
import os

with open('figma_images_map.json', 'r', encoding='utf-8') as f:
    images_map = json.load(f)

targets = {
    'home-hero.png': 'fa04bd580ed87db8bcc37c8e3d40a1da35e809eb',
    'newin-hero-1.png': 'bbf0f54628e6857eea88013fe08990385d99d0fa',
    'newin-hero-2.png': 'da3cbd088047591cbf6d8e00dbe34765a2e56571',
    'cat-raw-silks.png': '3eeceab03d0ec10bc02811c6a99612ab695fcd24',
    'cat-maxis.png': 'b44e65425bea68b118022e7a87714a7f844c9d70',
    'cat-kalamkari.png': 'a26690403b39fce702b05d0db7d121de47551bf1',
    'cat-salwar-suits.png': '50772a830f0e236b5e91271851201a073450fb8f',
    'about-hero.png': '2b0acfc8813b66bc47679635b76aa0b4214561cd',
    'about-flower.png': '788d2778d7cd3afa921ecafcaed0fd5f0e5d1ff9',
    'about-model.png': 'df67204b18f6247fe716ab832418e9954015119b',
    'about-kurta.png': '54f28c8d35b0b0eea2f7467b52515fef21e0fad8',
    'editorial-chair.png': 'df24020d4a86ee634fd76481f6c08eb70beba0b8',
    'editorial-garden.png': '037646a549ac398607a39ec3e7c94b0f9d645aeb',
    'product-blossom.png': '357ed27809731fb449ea24a57d519e6e7f8ab3fe',
}

os.makedirs('public/figma-assets', exist_ok=True)

for fname, ref in targets.items():
    url = images_map.get(ref)
    out_path = os.path.join('public', 'figma-assets', fname)
    if url:
        print(f"Downloading {fname} from {url[:50]}...")
        try:
            urllib.request.urlretrieve(url, out_path)
            print(f"  -> Saved {out_path} ({os.path.getsize(out_path)} bytes)")
        except Exception as e:
            print(f"  -> Error downloading {fname}: {e}")
    else:
        print(f"  -> Ref {ref} not found in images_map")
