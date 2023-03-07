import { FirestoreJSONObject, JSONValue, Utils } from 'src/app/utils/utils';
import { assert } from '../utils/assert';
import { FirestoreTime } from './Time';
import { MinimalUser } from './MinimalUser';
import { FirestoreDocument } from '../dao/FirestoreDAO';
import { MGPOptional } from '../utils/MGPOptional';

interface LastUpdateInfo extends FirestoreJSONObject {
    readonly index: number,
    readonly player: number,
}

export interface Part extends FirestoreJSONObject {
    readonly lastUpdate: LastUpdateInfo,
    readonly typeGame: string, // the type of game
    readonly playerZero: MinimalUser, // the first player
    readonly turn: number, // -1 means the part has not started, 0 is the initial turn
    readonly result: IMGPResult,

    readonly playerOne?: MinimalUser, // the second player
    /* Server time being handled on server by firestore, when we send it, it's a FieldValue
     * so firebase write the server time and send us back a timestamp in the form of Time
     */
    readonly beginning?: FirestoreTime,
    readonly lastUpdateTime?: FirestoreTime,
    readonly remainingMsForZero?: number;
    readonly remainingMsForOne?: number;
    readonly winner?: MinimalUser,
    readonly loser?: MinimalUser,
    readonly scorePlayerZero?: number,
    readonly scorePlayerOne?: number,

    // Extra fields as sub-collections:
    // events: subcollection of PartEvent
}

type EventType = 'Move' | 'Request' | 'Reply' | 'Action';

export interface PartEvent extends FirestoreJSONObject {
    readonly eventType: EventType
    readonly time: FirestoreTime
    readonly player: 0 | 1
}

export interface PartEventMove extends PartEvent {
    readonly eventType: 'Move'
    readonly move: JSONValue
}

export type Action = 'AddTurnTime' | 'AddGlobalTime'
export interface PartEventAction extends PartEvent {
    readonly eventType: 'Action'
    readonly action: Action
}

export type RequestType = 'Draw' | 'Rematch' | 'TakeBack'
export interface PartEventRequest extends PartEvent {
    readonly eventType: 'Request'
    readonly requestType: RequestType
}

export type Reply = 'Accept' | 'Reject'
export interface PartEventReply extends PartEvent {
    readonly eventType: 'Reply'
    readonly reply: Reply
    readonly requestType: RequestType
    readonly data: JSONValue,
}

export class MGPResult {
    public static readonly HARD_DRAW: MGPResult = new MGPResult(0);

    public static readonly RESIGN: MGPResult = new MGPResult(1);

    public static readonly ESCAPE: MGPResult = new MGPResult(2);

    public static readonly VICTORY: MGPResult = new MGPResult(3);

    public static readonly TIMEOUT: MGPResult = new MGPResult(4);

    public static readonly UNACHIEVED: MGPResult = new MGPResult(5);

    public static readonly AGREED_DRAW_BY_ZERO: MGPResult = new MGPResult(6);

    public static readonly AGREED_DRAW_BY_ONE: MGPResult = new MGPResult(7);

    private constructor(public readonly value: IMGPResult) {}
}

export class PartDocument implements FirestoreDocument<Part> {
    public constructor(public readonly id: string,
                       public data: Part) {
    }
    public getTurn(): number {
        return this.data.turn;
    }
    public isHardDraw(): boolean {
        return this.data.result === MGPResult.HARD_DRAW.value;
    }
    public isAgreedDraw(): boolean {
        return this.data.result === MGPResult.AGREED_DRAW_BY_ZERO.value ||
               this.data.result === MGPResult.AGREED_DRAW_BY_ONE.value;
    }
    public getDrawAccepter(): MinimalUser {
        if (this.data.result === MGPResult.AGREED_DRAW_BY_ZERO.value) {
            return this.data.playerZero;
        } else {
            assert(this.data.result === MGPResult.AGREED_DRAW_BY_ONE.value, 'should not access getDrawAccepter when no draw accepted!');
            return Utils.getNonNullable(this.data.playerOne);
        }
    }
    public isWin(): boolean {
        return this.data.result === MGPResult.VICTORY.value;
    }
    public isTimeout(): boolean {
        return this.data.result === MGPResult.TIMEOUT.value;
    }
    public isResign(): boolean {
        return this.data.result === MGPResult.RESIGN.value;
    }
    public getWinner(): MGPOptional<MinimalUser> {
        return MGPOptional.ofNullable(this.data.winner);
    }
    public getLoser(): MGPOptional<MinimalUser> {
        return MGPOptional.ofNullable(this.data.loser);
    }
    public setWinnerAndLoser(winner: MinimalUser, loser: MinimalUser): PartDocument {
        return new PartDocument(this.id, { ...this.data, winner, loser });
    }
}

export type IMGPResult = number;
