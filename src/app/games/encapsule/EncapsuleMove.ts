import { Move } from 'src/app/jscaip/Move';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { EncapsulePiece } from './EncapsulePiece';
import { MoveEncoder } from 'src/app/utils/Encoder';

type EncapsuleMoveFields = [MGPOptional<Coord>, Coord, MGPOptional<EncapsulePiece>];

export class EncapsuleMove extends Move {
    public static encoder: MoveEncoder<EncapsuleMove> = MoveEncoder.tuple(
        [MGPOptional.getEncoder(Coord.encoder), Coord.encoder, MGPOptional.getEncoder(EncapsulePiece.encoder)],
        (move: EncapsuleMove): EncapsuleMoveFields => [move.startingCoord, move.landingCoord, move.piece],
        (fields: EncapsuleMoveFields): EncapsuleMove => new EncapsuleMove(fields[0], fields[1], fields[2]));

    private constructor(public readonly startingCoord: MGPOptional<Coord>,
                        public readonly landingCoord: Coord,
                        public readonly piece: MGPOptional<EncapsulePiece>)
    {
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
