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
        return oldState.withBoard(newBoard);
    }

    public readonly koCoord: MGPOptional<Coord>;

    public readonly captured: PlayerNumberMap;

    public readonly phase: GoPhase;

    public constructor(board: Table<GoPiece>,
                       captured: PlayerNumberMap,
                       turn: number,
                       koCoord: MGPOptional<Coord>,
                       phase: GoPhase,
    ) {
        super(board, turn);
        this.captured = captured;
        this.captured.makeImmutable();
        this.koCoord = koCoord;
        this.phase = phase;
    }

    public getCapturedCopy(): PlayerNumberMap {
        return this.captured.getCopy();
    }

    public static getStartingBoard(width: number, height: number): GoPiece[][] {
        return TableUtils.create(width, height, GoPiece.EMPTY);
    }

    public isDead(coord: Coord): boolean {
        return this.getPieceAt(coord).isDead();
    }

    public isTerritory(coord: Coord): boolean {
        return this.getPieceAt(coord).isTerritory();
    }

    public withBoard(board: Table<GoPiece>): GoState {
        return new GoState(
            board,
            this.captured,
            this.turn,
            this.koCoord,
            this.phase,
        );
    }

    public incrementTurn(): GoState {
        return new GoState(
            this.board,
            this.captured,
            this.turn + 1,
            this.koCoord,
            this.phase,
        );
    }

    public withCaptures(newCaptured: PlayerNumberMap): GoState {
        return new GoState(
            this.board,
            newCaptured,
            this.turn,
            this.koCoord,
            this.phase,
        );
    }

    public withAddedCaptures(player: Player, captures: number): GoState {
        const newCaptured: PlayerNumberMap = this.getCapturedCopy();
        newCaptured.add(player, captures);
        return this.withCaptures(newCaptured);
    }

    public withKo(newKo: MGPOptional<Coord>): GoState {
        return new GoState(
            this.board,
            this.captured,
            this.turn,
            newKo,
            this.phase,
        );
    }

    public withPhase(newPhase: GoPhase): GoState {
        return new GoState(
            this.board,
            this.captured,
            this.turn,
            this.koCoord,
            newPhase,
        );
    }

    public withPieceAt(coord: Coord, value: GoPiece): GoState {
        return GameStateWithTable.setPieceAt(this,
                                             coord,
                                             value,
                                             GoState.of,
        );
    }

}
