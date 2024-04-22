import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { MGPMap, MGPOptional, MGPSet } from '@everyboard/lib';
import { SixState } from './SixState';
import { SixMove } from './SixMove';
import { SixNode, SixRules } from './SixRules';
import { Debug } from 'src/app/utils/Debug';
import { MoveGenerator } from 'src/app/jscaip/AI/AI';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

@Debug.log
export class SixMoveGenerator extends MoveGenerator<SixMove, SixState> {

    public override getListMoves(node: SixNode, _config: NoConfig): SixMove[] {
        const legalLandings: Coord[] = SixRules.getLegalLandings(node.gameState);
        if (node.gameState.turn < 40) {
            return this.getListDrops(legalLandings);
        } else {
            return this.getMovements(node.gameState, legalLandings);
        }
    }
    protected getMovements(state: SixState, legalLandings: Coord[]): SixMove[] {
        const allPieces: MGPMap<Player, MGPSet<Coord>> = state.getPieces().reverse();
        const currentPlayer: Player = state.getCurrentPlayer();
        const playerPieces: MGPSet<Coord> = allPieces.get(currentPlayer).get();
        return this.getMovementsFrom(state, playerPieces, legalLandings);
    }
    protected getMovementsFrom(state: SixState, starts: MGPSet<Coord>, landings: Coord[]): SixMove[] {
        const deplacements: SixMove[] = [];
        for (const start of starts) {
            for (const landing of landings) {
                const move: SixMove = SixMove.ofMovement(start, landing);
                if (state.isCoordConnected(landing, MGPOptional.of(start))) {
                    const stateAfterMove: SixState = state.movePiece(move);
                    const groupsAfterMove: MGPSet<MGPSet<Coord>> = stateAfterMove.getGroups();
                    if (SixRules.isSplit(groupsAfterMove)) {
                        const largestGroups: MGPSet<MGPSet<Coord>> = SixRules.getLargestGroups(groupsAfterMove);
                        if (largestGroups.size() === 1) {
                            deplacements.push(SixMove.ofMovement(start, landing));
                        } else {
                            for (const group of largestGroups) {
                                const subGroup: Coord = group.getAnyElement().get();
                                const cut: SixMove = SixMove.ofCut(start, landing, subGroup);
                                deplacements.push(cut);
                            }
                        }
                    } else {
                        deplacements.push(move);
                    }
                }
            }
        }
        return deplacements;
    }
    private getListDrops(legalLandings: Coord[]): SixMove[] {
        const drops: SixMove[] = [];
        for (const landing of legalLandings) {
            const drop: SixMove = SixMove.ofDrop(landing);
            drops.push(drop);
        }
        return drops;
    }
}
