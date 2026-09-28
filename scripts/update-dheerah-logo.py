import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
SOURCE_LOGO = ROOT / "dheerah-logo.png"

PUBLIC_BRANDING = ROOT / "public" / "branding"
PUBLIC_FAVI = PUBLIC_BRANDING / "favicons"
PUBLIC_SOCIAL = PUBLIC_BRANDING / "social"

BRANDING = ROOT / "branding"
BRANDING_FAVI = BRANDING / "favicons"
BRANDING_SOCIAL = BRANDING / "social"

for p in [PUBLIC_BRANDING, PUBLIC_FAVI, PUBLIC_SOCIAL, BRANDING, BRANDING_FAVI, BRANDING_SOCIAL]:
    p.mkdir(parents=True, exist_ok=True)

im_orig = Image.open(SOURCE_LOGO).convert("RGBA")
bbox = im_orig.getbbox()
print(f"Original logo size: {im_orig.size}, bbox: {bbox}")

# 1. Trimmed full logo (emblem + DHEERAH + DESIGNER BOUTIQUE)
# bbox is (10, 14, 433, 100)
# Let's add 4px padding around for clean rendering without clipping antialiasing
pad = 4
left = max(0, bbox[0] - pad)
top = max(0, bbox[1] - pad)
right = min(im_orig.width, bbox[2] + pad)
bottom = min(im_orig.height, bbox[3] + pad)

im_trimmed = im_orig.crop((left, top, right, bottom))
print(f"Trimmed logo size: {im_trimmed.size}")

# Save full logo lockups
im_trimmed.save(PUBLIC_BRANDING / "dheerah-logo.png", format="PNG", optimize=True)
im_trimmed.save(BRANDING / "dheerah-logo.png", format="PNG", optimize=True)
im_trimmed.save(PUBLIC_BRANDING / "master-logo.png", format="PNG", optimize=True)
im_trimmed.save(PUBLIC_BRANDING / "master-logo-trim.png", format="PNG", optimize=True)
im_trimmed.save(PUBLIC_BRANDING / "logo-master.png", format="PNG", optimize=True)

# 2. Extract emblem (Lotus 'D')
# Emblem is from x=10 to x=91, y=14 to y=100
emblem_crop = im_orig.crop((10, 14, 91, 100))
# Let's place the emblem into a square 512x512 transparent canvas with 10% margin
sq_size = 512
margin = 40
avail = sq_size - 2 * margin
ratio = min(avail / emblem_crop.width, avail / emblem_crop.height)
new_w = int(emblem_crop.width * ratio)
new_h = int(emblem_crop.height * ratio)
emblem_resized = emblem_crop.resize((new_w, new_h), Image.Resampling.LANCZOS)

sq_emblem = Image.new("RGBA", (sq_size, sq_size), (0, 0, 0, 0))
pos_x = (sq_size - new_w) // 2
pos_y = (sq_size - new_h) // 2
sq_emblem.paste(emblem_resized, (pos_x, pos_y), emblem_resized)

sq_emblem.save(PUBLIC_BRANDING / "dheerah-emblem.png", format="PNG", optimize=True)
sq_emblem.save(PUBLIC_BRANDING / "tc-emblem.png", format="PNG", optimize=True)
sq_emblem.save(PUBLIC_BRANDING / "monogram-master.png", format="PNG", optimize=True)
sq_emblem.save(PUBLIC_BRANDING / "mark-master.png", format="PNG", optimize=True)
sq_emblem.save(BRANDING / "monogram-master.png", format="PNG", optimize=True)
sq_emblem.save(BRANDING / "mark-master.png", format="PNG", optimize=True)

# 3. Favicons
favi_sizes = [16, 32, 48, 64, 96, 180, 192, 256, 512]
ico_images = []
for sz in favi_sizes:
    favi = sq_emblem.resize((sz, sz), Image.Resampling.LANCZOS)
    favi.save(PUBLIC_FAVI / f"favicon-{sz}x{sz}.png", format="PNG", optimize=True)
    favi.save(BRANDING_FAVI / f"favicon-{sz}x{sz}.png", format="PNG", optimize=True)
    if sz == 180:
        favi.save(PUBLIC_FAVI / "apple-touch-icon.png", format="PNG", optimize=True)
        favi.save(BRANDING_FAVI / "apple-touch-icon.png", format="PNG", optimize=True)
    if sz in [16, 32, 48]:
        ico_images.append(favi)

