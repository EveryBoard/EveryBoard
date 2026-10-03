# Implementation steps
To create a new game named `foo`:

  - Create the directory `src/app/games/foo/`
  - Copy the files from this directory into `src/app/games/foo/`, renaming them accordingly. For example, `NewGameMove.ts` becomes `FooMove.ts`.
  - Rename the classes accordingly.
  - Implement the game (see [recommended order](#recommended-order-of-definition) below)
    while at the same time developing tests for it.
    The source files in this directory should contain enough documentation to implement most games.
  - Import `FooComponent` in `src/app/app.module.ts`, in the alphabetical order with the other games components, and add it to the `declarations` section of the `@NgModule` directive.
  - Import `FooComponent` in `pick-game.component.spec.ts`, following the alphabetical order. Add it at the end of `GameInfo.ALL_GAMES`
  - For each method in the game component that can be activated by user interaction, they should check that the current player is allowed to interact with the component by calling `this.canUserPlay(id)` where `id` is the id of the HTML element that was interacted with. This method returns a `MGPValidation` that should be passed to `cancelMove` in case of failure.
  - List these interaction methods in `GameComponent.spec.ts`, in the test called `clicks method should fail when an observer clicks`.
  
It is recommended to look at existing game's implementation for more details.

# Recommended order of definition
Recommended order to define your game:

  - Move
  - State
  - Rules
  - Component
  - Tutorial
  - Optional: minimax(es)
