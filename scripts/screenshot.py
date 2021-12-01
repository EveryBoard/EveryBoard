#!/usr/bin/python3
from selenium import webdriver
import os
from selenium.webdriver.chrome.options import Options

options = Options()
options.headless = True
driver = webdriver.Chrome(os.getenv('CHROME_PATH'), options=options)

games = []
with open('scripts/games.txt') as f:
    games = f.read().splitlines()

for game in games:
    print('Screenshotting ' + game)
    driver.get('http://localhost:4200/local/' + game)
    image = driver.find_element_by_id("board").screenshot_as_png
    f = open(game + '.png', 'wb')
    f.write(image)
    f.close()