# Favicon.ico
ico_images[0].save(
    PUBLIC_FAVI / "favicon.ico",
    format="ICO",
    sizes=[(16, 16), (32, 32), (48, 48)],
    append_images=ico_images[1:]
)
ico_images[0].save(
    BRANDING_FAVI / "favicon.ico",
    format="ICO",
    sizes=[(16, 16), (32, 32), (48, 48)],
    append_images=ico_images[1:]
)

# 4. Social Cards & Profiles
# Instagram Profile (1080x1080)
ig_prof = Image.new("RGBA", (1080, 1080), (255, 255, 255, 255))
draw_ig = ImageDraw.Draw(ig_prof)
# Elegant warm cream circle or gold ring
draw_ig.ellipse([(140, 140), (940, 940)], outline=(199, 4, 43, 220), width=6)
draw_ig.ellipse([(152, 152), (928, 928)], outline=(243, 188, 0, 180), width=3)
# Place emblem centered inside ring
prof_emblem_size = 540
prof_emblem = emblem_crop.resize(
    (int(emblem_crop.width * (prof_emblem_size / emblem_crop.height)), prof_emblem_size),
    Image.Resampling.LANCZOS
)
ig_prof.paste(
    prof_emblem,
    ((1080 - prof_emblem.width) // 2, (1080 - prof_emblem.height) // 2),
    prof_emblem
)
ig_prof.save(PUBLIC_SOCIAL / "instagram-profile-1080.png", format="PNG", optimize=True)
ig_prof.save(BRANDING_SOCIAL / "instagram-profile-1080.png", format="PNG", optimize=True)

# Other profile sizes
for name, sz in [
    ("whatsapp-business-640.png", 640),
    ("twitter-profile-400.png", 400),
    ("linkedin-logo-300.png", 300),
    ("facebook-profile-180.png", 180),
]:
    p_img = ig_prof.resize((sz, sz), Image.Resampling.LANCZOS)
    p_img.save(PUBLIC_SOCIAL / name, format="PNG", optimize=True)
    p_img.save(BRANDING_SOCIAL / name, format="PNG", optimize=True)

# 5. Open Graph Card (1200x630)
og = Image.new("RGBA", (1200, 630), (255, 255, 255, 255))
draw_og = ImageDraw.Draw(og)
# Inner luxury gold frame
draw_og.rectangle([(30, 30), (1170, 600)], outline=(243, 188, 0, 160), width=2)
draw_og.rectangle([(38, 38), (1162, 592)], outline=(199, 4, 43, 80), width=1)

# Fit trimmed logo nicely in center
og_logo_w = 720
og_logo_h = int(im_trimmed.height * (og_logo_w / im_trimmed.width))
og_logo = im_trimmed.resize((og_logo_w, og_logo_h), Image.Resampling.LANCZOS)
og.paste(og_logo, ((1200 - og_logo_w) // 2, (630 - og_logo_h) // 2 - 20), og_logo)

# Subtitle
try:
    font_sub = ImageFont.truetype(str(ROOT / "branding" / "_fonts" / "Inter-Medium.ttf"), 20)
except Exception:
    font_sub = ImageFont.load_default()

text_sub = "HERITAGE INDIAN DESIGNER WEAR · HYDERABAD"
try:
    bbox_sub = draw_og.textbbox((0, 0), text_sub, font=font_sub)
    sub_w = bbox_sub[2] - bbox_sub[0]
    draw_og.text(((1200 - sub_w) // 2, (630 - og_logo_h) // 2 + og_logo_h + 30), text_sub, fill=(110, 80, 50, 220), font=font_sub)
except Exception as e:
    print(f"Subtitle warning: {e}")

og.save(PUBLIC_SOCIAL / "og-default-1200x630.png", format="PNG", optimize=True)
og.save(BRANDING_SOCIAL / "og-default-1200x630.png", format="PNG", optimize=True)

print("[SUCCESS] All Dheerah branding assets generated successfully!")
