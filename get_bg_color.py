from PIL import Image
from collections import Counter

def get_dominant_color(image_path):
    img = Image.open(image_path)
    img = img.resize((50, 50))  # Resize to speed up
    pixels = list(img.getdata())
    # Count pixels
    counter = Counter(pixels)
    # Most common colors
    most_common = counter.most_common(5)
    print("Most common colors (RGB):", most_common)
    
get_dominant_color("images/Loopy logo.jpeg")
