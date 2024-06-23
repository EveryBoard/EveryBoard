from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
import random
import string
import time

# Set to False to see the script happening in real time. Useful for debugging
HEADLESS = True
# Set to True if somehow the selenium driver is acting like a mobile device (with small screen)
# It seems to be the case when we are in headless mode, so let's just inherit the value of HEADLESS
MOBILE = HEADLESS
USER_RESPONSE_TIME=0.2 # A typical user cannot click faster than once every 200ms

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
        # Force a small wait to mimick a real user. This is to stabilize these tests a bit more
        time.sleep(USER_RESPONSE_TIME)
        wait = WebDriverWait(driver, 10) # wait up to 10s to find the element
        button = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))
        button.click()
    except Exception as e:
        print("Failed when clicking on button '{}'".format(selector))
        raise e

def click_menu_button(driver, hover_selector, button_selector):
    try:
        if MOBILE:
            click_button(driver, '.navbar-burger')
        else:
            wait = WebDriverWait(driver, 10) # wait up to 10s to find the element
            hover = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, hover_selector)))
            actions = ActionChains(driver)
            actions.move_to_element(hover).perform()
        click_button(driver, button_selector)
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

def wait_for_presence_of(driver, selector):
    try:
        wait = WebDriverWait(driver, 10)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))
    except Exception as e:
        print("Failed when checking presence of element '{}'".format(selector))
        # Display the page for debugging purposes
        print(driver.find_element(By.CSS_SELECTOR, "body").get_attribute('innerHTML'))
        raise e

def register(driver, email, username, password):
    """Registers the user by filling in the registration form"""
    driver.get("http://localhost:4200")
    # Access registration page
    if MOBILE:
        click_button(driver, '.navbar-burger')
    click_button(driver, "#register")

    # Fill in registration form
    fill_field(driver, "#email", email)
    fill_field(driver, "#username", username)
    fill_field(driver, "#password", password)

    # Click on registration button
    click_button(driver, "#registerButton")

    # Click on finalize verification button
    time.sleep(0.5) # Wait for the email verification to be done by the other script
    click_button(driver, "#finalizeVerification")

def access_game_list(driver):
    """Accesses the list of games"""
    # Go back to the main page
    click_button(driver, "#logo")

    # Go to the lobby
    click_button(driver, "#seeGameList")

    # Now I should see the game list (this will throw it if does not find it)
    wait_for_presence_of(driver, '#game-list-tab')

def logout(driver):
    """Logs the current user out"""
    # Just click on the logout button
    click_menu_button(driver, "#connectedUserName", "#logout")

def login(driver, email, password):
    # Go to the login page
    if MOBILE:
        click_button(driver, '.navbar-burger')
    click_button(driver, "#login")

    # Fill in the form
    fill_field(driver, "#email", email)
    fill_field(driver, "#password", password)

    # Log in
    click_button(driver, "#loginButton")

def use_default_config(driver):
    try:
        # Click on "accept config" for configurable games
        accept_config_button = driver.find_element(By.ID, "startGameWithConfig")
        accept_config_button.click()
    except:
        # Games that do not have startGameWithConfig, not configuirable so we already use the default config
        pass

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
    click_menu_button(driver, "#playOffline", "#tutorial")
    select(driver, "#gameType", "Four in a Row")
    click_button(driver, "#launchTutorial")

    # First step does not require any move, so just click ok
    click_button(driver, "#nextButton")

    # In the second step I should play something, so I just do it
    click_button(driver, "#click-3-0 > rect")
    click_button(driver, "#nextButton")

    # The third step requires me to win, so I do it
    click_button(driver, "#click-1-0 > rect")
    click_button(driver, "#nextButton")

    # The final step also requires me to win
    click_button(driver, "#click-4-0 > rect")
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
    click_menu_button(driver, "#playOffline", "#playLocally")
    select(driver, "#gameType", "Four in a Row")
    click_button(driver, "#launchGame")
    use_default_config(driver)

    # Stupid game between player 0 and 1, where 0 wins
    click_button(driver, "#click-3-0 > rect")
    click_button(driver, "#click-2-0 > rect")
    click_button(driver, "#click-3-0 > rect")
    click_button(driver, "#click-2-0 > rect")
    click_button(driver, "#click-3-0 > rect")
    click_button(driver, "#click-2-0 > rect")
    click_button(driver, "#click-3-0 > rect")

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
    click_menu_button(driver, "#playOffline", "#playLocally")
    select(driver, "#gameType", "Four in a Row")
    click_button(driver, "#launchGame")
    use_default_config(driver)

    # Select the AI as second player
    select(driver, "#playerOneSelect", "Minimax")
    select(driver, "#aiOneOptionSelect", "Level 1")

    # I play a move
    click_button(driver, "#click-2-0 > rect")

    # Let AI play
    time.sleep(2) # Two seconds should be more than enough

    # AI should have played a second move, I can play again
    click_button(driver, "#click-1-0 > rect")

    # Now there should be a piece in #click-1-5
    wait_for_presence_of(driver, "#click-1-5 > circle")

