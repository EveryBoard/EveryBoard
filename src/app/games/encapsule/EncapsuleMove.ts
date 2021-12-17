import { Move } from 'src/app/jscaip/Move';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { EncapsulePiece } from './EncapsulePiece';
import { NumberEncoder } from 'src/app/jscaip/Encoder';

export class EncapsuleMove extends Move {
    public static encoder: NumberEncoder<EncapsuleMove> = new class extends NumberEncoder<EncapsuleMove> {
        public maxValue(): number {
            const d: number = 1;
            const lx: number = 2;
            const ly: number = 2;
            const sx: number = 2;
            const sy: number = 2;
            return sx*54 + sy*18 + lx*6 + ly*2 + d;
        }
        public encodeNumber(move: EncapsuleMove): number {
            /* d: 0|1
             *     - 0: it's a drop
             *     - 1: it's a move
             * ly: 0|1|2
             * lx: 0|1|2
             * if it's a drop
             *     - piece: [0: 5]
             * if it's a move
             *     - sy: 0, 1, 2
             *     - sx: 0, 1, 2
             * donc :
             *     - piece;lx;ly;d
             *     - sx;sy;lx;ly;d
             */
            const lx: number = move.landingCoord.x;
            const ly: number = move.landingCoord.y;
            if (move.isDropping()) {
                const d: number = 0;
                const piece: number = move.piece.get().value;
                return (piece*18) + (lx*6) + (ly*2) + d;
            } else {
                const d: number = 1;
                const sy: number = move.startingCoord.get().y;
                const sx: number = move.startingCoord.get().x;
                return (sx*54) + (sy*18) + (lx*6) + (ly*2) + d;
            }
        }
        public decodeNumber(encodedMove: number): EncapsuleMove {
            const d: number = encodedMove%2;
            encodedMove -= d;
            encodedMove = encodedMove/2;
            const ly: number = encodedMove%3;
            encodedMove -= ly;
            encodedMove = encodedMove/3;
            const lx: number = encodedMove%3;
            encodedMove -= lx;
            encodedMove = encodedMove/3;
            const landingCoord: Coord = new Coord(lx, ly);
            if (d === 0) { // drop
                const piece: EncapsulePiece = EncapsulePiece.of(encodedMove);
                return EncapsuleMove.fromDrop(piece, landingCoord);
            } else {
                const sy: number = encodedMove%3;
                encodedMove -= sy;
                encodedMove = encodedMove/3;
                const sx: number = encodedMove%3;
                const startingCoord: Coord = new Coord(sx, sy);
                return EncapsuleMove.fromMove(startingCoord, landingCoord);
            }
        }
    }
    private constructor(public readonly startingCoord: MGPOptional<Coord>,
                        public readonly landingCoord: Coord,
                        public readonly piece: MGPOptional<EncapsulePiece>) {
        super();
    }
    public static fromMove(startingCoord: Coord, landingCoord: Coord): EncapsuleMove {
        if (startingCoord.equals(landingCoord)) {
            throw new Error('Starting coord and landing coord must be separate coords');
        }
        return new EncapsuleMove(MGPOptional.of(startingCoord), landingCoord, MGPOptional.empty());
    }
    public static fromDrop(piece: EncapsulePiece, landingCoord: Coord): EncapsuleMove {
        return new EncapsuleMove(MGPOptional.empty(), landingCoord, MGPOptional.of(piece));
    }
    public isDropping(): boolean {
        return this.startingCoord.isAbsent();
    }
    public equals(o: EncapsuleMove): boolean {
        if (this === o) return true;
        if (o.landingCoord.equals(this.landingCoord) === false) return false;
        if (this.startingCoord.equals(o.startingCoord) === false) return false;
        return this.piece.equals(o.piece);
    }
    public toString(): string {
        if (this.isDropping()) {
            return 'EncapsuleMove(' + this.piece.get().toString() + ' -> ' + this.landingCoord + ')';
        } else {
            return 'EncapsuleMove(' + this.startingCoord.get() + '->' + this.landingCoord + ')';
        }
    }
}
