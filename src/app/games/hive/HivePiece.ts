import { Player } from 'src/app/jscaip/Player';
import { ArrayUtils } from '@everyboard/lib';
import { ComparableObject } from '@everyboard/lib';
import { Encoder } from '@everyboard/lib';
import { JSONValueWithoutArray, Utils } from '@everyboard/lib';

export type HivePieceKind = 'QueenBee' | 'Beetle' | 'Grasshopper' | 'Spider' | 'SoldierAnt';

const HivePieceKindEncoder: Encoder<HivePieceKind> =
    Encoder.fromFunctions(
        (value: HivePieceKind) => value,
        (json: JSONValueWithoutArray) => json as HivePieceKind);

export class HivePiece implements ComparableObject {

    public static encoder: Encoder<HivePiece> = Encoder.tuple(
        [Player.encoder, HivePieceKindEncoder],
        (piece: HivePiece): [Player, HivePieceKind] => [piece.owner, piece.kind],
        (fields: [Player, HivePieceKind]): HivePiece => new HivePiece(fields[0], fields[1]),
    );
    public constructor(public readonly owner: Player, public readonly kind: HivePieceKind) {
    }
    public toString(): string {
        return `${this.kind}_${this.owner.toString()}`;
    }
    public equals(other: HivePiece): boolean {
        return this.owner === other.owner && this.kind === other.kind;
    }
}

export class HivePieceStack implements ComparableObject {

    public static EMPTY: HivePieceStack = new HivePieceStack([]);

    public constructor(public readonly pieces: HivePiece[]) {
    }
    public equals(other: HivePieceStack): boolean {
        if (this.size() !== other.size()) return false;
        return ArrayUtils.compare(this.pieces, other.pieces);
    }
    public isEmpty(): boolean {
        return this.pieces.length === 0;
    }
    public hasPieces(): boolean {
        return this.isEmpty() === false;
    }
    public add(piece: HivePiece): HivePieceStack {
        return new HivePieceStack([piece, ...this.pieces]);
    }
    public topPiece(): HivePiece {
        Utils.assert(this.hasPieces(), 'HivePieceStack: cannot get top piece of an empty stack');
        return this.pieces[0];
    }
    public removeTopPiece(): HivePieceStack {
        const pieces: HivePiece[] = [...this.pieces];
        pieces.shift();
        return new HivePieceStack(pieces);
    }
    public size(): number {
        return this.pieces.length;
    }
}