@scenario("two_drivers")
def can_create_part_and_play(driver1, username1, driver2, username2):
    """
    Role: We are two registered users
    Action: We create and play a full game
    Result: We see who has won
    """
    # Player 1 creates the part
    click_button(driver1, "#createOnlineGame")
    select(driver1, "#gameType", "Four in a Row")
    click_button(driver1, "#launchGame")

    # Player 1 configures the part
    click_button(driver1, "#firstPlayerCreator") # Player 1 will start

    # Player 2 joins the part
    click_button(driver2, "#seeGameList")
    click_button(driver2, "#part-0 > td")

    # Player 1 sees player 2 arrive and selects them
    click_button(driver1, "#presenceOf_{}".format(username2))
    click_button(driver1, "#proposeConfig")

    # Player 2 accepts
    click_button(driver2, "#acceptConfig")

    # Now we are in the game!
    # Let's play it until the end
    # First, reload the page to avoid a potential bug (temporary, we can remove this once the bug is fixed)
    time.sleep(1)
    driver1.get(driver1.current_url)
    wait_for_presence_of(driver1, "#playerTurn")
    click_button(driver1, "#click-3-0 > rect")
    wait_for_presence_of(driver2, "#playerTurn")
    click_button(driver2, "#click-2-0 > rect")
    wait_for_presence_of(driver1, "#playerTurn")
    click_button(driver1, "#click-3-0 > rect")
    wait_for_presence_of(driver2, "#playerTurn")
    click_button(driver2, "#click-2-0 > rect")
    wait_for_presence_of(driver1, "#playerTurn")
    click_button(driver1, "#click-3-0 > rect")
    wait_for_presence_of(driver2, "#playerTurn")
    click_button(driver2, "#click-2-0 > rect")
    wait_for_presence_of(driver1, "#playerTurn")
    click_button(driver1, "#click-3-0 > rect")

    # Now player 1 has won
    wait_for_presence_of(driver1, "#youWonIndicator")
    wait_for_presence_of(driver2, "#youLostIndicator")

def launch_scenarios():
    """Launches all the scenarios, stop at the first one that fails"""
    options = Options()
    if HEADLESS:
        options.add_argument('-headless')
    driver = webdriver.Chrome(options=options)
    #driver.get("http://localhost:4200")

    for simple_scenario in scenarios["simple"]:
        # Always go back home for a new scenario
        driver.get("http://localhost:4200")
        print("Running scenario: " + simple_scenario.__name__)
        simple_scenario(driver)

    # Now we need a registered account
    username = ''.join(random.choices(string.ascii_uppercase + string.digits, k=16))
    email = username + '@everyboard.org'
    password = ''.join(random.choices(string.ascii_uppercase + string.digits, k=16))

    register(driver, email, username, password)
    for registered_scenario in scenarios["registered"]:
        driver.get("http://localhost:4200")
        print("Running scenario: " + registered_scenario.__name__)
        registered_scenario(driver, username, email, password)

    # Now we need another driver
    driver2 = webdriver.Chrome(options=options)
    username2 = ''.join(random.choices(string.ascii_uppercase + string.digits, k=16))
    email2 = username2 + '@everyboard.org'
    password2 = ''.join(random.choices(string.ascii_uppercase + string.digits, k=16))
    register(driver2, email2, username2, password2)
    for two_drivers_scenario in scenarios["two_drivers"]:
        driver.get("http://localhost:4200")
        driver2.get("http://localhost:4200")
        print("Running scenario: " + two_drivers_scenario.__name__)
        two_drivers_scenario(driver, username, driver2, username2)

    driver.close()
    driver2.close()

if __name__ == "__main__":
    launch_scenarios()
