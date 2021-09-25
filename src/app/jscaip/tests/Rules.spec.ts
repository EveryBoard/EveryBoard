import { P4Move } from 'src/app/games/p4/P4Move';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { LegalityStatus } from '../LegalityStatus';
import { MGPNode } from '../MGPNode';
import { GameStatus, Rules } from '../Rules';
import { RectangularGameState } from '../RectangularGameState';

class AbstractState extends RectangularGameState<number> {

    public static getInitialState(): AbstractState {
        return new AbstractState([[]], 0);
    }
}

class AbstractNode extends MGPNode<Rules<P4Move, AbstractState>, P4Move, AbstractState> {}

class AbstractRules extends Rules<P4Move, AbstractState> {

    public applyLegalMove(move: P4Move, state: AbstractState, status: LegalityStatus): AbstractState {
        const board: readonly number[] = state.board[0];
        return new AbstractState([board.concat([move.x])], state.turn + 1);
    }
    public isLegal(move: P4Move, state: AbstractState): LegalityStatus {
        return { legal: MGPValidation.SUCCESS };
    }
    public getGameStatus(node: AbstractNode): GameStatus {
        return GameStatus.ONGOING;
    }
}

describe('Rules', () => {

    let rules: AbstractRules;

    beforeEach(() => {
        rules = new AbstractRules(AbstractState);
    });
    it('should create child to already calculated node which did not include this legal child yet', () => {
        // Given a node with sons
        spyOn(rules.node, 'hasMoves').and.returnValue(true);
        spyOn(rules.node, 'getSonByMove').and.returnValue(null);

        // when choosing another one
        const wasLegal: boolean = rules.choose(P4Move.ZERO);

        // he should be created and chosen
        expect(wasLegal).toBeTrue();
        expect(rules.node.gameState.turn).toBe(1);
    });
    it('should allow dev to go back to specific starting board based on encodedMoveList', () => {
        // Given an initial list of encoded moves and an initial state
        const initialState: AbstractState = AbstractState.getInitialState();
        const encodedMoveList: number[] = [0, 1, 2, 3];

        // when calling applyMoves
        const state: AbstractState = rules.applyMoves(encodedMoveList, initialState, P4Move.encoder.decodeNumber);

        // then last move should be the last one encoded and state should be adapted
        expect(state.board).toEqual([encodedMoveList]);
        expect(state.turn).toBe(4);
    });
});
