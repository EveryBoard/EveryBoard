export enum SCORE {

    VICTORY,
    /* VICTORY is the status of a game that is finished (independent of the turn);
     *   so a board with a ownValue of VICTORY mean that the game is finished
     */

    PRE_VICTORY,
    /* PRE_VICTORY pre - victory is the status of a game where the actual player could win this turn (turn dependant)
     *   so if a human don't see it the game aint over, but the AI will surely see it
     */

    DEFAULT
    // In all other case

}
