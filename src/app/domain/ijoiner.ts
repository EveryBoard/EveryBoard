import { JSONObject } from '../utils/utils';
import { DomainWrapper } from './DomainWrapper';

export interface IJoiner extends JSONObject {
    readonly candidates: NonNullable<Array<string>>; // TODO: give default empty value
    readonly creator: NonNullable<string>;
    readonly chosenPlayer: NonNullable<string>; // TODO: make optional
    readonly whoStart?: string;
    readonly firstPlayer?: IFirstPlayer;

    readonly partStatus: NonNullable<IPartStatus>;

    // cancel feature for cause of smart phone bugs timeoutMinimalDuration: number;
    readonly maximalMoveDuration?: number;
    readonly totalPartDuration?: number;
}
export class Joiner implements DomainWrapper<IJoiner> {
    public constructor(public readonly doc: IJoiner) {
    }
}
export interface IJoinerId {

    id: string;

    doc: IJoiner;
}

export type IFirstPlayer = 'CREATOR' | 'RANDOM' | 'CHOSEN_PLAYER';
export class FirstPlayer {

    private constructor(public value: IFirstPlayer) {}

    public static readonly CREATOR: FirstPlayer = new FirstPlayer('CREATOR');

    public static readonly RANDOM: FirstPlayer = new FirstPlayer('RANDOM');

    public static readonly CHOSEN_PLAYER: FirstPlayer = new FirstPlayer('CHOSEN_PLAYER');

    // TODO: remove the need for this? (only used once)
    public static of(value: string): FirstPlayer {
        switch (value) {
            case 'CREATOR': return FirstPlayer.CREATOR;
            case 'RANDOM': return FirstPlayer.RANDOM;
            case 'CHOSEN_PLAYER': return FirstPlayer.CHOSEN_PLAYER;
            default: throw new Error('Invalid value for FirstPlayer: ' + value + '.');
        }
    }
}

export type IPartStatus = number;
export class PartStatus {
    private constructor(public value: IPartStatus) {}
    // part created, no chosenPlayer => waiting for acceptable candidate
    public static PART_CREATED: PartStatus = new PartStatus(0);
    // part created, chosenPlayer selected, no config proposed => waiting the creator to propose config
    public static PLAYER_CHOSEN: PartStatus = new PartStatus(1);
    // part created, chosenPlayer selected, config proposed by the creator => waiting the joiner to accept them
    public static CONFIG_PROPOSED: PartStatus = new PartStatus(2);
    // part created, chosenPlayer selected, config proposed by the created, accepted by the joiner => part started
    public static PART_STARTED: PartStatus = new PartStatus(3);

    public static PART_FINISHED: PartStatus = new PartStatus(4);
}
