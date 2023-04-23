import { FirestoreJSONObject } from '../utils/utils';

/** Player Elo Info
  * All the info about the elo that end up in a sub-collection inside user's document
  * So those data are for one user in a certain game
  */
export interface EloInfo extends FirestoreJSONObject {

    currentElo: number; // elo of player for a certain game

    numberOfGamePlayed: number; // the number of game played is needed to calculate the K
}
