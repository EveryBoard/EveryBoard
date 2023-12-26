import { BoardValue } from 'src/app/jscaip/AI/BoardValue';
import { Player } from 'src/app/jscaip/Player';
import { LascaControlHeuristic } from './LascaControlHeuristic';
import { LascaNode } from './LascaRules';
import { LascaStack, LascaState } from './LascaState';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

export class LascaControlPlusDominationHeuristic extends LascaControlHeuristic {

    public override getBoardValue(node: LascaNode, config: NoConfig): BoardValue {
        const controlValue: number = this.getControlScore(node, config);
        const dominatingPiecesCount: number = this.getDominatedPieceScore(node, config);
        return BoardValue.multiMetric([
            controlValue,
            dominatingPiecesCount,
        ]);
    }

    private getDominatedPieceScore(node: LascaNode, _config: NoConfig): number {
        let dominatingPiecesCount: number = 0;
        for (let y: number = 0; y < LascaState.SIZE; y++) {
            for (let x: number = 0; x < LascaState.SIZE; x++) {
                const square: LascaStack = node.gameState.getPieceAtXY(x, y);
                if (square.getStackSize() > 0) {
                    const stackSize: number = square.getStackSize();
                    let pieceIndex: number = 0;
                    const commander: Player = square.getCommander().player;
                    while (pieceIndex < stackSize && square.get(pieceIndex).player === commander) {
                        pieceIndex++;
                    }
                    dominatingPiecesCount += pieceIndex * commander.getScoreModifier();
                }
            }
        }
        return dominatingPiecesCount;
    }

}
