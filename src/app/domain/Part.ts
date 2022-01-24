import { assert, FirebaseJSONObject, JSONValueWithoutArray, Utils } from 'src/app/utils/utils';
import { Request } from './Request';
import { FirebaseTime } from './Time';
import { MGPOptional } from '../utils/MGPOptional';
import { FirebaseDocument } from '../dao/FirebaseFirestoreDAO';

interface LastUpdateInfo extends FirebaseJSONObject {
    readonly index: number,
    readonly player: number,
}
export interface Part extends FirebaseJSONObject {
    readonly lastUpdate: LastUpdateInfo,
    readonly typeGame: string, // the type of game
    readonly playerZero: string, // the id of the first player
    readonly turn: number, // -1 means the part has not started, 0 is the initial turn
    readonly result: IMGPResult,
    readonly listMoves: ReadonlyArray<JSONValueWithoutArray>,

    readonly playerOne?: string, // the id of the second player
    /* Server time being handled on server by firestore, when we send it, it's a FieldValue
     * so firebase write the server time and send us back a timestamp in the form of Time
     */
    readonly beginning?: FirebaseTime,
    readonly lastMoveTime?: FirebaseTime,
    readonly remainingMsForZero?: number;
    readonly remainingMsForOne?: number;
    readonly winner?: string,
    readonly loser?: string,
    readonly scorePlayerZero?: number,
    readonly scorePlayerOne?: number,
    readonly request?: Request | null, // can be null because we should be able to remove a request
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

export class PartDocument implements FirebaseDocument<Part> {
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
    public getDrawAccepter(): string {
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
    public getWinner(): MGPOptional<string> {
        return MGPOptional.ofNullable(this.data.winner);
    }
    public getLoser(): MGPOptional<string> {
        return MGPOptional.ofNullable(this.data.loser);
    }
    public setWinnerAndLoser(winner: string, loser: string): PartDocument {
        return new PartDocument(this.id, { ...this.data, winner, loser });
    }
}

export type IMGPResult = number;
