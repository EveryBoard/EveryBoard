import { Move } from 'src/app/jscaip/Move';
import { Coord } from 'src/app/jscaip/Coord';
import { Encoder, MGPOptional, Utils } from '@everyboard/lib';
import { EncapsulePiece } from './EncapsulePiece';

type EncapsuleMoveFields = [MGPOptional<Coord>, Coord, MGPOptional<EncapsulePiece>];

export class EncapsuleMove extends Move {

    public static encoder: Encoder<EncapsuleMove> = Encoder.tuple(
        [MGPOptional.getEncoder(Coord.encoder), Coord.encoder, MGPOptional.getEncoder(EncapsulePiece.encoder)],
        (move: EncapsuleMove): EncapsuleMoveFields => [move.startingCoord, move.landingCoord, move.piece],
        (fields: EncapsuleMoveFields): EncapsuleMove => new EncapsuleMove(fields[0], fields[1], fields[2]));

    private constructor(public readonly startingCoord: MGPOptional<Coord>,
                        public readonly landingCoord: Coord,
                        public readonly piece: MGPOptional<EncapsulePiece>)
    {
        super();
    }
    public static ofMove(startingCoord: Coord, landingCoord: Coord): EncapsuleMove {
        Utils.assert(startingCoord.equals(landingCoord) === false, 'Starting coord and landing coord must be separate coords');
        return new EncapsuleMove(MGPOptional.of(startingCoord), landingCoord, MGPOptional.empty());
    }
    public static ofDrop(piece: EncapsulePiece, landingCoord: Coord): EncapsuleMove {
        return new EncapsuleMove(MGPOptional.empty(), landingCoord, MGPOptional.of(piece));
    }
    public isDropping(): boolean {
        return this.startingCoord.isAbsent();
    }
    public equals(other: EncapsuleMove): boolean {
        if (this === other) return true;
        if (other.landingCoord.equals(this.landingCoord) === false) return false;
        if (this.startingCoord.equals(other.startingCoord) === false) return false;
        return this.piece.equals(other.piece);
    }
    public toString(): string {
        if (this.isDropping()) {
            return 'EncapsuleMove(' + this.piece.get().toString() + ' -> ' + this.landingCoord + ')';
        } else {
            return 'EncapsuleMove(' + this.startingCoord.get() + '->' + this.landingCoord + ')';
        }
    }
}
