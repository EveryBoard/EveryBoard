import { Coord } from 'src/app/jscaip/coord/Coord';
import { Move } from 'src/app/jscaip/Move';
import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';

export class SixMove extends MoveCoord {

    public static fromDrop(coord: Coord): SixMove {
        return new SixMove(coord, MGPOptional.empty(), MGPOptional.empty());
    }
    public static fromDeplacement(start: Coord, landing: Coord): SixMove {
        return new SixMove(start, MGPOptional.of(landing), MGPOptional.empty());
    }
    public static fromCuttingDeplacement(start: Coord, landing: Coord, captured: Coord): SixMove {
        return new SixMove(start, MGPOptional.of(landing), MGPOptional.of(captured));
    }
    private constructor(start: Coord,
                        public readonly landing: MGPOptional<Coord>,
                        public readonly captured: MGPOptional<Coord>)
    {
        super(start.x, start.y);
        if (start.equals(landing.getOrNull())) {
            throw new Error('Deplacement cannot be static!');
        }
        if (start.equals(captured.getOrNull())) {
            throw new Error('Cannot capture starting coord, since it will always be empty after move!');
        }
    }
    public toString(): string {
        throw new Error('Method not implemented.');
    }
    public equals(o: Move): boolean {
        throw new Error('Method not implemented.');
    }
    public encode(): number {
        throw new Error('Method not implemented.');
    }
    public decode(encodedMove: number): Move {
        throw new Error('Method not implemented.');
    }
}
