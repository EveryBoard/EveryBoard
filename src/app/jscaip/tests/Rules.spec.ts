/* eslint-disable max-lines-per-function */
import { P4Move } from 'src/app/games/p4/P4Move';
import { MGPNode } from '../MGPNode';
import { Rules } from '../Rules';
import { GameStateWithTable } from '../GameStateWithTable';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from '../../utils/MGPValidation';
import { GameStatus } from '../GameStatus';
import { JSONValue } from 'src/app/utils/utils';
import { RulesUtils } from './RulesUtils.spec';

class MyAbstractState extends GameStateWithTable<number> {

    public static getInitialState(): MyAbstractState {
        return new MyAbstractState([[]], 0);
    }
}

class AbstractNode extends MGPNode<Rules<P4Move, MyAbstractState>, P4Move, MyAbstractState> {}

class AbstractRules extends Rules<P4Move, MyAbstractState> {

    private static singleton: MGPOptional<AbstractRules> = MGPOptional.empty();

    public static get(): AbstractRules {
        if (AbstractRules.singleton.isAbsent()) {
            AbstractRules.singleton = MGPOptional.of(new AbstractRules());
        }
        return AbstractRules.singleton.get();
    }
    private constructor() {
        super(MyAbstractState);
    }
    public applyLegalMove(move: P4Move, state: MyAbstractState, _legality: void): MyAbstractState {
        const board: readonly number[] = state.board[0];
        return new MyAbstractState([board.concat([move.x])], state.turn + 1);
    }
    public isLegal(move: P4Move, state: MyAbstractState): MGPValidation {
        return MGPValidation.SUCCESS;
    }
    public getGameStatus(node: AbstractNode): GameStatus {
        return GameStatus.ONGOING;
    }
}

describe('Rules', () => {

    let rules: AbstractRules;

    beforeEach(() => {
        rules = AbstractRules.get();
    });
    it('should create child to already calculated node which did not include this legal child yet', () => {
        // Given a node with sons
        const node: AbstractNode = rules.getInitialNode();
        spyOn(node, 'hasMoves').and.returnValue(true);
        spyOn(node, 'getSonByMove').and.returnValue(MGPOptional.empty());

        // When choosing another one
        const resultingNode: MGPOptional<AbstractNode> = rules.choose(node, P4Move.ZERO);

        // he should be created and chosen
        expect(resultingNode.isPresent()).toBeTrue();
        expect(resultingNode.get().gameState.turn).toBe(1);
    });
    it('should allow dev to go back to specific starting board based on encodedMoveList', () => {
        // Given an initial list of encoded moves and an initial state
        const initialState: MyAbstractState = MyAbstractState.getInitialState();
        const moveValues: number[] = [0, 1, 2, 3];
        const encodedMoveList: JSONValue[] = moveValues.map((n: number) => P4Move.encoder.encode(P4Move.of(n)));

        // When calling applyMoves
        const state: MyAbstractState = RulesUtils.applyMoves(rules,
                                                             encodedMoveList,
                                                             initialState,
                                                             P4Move.encoder.decode);

        // Then last move should be the last one encoded and state should be adapted
        expect(state.board).toEqual([moveValues]);
        expect(state.turn).toBe(4);
    });
    describe('choose', () => {
        it('should return MGPOptional.empty() when the move was illegal', () => {
            // Given a node and a move that will be deemed illegal
            const node: AbstractNode = rules.getInitialNode();
            const illegalMove: P4Move = P4Move.FIVE;
            spyOn(rules, 'isLegal').and.returnValue(MGPValidation.failure(''));

            // When checking if the move is legal
            const legality: MGPOptional<AbstractNode> = rules.choose(node, illegalMove);
            // Then it should be an empty optional
            expect(legality).toEqual(MGPOptional.empty());
        });
    });
});
