import { ConspirateursMove } from '../ConspirateursMove';
import { AIDepthLimitOptions } from 'src/app/jscaip/AI';
import { ConspirateursNode, ConspirateursRules } from '../ConspirateursRules';
import { Minimax } from 'src/app/jscaip/Minimax';
import { ConspirateursState } from '../ConspirateursState';
import { ConspirateursMinimax } from '../ConspirateursMinimax';

describe('ConspirateursMinimax', () => {

    let rules: ConspirateursRules;
    let minimax: Minimax<ConspirateursMove, ConspirateursState>;
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };

    beforeEach(() => {
        rules = ConspirateursRules.get();
        minimax = new ConspirateursMinimax();
    });
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
