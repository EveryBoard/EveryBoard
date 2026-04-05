import { MoveGenerator } from '../../../jscaip/AI/AI';
import { IterativeDeepeningMinimax, Minimax } from '../../../jscaip/AI/Minimax';

import { MancalaConfig } from './MancalaConfig';
import { MancalaMove } from './MancalaMove';
import { MancalaRules } from './MancalaRules';
import { MancalaScoreHeuristic } from './MancalaScoreHeurisic';
import { MancalaState } from './MancalaState';

export class MancalaScoreMinimax extends Minimax<MancalaMove, MancalaState, MancalaConfig> {


    public constructor(rules: MancalaRules, moveGenerator: MoveGenerator<MancalaMove, MancalaState, MancalaConfig>) {
        super($localize`Score`,
              rules,
              new MancalaScoreHeuristic(),
              moveGenerator,
        );
        this.transpositionTables = false;
    }
}


export class IDMancalaScoreMinimax extends IterativeDeepeningMinimax<MancalaMove, MancalaState, MancalaConfig> {

    public constructor(rules: MancalaRules, moveGenerator: MoveGenerator<MancalaMove, MancalaState, MancalaConfig>) {
        super($localize`IDScore`,
              rules,
              new MancalaScoreHeuristic(),
              moveGenerator,
        );
    }

    public override hash(state: MancalaState): string {
        const board: number[] = [];
        // Board has a symmetry: moves are relative to the player's first house,
        // so we can store the board in the same order
        if (state.turn % 2 === 0) {
            board.push(...state.board[0]);
            board.push(...state.board[1]);
        } else {
            board.push(...state.board[1]);
            board.push(...state.board[0]);
        }
        // Also, we don't care about other elements of the state: turn and scores
        return JSON.stringify(board);
    }
}
