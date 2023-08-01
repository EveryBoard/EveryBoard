import { BoardValue } from 'src/app/jscaip/BoardValue';
import { MoveGenerator } from 'src/app/jscaip/MGPNode';
import { Heuristic, Minimax } from 'src/app/jscaip/Minimax';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { TrexoMove } from './TrexoMove';
import { TrexoNode, TrexoRules } from './TrexoRules';
import { TrexoState } from './TrexoState';

export class TrexoMoveGenerator extends MoveGenerator<TrexoMove, TrexoState> {

    private readonly rules: TrexoRules = TrexoRules.get();

    public getListMoves(node: TrexoNode): TrexoMove[] {
        return this.rules.getLegalMoves(node.gameState);
    }
}

export class TrexoHeuristic extends Heuristic<TrexoMove, TrexoState> {

    public getBoardValue(node: TrexoNode): BoardValue {
        let score: number = 0;
        const state: TrexoState = node.gameState;
        const lastPlayer: Player = state.getCurrentOpponent();
        let lastPlayerAligned5: boolean = false;
        for (const coordPiece of state.toMap()) {
            // for every column, starting from the bottom of each column
            // while we haven't reached the top or an empty space
            const pieceOwner: PlayerOrNone = state.getPieceAt(coordPiece.key).getOwner();
            if (pieceOwner.isPlayer()) {
                const squareScore: number = TrexoRules.getSquareScore(state, coordPiece.key);
                if (BoardValue.isVictory(squareScore)) {
                    if (pieceOwner === lastPlayer) {
                        // Cannot return right away
                        // because the last player only wins if the other does not get an alignment
                        lastPlayerAligned5 = true;
                    } else {
                        return new BoardValue(lastPlayer.getDefeatValue());
                    }
                } else {
                    score += squareScore;
                }
            }
        }
        if (lastPlayerAligned5) {
            return new BoardValue(lastPlayer.getVictoryValue());
        }
        return new BoardValue(score);
    }
}

export class TrexoMinimax extends Minimax<TrexoMove, TrexoState> {

    public constructor() {
        const rules: TrexoRules = TrexoRules.get();
        super('Alignment Minimax', rules, new TrexoHeuristic(), new TrexoMoveGenerator());
    }
}
