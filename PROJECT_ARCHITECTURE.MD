/rules: the firebase database security rules
/scripts: scripts that we use to help, for devops
/src
    /app
        /components: where the components will be
            /game-components: the abstract class that NewGameComponent must implements
            /normal-component: the normal component, like chat, lobby, register and others
            /wrapper-components: the actual components that'll be wrapping instances of GameComponents (tuto, local, online)
        /dao: the data access objects
        /domain: the data transfer object and data models
        /games: where the class of every individual games will be gathered
        /guard: the guards
        /jsacip: the game related classes common to each games (but is used all over the project)
/transations: the translations file