import { Coord } from 'src/app/jscaip/Coord';
import { GameStateWithTable } from 'src/app/jscaip/state/GameStateWithTable';
import { Table, TableUtils } from 'src/app/jscaip/TableUtils';
import { MGPOptional } from '@everyboard/lib';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { GoPiece } from './GoPiece';
import { GoPhase } from './GoPhase';

export class GoState extends GameStateWithTable<GoPiece> {

    public readonly koCoord: MGPOptional<Coord>;

    public readonly captured: PlayerNumberMap;

    public readonly phase: GoPhase;

    public constructor(board: Table<GoPiece>,
                       captured: PlayerNumberMap,
                       turn: number,
                       koCoord: MGPOptional<Coord>,
                       phase: GoPhase)
    {
        super(board, turn);
        this.captured = captured;
        this.koCoord = koCoord;
        this.phase = phase;
    }

    public getCapturedCopy(): PlayerNumberMap {
        return this.captured.getCopy();
    }

    public static getStartingBoard(width: number, height: number): GoPiece[][] {
        return TableUtils.create(width, height, GoPiece.EMPTY);
    }

    public copy(): GoState {
        return new GoState(this.getCopiedBoard(),
                           this.getCapturedCopy(),
                           this.turn,
                           this.koCoord,
                           this.phase);
    }

    public isDead(coord: Coord): boolean {
        return this.getPieceAt(coord).isDead();
    }

    public isTerritory(coord: Coord): boolean {
        return this.getPieceAt(coord).isTerritory();
    }

}
