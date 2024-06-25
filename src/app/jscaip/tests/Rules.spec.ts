/* eslint-disable max-lines-per-function */
import { P4Move } from 'src/app/games/p4/P4Move';
import { GameNode } from '../AI/GameNode';
import { Rules } from '../Rules';
import { GameStateWithTable } from '../state/GameStateWithTable';
import { GameStatus } from '../GameStatus';
import { JSONValue, MGPFallible, MGPOptional, MGPValidation } from '@everyboard/lib';
import { RulesUtils } from './RulesUtils.spec';
import { NoConfig, RulesConfig } from '../RulesConfigUtil';

class AbstractState extends GameStateWithTable<number> {}

class AbstractNode extends GameNode<P4Move, AbstractState> {}

class AbstractRules extends Rules<P4Move, AbstractState> {

    private static singleton: MGPOptional<AbstractRules> = MGPOptional.empty();

    public static get(): AbstractRules {
        if (AbstractRules.singleton.isAbsent()) {
            AbstractRules.singleton = MGPOptional.of(new AbstractRules());
        }
        return AbstractRules.singleton.get();
    }

    private constructor() {
        super();
    }

    public override getInitialState(_config: MGPOptional<RulesConfig>): AbstractState {
        return new AbstractState([[]], 0);
    }

    public override applyLegalMove(move: P4Move,
                                   state: AbstractState,
                                   _config: MGPOptional<RulesConfig>,
                                   _legality: void)
    : AbstractState
    {
        const board: readonly number[] = state.board[0];
        return new AbstractState([board.concat([move.x])], state.turn + 1);
    }

    public override isLegal(_move: P4Move, _state: AbstractState): MGPValidation {
        return MGPValidation.SUCCESS;
    }

    public override getGameStatus(_node: AbstractNode): GameStatus {
        return GameStatus.ONGOING;
    }

}

describe('Rules', () => {

    let rules: AbstractRules;
    const defaultConfig: NoConfig = AbstractRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        rules = AbstractRules.get();
    });

    it('should create child to already calculated node which did not include this legal child yet', () => {
        // Given a node with children but not the one that will be calculated
        const node: AbstractNode = rules.getInitialNode(defaultConfig);
        spyOn(node, 'getChild').and.returnValue(MGPOptional.empty());

        // When choosing another one
        const resultingNode: MGPFallible<AbstractNode> = rules.choose(node, P4Move.of(0), defaultConfig);

        // Then the node should be created and chosen
        expect(resultingNode.isSuccess()).toBeTrue();
        expect(resultingNode.get().gameState.turn).toBe(1);
    });

    it('should allow dev to go back to specific starting board based on encodedMoveList', () => {
        // Given an initial list of encoded moves and an initial state
        const initialState: AbstractState = AbstractRules.get().getInitialState(MGPOptional.empty());
        const moveValues: number[] = [0, 1, 2, 3];
        const encodedMoveList: JSONValue[] = moveValues.map((n: number) => P4Move.encoder.encode(P4Move.of(n)));

        // When calling applyMoves
        const state: AbstractState = RulesUtils.applyMoves(rules,
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
            const node: AbstractNode = rules.getInitialNode(defaultConfig);
            const illegalMove: P4Move = P4Move.of(5);
            spyOn(rules, 'isLegal').and.returnValue(MGPValidation.failure('some reason'));

            // When checking if the move is legal
            const legality: MGPFallible<AbstractNode> = rules.choose(node, illegalMove, defaultConfig);
            // Then it should fail with the expected reason
            expect(legality.isFailure()).toBeTrue();
            expect(legality.getReason()).toEqual('some reason');
        });

    });

});
