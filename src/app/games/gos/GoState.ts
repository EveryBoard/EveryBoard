import { MGPOptional } from '@everyboard/lib';

import { Coord } from '../../jscaip/Coord';
import { Player } from '../../jscaip/Player';
import { PlayerNumberMap } from '../../jscaip/PlayerMap';
import { Table, TableUtils } from '../../jscaip/TableUtils';
import { GameStateWithTable } from '../../jscaip/state/GameStateWithTable';

import { GoPhase } from './GoPhase';
import { GoPiece } from './GoPiece';

export class GoState extends GameStateWithTable<GoPiece> {

    public static of(oldState: GoState, newBoard: Table<GoPiece>): GoState {
        return new GoState(
            newBoard,
            oldState.getCapturedCopy(),
            oldState.turn,
            oldState.koCoord,
            oldState.phase,
        );
    }

    public readonly koCoord: MGPOptional<Coord>;

    public readonly captured: PlayerNumberMap; // TODO: made private to enforce immutability by encapsulation, clean it

    public readonly phase: GoPhase;

    public constructor(board: Table<GoPiece>,
                       captured: PlayerNumberMap,
                       turn: number,
                       koCoord: MGPOptional<Coord>,
                       phase: GoPhase)
    {
        super(board, turn);
        this.captured = captured;
        this.captured.makeImmutable();
        this.koCoord = koCoord;
        this.phase = phase;
    }

    public getCapturedCopy(): PlayerNumberMap { //TODO: kill this, make all field immutable
        return this.captured.getCopy();
    }

    public static getStartingBoard(width: number, height: number): GoPiece[][] {
        return TableUtils.create(width, height, GoPiece.EMPTY);
    }

    public copy(): GoState { // TODO: berk ?
        return new GoState(this.getCopiedBoard(),
                           this.getCapturedCopy(),
                           this.turn,
                           this.koCoord,
                           this.phase,
        );
    }

    public isDead(coord: Coord): boolean {
        return this.getPieceAt(coord).isDead();
    }

    public isTerritory(coord: Coord): boolean {
        return this.getPieceAt(coord).isTerritory();
    }

    public incrementTurn(): GoState {
        return new GoState(
            this.getCopiedBoard(),
            this.getCapturedCopy(),
            this.turn + 1,
            this.koCoord,
            this.phase,
        );
    }

    public setPieceAt(coord: Coord, value: GoPiece): GoState {
        return GameStateWithTable.setPieceAt(this,
                                             coord,
                                             value,
                                             GoState.of,
        );
    }

    public addCaptures(player: Player, captures: number): GoState {
        const newCaptured: PlayerNumberMap = this.getCapturedCopy();
        newCaptured.add(player, captures);
        return new GoState(
            this.getCopiedBoard(),
            newCaptured,
            this.turn,
            this.koCoord,
            this.phase,
        );
    }

}
