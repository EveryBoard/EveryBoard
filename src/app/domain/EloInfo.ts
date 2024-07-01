import { FirestoreJSONObject } from '../utils/utils';

/**
  * Player Elo Info
  * All the info about the elo that end up in a sub-collection inside the user's document
  * So this data is for one user in a certain game
  */
export interface EloInfo extends FirestoreJSONObject {

    currentElo: number; // elo of player for a certain game

    numberOfGamesPlayed: number; // the number of games played is needed to calculate the K
}
