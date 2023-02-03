import { Player } from 'src/app/jscaip/Player';
import { assert } from 'src/app/utils/assert';
import { ComparableObject } from 'src/app/utils/Comparable';
import { Encoder } from 'src/app/utils/Encoder';
import { JSONValue, Utils } from 'src/app/utils/utils';

export type HivePieceKind = 'QueenBee' | 'Beetle' | 'Grasshopper' | 'Spider' | 'SoldierAnt';

export class HivePiece implements ComparableObject {

    public static encoder: Encoder<HivePiece> = new class extends Encoder<HivePiece> {

        public encode(piece: HivePiece): JSONValue {
            return { owner: piece.owner.value, kind: piece.kind };
        }

        public decode(encoded: JSONValue): HivePiece {
            // eslint-disable dot-notation
            assert(Utils.getNonNullable(encoded)['kind'] !== null, 'invalid encoded HivePiece');
            assert(Utils.getNonNullable(encoded)['owner'] !== null, 'invalid encoded HivePiece');
            const kind: HivePieceKind = Utils.getNonNullable(encoded)['kind'] as HivePieceKind;
            const owner: Player = Player.of(Utils.getNonNullable(encoded)['owner']);
            return new HivePiece(owner, kind);
            // eslint-enable dot-notation
        }
    };

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
        for (let i: number = 0; i < this.pieces.length; i++) {
            if (this.pieces[i].equals(other.pieces[i]) === false) {
                return false;
            }
        }
        return true;
    }

    public isEmpty(): boolean {
        return this.pieces.length === 0;
    }

    public add(piece: HivePiece): HivePieceStack {
        return new HivePieceStack([piece, ...this.pieces]);
    }

    public topPiece(): HivePiece {
        Utils.assert(this.isEmpty() === false, 'HivePieceStack: cannot get top piece of an empty stack');
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

    public containsPieceOf(player: Player) {
        for (const piece of this.pieces) {
            if (piece.owner === player) return true;
        }
        return false;
    }
}
