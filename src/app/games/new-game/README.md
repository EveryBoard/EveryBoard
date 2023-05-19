# Implementation steps
To create a new game named `foo`:

  - Create the directory `src/app/games/foo/`
  - Copy the files from this directory into `src/app/games/foo/`, renaming them accordingly. For example, `NewGameMove.ts` becomes `FooMove.ts`.
  - Rename the classes accordingly.
  - Implement the game (see [recommended order](#recommended-order-of-definition) below)
    while at the same time developing tests for it.


# Recommended order of definition
Recommended order to define your game:

  - Move
  - State
  - Rules
  - Component
  - Tutorial
