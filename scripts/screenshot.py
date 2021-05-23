#!/usr/bin/python
from selenium import webdriver

from selenium.webdriver.chrome.options import Options

options = Options()
options.headless = True
driver = webdriver.Chrome(options=options)

games = ['Awale',
        'Coerceo',
        'Dvonn',
        'Encapsule',
        'Epaminondas',
        'Gipf',
        'Go',
        'Kamisado',
        'LinesOfAction',
        'P4',
        'Pylos',
        'Quarto',
        'Quixo',
        'Reversi',
        'Sahara',
        'Siam',
        'Six',
        'Tablut']

for game in games:
    print('Screenshotting ' + game)
    driver.get('http://localhost:4200/local/' + game)
    image = driver.find_element_by_id("board").screenshot_as_png
    f = open(game + '.png', 'wb')
    f.write(image)
    f.close()
