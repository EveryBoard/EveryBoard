import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPSet } from 'src/app/utils/MGPSet';
import { SixState } from './SixState';
import { SixMove } from './SixMove';
import { SCORE } from 'src/app/jscaip/SCORE';
import { CoordSet } from 'src/app/utils/OptimizedSet';
import { SixMoveGenerator } from './SixMoveGenerator';
import { BoardInfo, SixHeuristic } from './SixHeuristic';

export class SixFilteredMoveGenerator extends SixMoveGenerator {

    private readonly heuristic: SixHeuristic = new SixHeuristic();

    protected override getMovements(state: SixState, legalLandings: Coord[]): SixMove[] {
        const safelyMovablePieceOrFirstOne: MGPSet<Coord> = this.getSafelyMovablePieceOrFirstOne(state);
        return this.getMovementsFrom(state, safelyMovablePieceOrFirstOne, legalLandings);
    }
    private getSafelyMovablePieceOrFirstOne(state: SixState): MGPSet<Coord> {
        const allPieces: MGPMap<Player, MGPSet<Coord>> = state.getPieces().reverse();
        const currentPlayer: Player = state.getCurrentPlayer();
        const playerPieces: MGPSet<Coord> = allPieces.get(currentPlayer).get();
        const firstPiece: Coord = playerPieces.getAnyElement().get();

        const safePieces: Coord[] = [];
        for (const playerPiece of playerPieces) {
            if (this.isPieceBlockingAVictory(state, playerPiece) === false) {
                safePieces.push(playerPiece);
            }
        }
        if (safePieces.length === 0) {
            return new CoordSet([firstPiece]);
        } else {
            return new CoordSet(safePieces);
        }
    }
    private isPieceBlockingAVictory(state: SixState, playerPiece: Coord): boolean {
        const hypotheticalState: SixState = state.switchPiece(playerPiece);

        const fakeDropMove: SixMove = SixMove.ofDrop(playerPiece);
        this.heuristic.startSearchingVictorySources();
        while (this.heuristic.hasNextVictorySource()) {
            this.heuristic.currentVictorySource = this.heuristic.getNextVictorySource();
            const boardInfo: BoardInfo = this.heuristic.searchVictoryOnly(this.heuristic.currentVictorySource,
                                                                          fakeDropMove,
                                                                          hypotheticalState);
            if (boardInfo.status === SCORE.VICTORY) {
                return true;
            }
        }
        return false;
    }
}
