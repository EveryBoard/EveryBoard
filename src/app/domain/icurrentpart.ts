import firebase from 'firebase';
import { FirebaseJSONObject, JSONValueWithoutArray } from 'src/app/utils/utils';
import { Request } from './request';
import { DomainWrapper } from './DomainWrapper';
import { Time } from './Time';

export interface IPart extends FirebaseJSONObject {
    readonly typeGame: NonNullable<string>, // the type of game
    readonly playerZero: NonNullable<string>, // the id of the first player
    readonly turn: NonNullable<number>, // -1 means the part has not started, 0 is the initial turn
    readonly result: NonNullable<IMGPResult>,
    // TODO: should be ReadonlyArray, but does not compile with it!
    readonly listMoves: NonNullable<Array<JSONValueWithoutArray>>,

    readonly playerOne?: string, // the id of the second player
    /* Server time being handled on server by firestore, when we send it, it's a FieldValue
     * so firebase write the server time and send us back a timestamp in the form of Time
     */
    readonly beginning?: firebase.firestore.FieldValue | Time,
    readonly lastMoveTime?: firebase.firestore.FieldValue | Time | null,
    readonly remainingMsForZero?: number;
    readonly remainingMsForOne?: number;
    readonly winner?: string,
    readonly loser?: string,
    readonly scorePlayerZero?: number | null,
    readonly scorePlayerOne?: number | null,
    readonly request?: Request | null, // can be null because we should be able to remove a request
}

export class Part implements DomainWrapper<IPart> {
    public constructor(public readonly doc: IPart) {
    }
    public getTurn(): number {
        return this.doc.turn;
    }
    public isDraw(): boolean {
        return this.doc.result === MGPResult.DRAW.value;
    }
    public isWin(): boolean {
        return this.doc.result === MGPResult.VICTORY.value;
    }
    public isTimeout(): boolean {
        return this.doc.result === MGPResult.TIMEOUT.value;
    }
    public isResign(): boolean {
        return this.doc.result === MGPResult.RESIGN.value;
    }
    public getWinner(): string | undefined {
        return this.doc.winner;
    }
    public getLoser(): string | undefined {
        return this.doc.loser;
    }
    public setWinnerAndLoser(winner: string, loser: string): Part {
        return new Part({ ...this.doc, winner, loser });
    }
}
export interface ICurrentPartId {

    id: string;

    doc: IPart;
}
export type IMGPResult = number;
export class MGPResult {
    public static readonly DRAW: MGPResult = new MGPResult(0);

    public static readonly RESIGN: MGPResult = new MGPResult(1);

    public static readonly ESCAPE: MGPResult = new MGPResult(2);

    public static readonly VICTORY: MGPResult = new MGPResult(3);

    public static readonly TIMEOUT: MGPResult = new MGPResult(4);

    public static readonly UNACHIEVED: MGPResult = new MGPResult(5);

    public static readonly AGREED_DRAW: MGPResult = new MGPResult(6);

    private constructor(public readonly value: IMGPResult) {}
}

