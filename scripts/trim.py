#!/usr/bin/python3
from PIL import Image
import sys

if len(sys.argv) != 2:
    print('I need an image file path as argument')

image_path = sys.argv[1]
print('Trimming %s' % image_path)

im = Image.open(image_path).convert("RGB")
pixels = im.load()
w, h = im.size

def is_dark_or_light(rgb, tolerance=26): # we currently have 0x14161a as a dark color, and 0x1a is 26
    r, g, b = rgb
    dark = tolerance
    light = 255 - tolerance
    if r <= dark and g <= dark and b <= dark:
        return True
    if r >= light and g >= light and b >= light:
        return True
    return False

def row_is_border(y):
    for x in range(w):
        if is_dark_or_light(pixels[x, y]):
            return False
    return True

def col_is_border(x):
    for y in range(h):
        if is_dark_or_light(pixels[x, y]):
            return False
    return True

top = 0
while top < h and row_is_border(top):
    top += 1

bottom = h - 1
while bottom >= 0 and row_is_border(bottom):
    bottom -= 1

left = 0
while left < w and col_is_border(left):
    left += 1

right = w - 1
while right >= 0 and col_is_border(right):
    right -= 1

cropped = im.crop((left, top, right + 1, bottom + 1))
cropped.save(image_path)
