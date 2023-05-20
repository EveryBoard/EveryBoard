/rules: the firebase database security rules
/scripts: various maintenance scripts
/src
    /app
        /components: the Angular components
            /game-components: the abstract class that NewGameComponent must implements
            /normal-component: the non-game component, such as chat, lobby, register
            /wrapper-components: the actual components that wrap instances of GameComponents (tuto, local, online)
        /dao: the data access objects
        /domain: the data transfer object and data models
        /games: the games
        /guard: the guards
        /jscaip: the game related classes common to each games (used all over the project)
/transations: the translations file
