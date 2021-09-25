export enum SCORE {

    VICTORY = 'VICTORY',
    /* VICTORY is the status of a game that is won (independent of the turn);
     *     so a GameState with ownValue of MAX_SAFE_INTEGER or MIN_SAFE_INTEGER
     */

    PRE_VICTORY = 'PRE_VICTORY',
    /* PRE_VICTORYis the status of a game where the actual player could win this turn (turn dependant)
     *   so if a human don't see it the game aint over, but the AI will surely see it
     */

    DEFAULT = 'DEFAULT'
    // In all other case

}
