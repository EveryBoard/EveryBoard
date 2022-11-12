from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
import random
import string
import time

def fill_field(driver, selector, content):
    try:
        wait = WebDriverWait(driver, 10) # wait up to 10s to find the element
        input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))
        input.clear()
        input.send_keys(content)
    except Exception as e:
        print("Failed when filling in field '{}'".format(selector))
        raise e

def click_button(driver, selector):
    try:
        print("Clicking button: {}".format(selector))
        wait = WebDriverWait(driver, 10) # wait up to 10s to find the element
        button = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))
        button.click()
    except Exception as e:
        print("Failed when clicking on button '{}'".format(selector))
        raise e

def click_button_after_hover(driver, hover_selector, button_selector):
    try:
        wait = WebDriverWait(driver, 10) # wait up to 10s to find the element
        hover = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, hover_selector)))
        actions = ActionChains(driver)
        actions.move_to_element(hover).perform()
        driver.find_element(By.CSS_SELECTOR, button_selector).click()
    except Exception as e:
        print("Failed when hovering over '{}' and clicking on button '{}'".format(hover_selector, button_selector))
        raise e

def select(driver, selector, selection):
    try:
        wait = WebDriverWait(driver, 10) # wait up to 10s to find the element
        element = Select(wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, selector))))
        element.select_by_visible_text(selection)
    except Exception as e:
        print("Failed when selecting from drop down '{}'".format(selector))
        raise e

def check_presence_of(driver, selector):
    try:
        wait = WebDriverWait(driver, 10)
        element = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))
    except Exception as e:
        print("failed when checking presence of element '{}'".format(selector))
        raise e

def register(driver, email, username, password):
    """Registers the user by filling in the registration form"""
    # Access registration page
    click_button(driver, "#register")

    # Fill in registration form
    fill_field(driver, "#email", email)
    fill_field(driver, "#username", username)
    fill_field(driver, "#password", password)

    # Click on registration button
    click_button(driver, "#registerButton")

    # Click on finalize verification button
    click_button(driver, "#finalizeVerification")

def access_game_list(driver):
    """Accesses the list of games"""
    # Go back to the main page
    click_button(driver, "#home")

    # Go to the lobby
    click_button(driver, "#seeGameList")

    # Now I should see the game list (this will throw it if does not find it)
    check_presence_of(driver, '#actualGames')

def logout(driver):
    """Logs the current user out"""
    # Just click on the logout button
    click_button_after_hover(driver, "#connectedUserName", "#logout")

def login(driver, email, password):
    # Go to the login page
    click_button(driver, "#login")

    # Fill in the form
    fill_field(driver, "#email", email)
    fill_field(driver, "#password", password)

    # Log in
    click_button(driver, "#loginButton")

def scenario(kind):
    def decorator(func):
        scenarios[kind] = [func] + scenarios[kind]
    return decorator

scenarios = {
    "simple": [],
    "registered": [],
    "two_drivers": [],
}

@scenario("registered")
def can_access_lobby_after_registration(driver, username, email, password):
    """
    Role: I am a logged in user
    Action: I try to access the lobby
    Result: It works
    """
    access_game_list(driver)

@scenario("registered")
def can_logout_and_login(driver, username, email, password):
    """
    Role: I am a registered and logged in user
    Action: I want to be able to log out and log back in
    Result: I am logged in and I can again access the lobby
    """
    logout(driver)
    login(driver, email, password)
    access_game_list(driver)

@scenario("simple")
def can_play_tutorial(driver):
    """
    Role: I am a visitor
    Action: I play the four in a row tutorial
    Result: I can complete it fully
    """
    # Launch the tutorial
    click_button_after_hover(driver, "#playOffline", "#tutorial")
    select(driver, "#gameType", "Four in a Row")
    click_button(driver, "#launchTutorial")

    # First step does not require any move, so just click ok
    click_button(driver, "#nextButton")

    # In the second step I should play something, so I just do it
    click_button(driver, "#click_3 > rect")
    click_button(driver, "#nextButton")

    # The third step requires me to win, so I do it
    click_button(driver, "#click_1 > rect")
    click_button(driver, "#nextButton")

    # The final step also requires me to win
    click_button(driver, "#click_4 > rect")
    click_button(driver, "#nextButton")

    # Now I should have finished the tuto
    # And it should show a button to play locally
    driver.find_element(By.CSS_SELECTOR, "#playLocallyButton")

