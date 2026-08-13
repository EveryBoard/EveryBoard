import { Player } from '@everyboard/games';
import { Set, MGPMap } from '@everyboard/lib';

import { AlignmentStatus, BoardInfo } from '../../jscaip/AI/AlignmentHeuristic';
import { Coord } from '../../jscaip/Coord';
import { CoordSet } from '../../jscaip/CoordSet';

import { SixHeuristic } from './SixHeuristic';
import { SixMove } from './SixMove';
import { SixMoveGenerator } from './SixMoveGenerator';
import { SixState } from './SixState';

export class SixFilteredMoveGenerator extends SixMoveGenerator {

    private readonly heuristic: SixHeuristic = new SixHeuristic();

    protected override getTranslations(state: SixState, legalLandings: Coord[]): SixMove[] {
        const safelyMovablePieceOrFirstOne: CoordSet = this.getSafelyMovablePieceOrFirstOne(state);
        return this.getTranslationsFrom(state, safelyMovablePieceOrFirstOne, legalLandings);
    }

    private getSafelyMovablePieceOrFirstOne(state: SixState): CoordSet {
        const allPieces: MGPMap<Player, Set<Coord>> = state.getPieces().reverse();
        const currentPlayer: Player = state.getCurrentPlayer();
        const playerPieces: Set<Coord> = allPieces.get(currentPlayer).get();
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
            if (boardInfo.status === AlignmentStatus.VICTORY) {
                return true;
            }
        }
        return false;
    }

}
