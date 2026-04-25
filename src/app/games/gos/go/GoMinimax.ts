import { IterativeDeepeningMinimax } from '../../../jscaip/AI/Minimax';
import { AbstractGoMinimax } from '../AbstractGoMinimax';
import { GoLegalityInformation } from '../AbstractGoRules';
import { GoMove } from '../GoMove';
import { GoState } from '../GoState';

import { GoHeuristic } from './GoHeuristic';
import { GoMoveGenerator } from './GoMoveGenerator';
import { GoConfig, GoRules } from './GoRules';


export class GoMinimax extends AbstractGoMinimax<GoConfig> {

    public constructor() {
        super(
            GoRules.get(),
            new GoMoveGenerator(),
            new GoHeuristic(),
        );
    }

}

export class IDGoMinimax extends IterativeDeepeningMinimax<GoMove, GoState, GoConfig, GoLegalityInformation>
{

    public constructor() {
        super($localize`IDMinimax`,
              GoRules.get(),
              new GoHeuristic(),
              new GoMoveGenerator(),
        );
    }

    protected override hash(state: GoState): string {
        let board: string = '';
        for (const line of state.board) {
            for (const cell of line) {
                board += cell.toString();
            }
            board += '\n';
        }
        return `${state.turn % 2}-${state.phase.toString()}-${board}-${JSON.stringify(state.koCoord)}`;
    }

}