@scenario("simple")
def can_play_local_2_players(driver):
  """
  Scenario: I am a visitor
  Action: I play a game against a friend on the same computer
  Result: I can go until the end of the game
  """
  # Launch a game of four in a row
  click_button_after_hover(driver, "#playOffline", "#playLocally")
  select(driver, "#gameType", "Four in a Row")
  click_button(driver, "#launchGame")

  # Stupid game between player 0 and 1, where 0 wins
  click_button(driver, "#click_3 > rect")
  click_button(driver, "#click_2 > rect")
  click_button(driver, "#click_3 > rect")
  click_button(driver, "#click_2 > rect")
  click_button(driver, "#click_3 > rect")
  click_button(driver, "#click_2 > rect")
  click_button(driver, "#click_3 > rect")

  # Now 0 won
  winner = driver.find_element(By.ID, "gameResult").text
  if winner != "Player 1 won":
      raise Exception("failed: text should be {}".format(winner))

@scenario("simple")
def can_play_local_vs_ai(driver):
  """
  Scenario: I am a visitor
  Action: I play a game against the AI
  Result: The AI plays its move and I can play again
  """

  # Launch a game of four in a row
  click_button_after_hover(driver, "#playOffline", "#playLocally")
  select(driver, "#gameType", "Four in a Row")
  click_button(driver, "#launchGame")

  # Select the AI as second player
  select(driver, "#playerOneSelect", "P4Minimax")
  select(driver, "#aiOneDepthSelect", "Level 1")

  # I play a move
  click_button(driver, "#click_2 > rect")

  # Let AI play
  time.sleep(2) # Two seconds should be more than enough

  # AI should have played a second move, I can play again
  click_button(driver, "#click_1 > rect")

  # Now there should be a piece in #click_1
  check_presence_of(driver, "#click_1 > circle")

@scenario("two_drivers")
def can_create_part_and_play(driver1, username1, driver2, username2):
  # Player 1 creates the part
  click_button(driver1, "#createOnlineGame")
  select(driver1, "#gameType", "Four in a Row")
  click_button(driver1, "#launchGame")

  # Player 2 joins the part
  click_button(driver2, "#seeGameList")
  click_button(driver2, "#part_0")

  # Player 1 sees player 2 arrive and selects them
  click_button(driver1, "#presenceOf_{}".format(username1))

  # Player 2 accepts
  click_button(driver2, "#acceptConfig")

  # Now we are in the game!
  # Let's play it until the end
  click_button(driver1, "#click_3 > rect")
  check_presence_of(driver2, "#playerTurn")
  click_button(driver2, "#click_2 > rect")
  check_presence_of(driver1, "#playerTurn")
  click_button(driver1, "#click_3 > rect")
  check_presence_of(driver2, "#playerTurn")
  click_button(driver2, "#click_2 > rect")
  check_presence_of(driver1, "#playerTurn")
  click_button(driver1, "#click_3 > rect")
  check_presence_of(driver2, "#playerTurn")
  click_button(driver2, "#click_2 > rect")
  check_presence_of(driver1, "#playerTurn")
  click_button(driver1, "#click_3 > rect")

  # Now player 1 has won
  check_presence_of(driver1, "#youWonIndicator")
  check_presence_of(driver2, "#youLostIndicator")

def launch_scenarios():
    """Launches all the scenarios, stop at the first one that fails"""
    options = Options()
    # options.headless = True # Turn this off to see the script happening in real time. Useful for debugging
    driver = webdriver.Firefox(options=options)
    #driver.get("http://localhost:4200")

    for simple_scenario in scenarios["simple"]:
        # Always go back home for a new scenario
        driver.get("http://localhost:4200")
        # TODO simple_scenario(driver)

    # Now we need a registered account
    username = ''.join(random.choices(string.ascii_uppercase + string.digits, k=16))
    email = username + '@everyboard.org'
    password = ''.join(random.choices(string.ascii_uppercase + string.digits, k=16))

    driver.get("http://localhost:4200")
    register(driver, email, username, password)
    for registered_scenario in scenarios["registered"]:
        driver.get("http://localhost:4200")
        # TODO registered_scenario(driver, username, email, password)

    # Now we need another driver
    driver2 = webdriver.Firefox(options=options)
    username2 = ''.join(random.choices(string.ascii_uppercase + string.digits, k=16))
    email2 = username2 + '@everyboard.org'
    password2 = ''.join(random.choices(string.ascii_uppercase + string.digits, k=16))
    driver2.get('http://localhost:4200')
    register(driver2, email2, username2, password2)
    for two_drivers_scenarios in scenarios["two_drivers"]:
        driver.get("http://localhost:4200")
        driver2.get("http://localhost:4200")
        two_drivers_scenarios(driver, username, driver2, username)

    driver.close()
    driver2.close()

if __name__ == "__main__":
    launch_scenarios()
