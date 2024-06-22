import { Player } from 'src/app/jscaip/Player';
import { LascaControlHeuristic } from './LascaControlHeuristic';
import { LascaNode } from './LascaRules';
import { LascaStack, LascaState } from './LascaState';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';
import { PlayerNumberTable } from 'src/app/jscaip/PlayerNumberTable';

export class LascaControlPlusDominationHeuristic extends LascaControlHeuristic {

    public override getMetrics(node: LascaNode, _config: NoConfig): PlayerNumberTable {
        const controlValue: PlayerNumberTable = this.getControlScore(node);
        const dominatingPiecesCount: PlayerNumberTable = this.getDominatedPieceScore(node);
        return controlValue.concat(dominatingPiecesCount);
    }

    private getDominatedPieceScore(node: LascaNode): PlayerNumberTable {
        const dominatedPieces: PlayerNumberTable = PlayerNumberTable.of([0], [0]);
        const state: LascaState = node.gameState;
        const width: number = state.getWidth();
        const height: number = state.getHeight();
        for (let y: number = 0; y < height; y++) {
            for (let x: number = 0; x < width; x++) {
                const square: LascaStack = state.getPieceAtXY(x, y);
                if (square.getStackSize() > 0) {
                    const stackSize: number = square.getStackSize();
                    let pieceIndex: number = 0;
                    const commander: Player = square.getCommander().player;
                    while (pieceIndex < stackSize && square.get(pieceIndex).player === commander) {
                        pieceIndex++;
                    }
                    dominatedPieces.add(commander, 0, pieceIndex);
                }
            }
        }
        return dominatedPieces;
    }

}
