/* eslint-disable max-lines-per-function */
import { MGPFallible, MGPOptional, MGPValidation } from '@everyboard/lib';

import { P4Move } from '../../games/p4/P4Move';
import { GameNode } from '../AI/GameNode';
import { GameStatus } from '../GameStatus';
import { Rules } from '../Rules';
import { EmptyRulesConfig, RulesConfig } from '../RulesConfigUtil';
import { GameStateWithTable } from '../state/GameStateWithTable';

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

    public override getInitialState(_config: RulesConfig): AbstractState {
        return new AbstractState([[]], 0);
    }

    public override applyLegalMove(move: P4Move,
                                   state: AbstractState,
                                   _config: RulesConfig,
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
    const defaultConfig: EmptyRulesConfig = AbstractRules.get().getDefaultRulesConfig();

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
