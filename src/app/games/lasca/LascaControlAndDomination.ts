import { BoardValue } from 'src/app/jscaip/BoardValue';
import { Minimax } from 'src/app/jscaip/Minimax';
import { Player } from 'src/app/jscaip/Player';
import { LascaControlHeuristic, LascaMoveGenerator } from './LascaControlMinimax';
import { LascaMove } from './LascaMove';
import { LascaNode, LascaRules } from './LascaRules';
import { LascaStack, LascaState } from './LascaState';

export class LascaControlAndDominationHeuristic extends LascaControlHeuristic {

    public override getBoardValue(node: LascaNode): BoardValue {
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

export class LascaControlAndDominationMinimax extends Minimax<LascaMove, LascaState> {

    public constructor() {
        super('ControlAndDomination Minimax',
              LascaRules.get(),
              new LascaControlAndDominationHeuristic(),
              new LascaMoveGenerator());
    }
}
