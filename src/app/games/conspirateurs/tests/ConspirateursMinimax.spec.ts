import { HeuristicUtils } from 'src/app/jscaip/tests/HeuristicUtils.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { ConspirateursMove } from '../ConspirateursMove';
import { AIDepthLimitOptions } from 'src/app/jscaip/MGPNode';
import { ConspirateursNode, ConspirateursRules } from '../ConspirateursRules';
import { ConspirateursOrderedMoveGenerator } from '../ConspirateursOrderedMoveGenerator';
import { ConspirateursHeuristic } from '../ConspirateursHeuristic';
import { Minimax } from 'src/app/jscaip/Minimax';
import { ConspirateursState } from '../ConspirateursState';

describe('ConspirateursMinimax', () => {

    let rules: ConspirateursRules;
    let minimax: Minimax<ConspirateursMove, ConspirateursState>;
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };

    beforeEach(() => {
        rules = ConspirateursRules.get();
        minimax = new Minimax('Jump Minimax',
                              ConspirateursRules.get(),
                              new ConspirateursHeuristic(),
                              new ConspirateursOrderedMoveGenerator());
    });
    // TODO FOR REVIEW: que fait on de ce test ? On le généralise TOUS les composants ?
    // TODO FOR REVIEW: genre on s'assure que chaque minimax déclaré doit pouvoir faire X tours contre lui-même
    it('should be able to finish when playing with itself', () => {
        // Given a component where AI plays against AI
        let node: ConspirateursNode = rules.getInitialNode();

        // When playing 200 turns
        let turn: number = 0;
        while (turn < 200 && rules.getGameStatus(node).isEndGame === false) {
            const bestMove: ConspirateursMove = minimax.chooseNextMove(node, minimaxOptions);
            node = node.getChild(bestMove).get();
            turn++;
        }
        // Then the game should be over
        expect(rules.getGameStatus(node).isEndGame).toBeTrue();
    });
});
