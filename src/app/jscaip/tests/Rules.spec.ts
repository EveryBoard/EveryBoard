import { P4Move } from 'src/app/games/p4/P4Move';
import { NumberTable } from 'src/app/utils/ArrayUtils';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { GamePartSlice } from '../GamePartSlice';
import { LegalityStatus } from '../LegalityStatus';
import { MGPNode } from '../MGPNode';
import { GameStatus, Rules } from '../Rules';

class AbstractState extends GamePartSlice {

    public static getInitialSlice(): AbstractState {
        return new AbstractState([[]], 0);
    }
}

class AbstractNode extends MGPNode<Rules<P4Move, AbstractState>, P4Move, AbstractState> {}

class AbstractRules extends Rules<P4Move, AbstractState> {

    public applyLegalMove(move: P4Move, slice: AbstractState, status: LegalityStatus): AbstractState {
        const board: readonly number[] = slice.board[0];
        return new AbstractState([board.concat([move.x])], slice.turn + 1);
    }
    public isLegal(move: P4Move, slice: AbstractState): LegalityStatus {
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
        expect(rules.node.gamePartSlice.turn).toBe(1);
    });
    it('should allow dev to go back to specific starting board based on encodedMoveList', () => {
        // Given an initial list of encoded moves and an initial state
        const initialState: AbstractState = AbstractState.getInitialSlice();
        const encodedMoveList: number[] = [0, 1, 2, 3];

        // when calling applyMoves
        const state: AbstractState = rules.applyMoves(encodedMoveList, initialState, P4Move.encoder.decodeNumber);

        // then last move should be the last one encoded and state should be adapted
        expect(state.board).toEqual([encodedMoveList]);
        expect(state.turn).toBe(4);
    });
});
