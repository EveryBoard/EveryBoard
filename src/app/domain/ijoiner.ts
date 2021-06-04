import { JSONObject } from '../utils/utils';
import { DomainWrapper } from './DomainWrapper';

export interface IJoiner extends JSONObject {
    readonly candidates: NonNullable<Array<string>>; // TODO: give default empty value
    readonly creator: NonNullable<string>;
    readonly chosenPlayer: NonNullable<string>; // TODO: make optional
    readonly whoStart?: string;
    readonly firstPlayer?: string; // TODO: take inspiration from request
    /* 0: the creator
     * 1: the chosenPlayer
     * 2: random
     */

    // TODO: make specific datatype for this
    partStatus: NonNullable<number>;
    /* 0 : part created, no chosenPlayer                                                               => waiting for acceptable candidate
     * 1 : part created, chosenPlayer selected, no config proposed                                     => waiting the creator to propose config
     * 2 : part created, chosenPlayer selected, config proposed by the creator                         => waiting the joiner to accept them
     * 3 : part created, chosenPlayer selected, config proposed by the created, accepted by the joiner => Part Started
     * 4 : part finished
     */

    // cancel feature for cause of smart phone bugs timeoutMinimalDuration: number;
    maximalMoveDuration?: number;
    totalPartDuration?: number;
}
export class Joiner implements DomainWrapper<IJoiner> {
    public constructor(public readonly doc: IJoiner) {
    }
}
export interface IJoinerId {

    id: string;

    doc: IJoiner;
}

// TODO: clean class and its used
export class FirstPlayer {

    private constructor(public value: string) {}

    public static readonly CREATOR: FirstPlayer = new FirstPlayer('CREATOR');

    public static readonly RANDOM: FirstPlayer = new FirstPlayer('RANDOM');

    public static readonly CHOSEN_PLAYER: FirstPlayer = new FirstPlayer('CHOSEN_PLAYER');

    public static of(value: string): FirstPlayer {
        switch (value) {
            case 'CREATOR': return FirstPlayer.CREATOR;
            case 'RANDOM': return FirstPlayer.RANDOM;
            case 'CHOSEN_PLAYER': return FirstPlayer.CHOSEN_PLAYER;
            default: throw new Error('Invalid value for FirstPlayer: ' + value + '.');
        }
    }

    public getOpponent(): FirstPlayer {
        switch (this) {
            case FirstPlayer.CREATOR: return FirstPlayer.CHOSEN_PLAYER;
            case FirstPlayer.CHOSEN_PLAYER: return FirstPlayer.CREATOR;
            default: throw new Error('getOpponent called on invalid first player');
        }
    }

}
