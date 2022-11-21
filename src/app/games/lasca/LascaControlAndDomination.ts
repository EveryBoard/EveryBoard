import { BoardValue } from 'src/app/jscaip/BoardValue';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus } from 'src/app/jscaip/Rules';
import { LascaControlMinimax } from './LascaControlMinimax';
import { LascaMove } from './LascaMove';
import { LascaRules } from './LascaRules';
import { LascaSpace, LascaState } from './LascaState';

class LascaNode extends MGPNode<LascaRules, LascaMove, LascaState> {}

export class LascaControlAndDominationMinimax extends LascaControlMinimax {

    public getBoardValue(node: LascaNode): BoardValue {
        const gameStatus: GameStatus = this.ruler.getGameStatus(node);
        if (gameStatus.isEndGame) {
            return new BoardValue(gameStatus.toBoardValue());
        }
        const controlValue: number = super.getBoardValue(node).value * 11;
        let dominatingPiecesCount: number = 0;
        for (let y: number = 0; y < 7; y++) {
            for (let x: number = 0; x < 7; x++) {
                const space: LascaSpace = node.gameState.getPieceAtXY(x, y);
                if (space.getPileSize() > 0) {
                    const spaceSize: number = space.getPileSize();
                    let pieceIndex: number = 0;
                    console.log('[')
                    const commander: Player = space.getCommander().player;
                    console.log(']')
                    while (pieceIndex < spaceSize && space.get(pieceIndex).player === commander) {
                        pieceIndex++;
                    }
                    dominatingPiecesCount += pieceIndex * commander.getScoreModifier();
                }
            }
        }
        return new BoardValue(controlValue + dominatingPiecesCount);
    }
}
