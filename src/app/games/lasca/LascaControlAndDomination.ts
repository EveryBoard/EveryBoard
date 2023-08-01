import { BoardValue } from 'src/app/jscaip/BoardValue';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { LascaControlMinimax } from './LascaControlMinimax';
import { LascaMove } from './LascaMove';
import { LascaRules } from './LascaRules';
import { LascaStack, LascaState } from './LascaState';

class LascaNode extends MGPNode<LascaRules, LascaMove, LascaState> {}

export class LascaControlAndDominationMinimax extends LascaControlMinimax {

    constructor() {
        super('Lasca Control And Domination Minimax');
    }
    public override getBoardValue(node: LascaNode): BoardValue {
        const gameStatus: GameStatus = LascaRules.get().getGameStatus(node);
        if (gameStatus.isEndGame) {
            return gameStatus.toBoardValue();
        }
        const controlValue: number = super.getBoardValue(node).value * 12;
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
        return new BoardValue(controlValue + dominatingPiecesCount);
    }
}
