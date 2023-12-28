#!/usr/bin/python3
from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.by import By
import os
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

options = Options()
options.add_argument('--headless')
driver = webdriver.Chrome(options=options)

games = []
with open('scripts/games.txt') as f:
    games = f.read().splitlines()

for game in games:
    print('Screenshotting ' + game)
    driver.get('http://localhost:4200/local/' + game)
    try:
        # Click on "accept config" for configurable games
        accept_config_button = driver.find_element(By.ID, "startGameWithConfig")
        accept_config_button.click()
    except NoSuchElementException:
        # No accept config button, the game is not configurable so we are directly on the right page
        pass
    image = driver.find_element(By.ID, "board").screenshot_as_png
    f = open(game + '.png', 'wb')
    f.write(image)
    f.close()
