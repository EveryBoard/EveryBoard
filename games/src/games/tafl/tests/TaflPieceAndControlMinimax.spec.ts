/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions } from '../../../jscaip/AI/AI';
import { Minimax } from '../../../jscaip/AI/Minimax';
import { TaflConfig } from '../TaflConfig';
import { TaflMove } from '../TaflMove';
import { TaflMoveGenerator } from '../TaflMoveGenerator';
import { TaflPieceAndControlHeuristic } from '../TaflPieceAndControlHeuristic';
import { TaflRules } from '../TaflRules';
import { TaflState } from '../TaflState';
import { TablutMove } from '../tablut/TablutMove';
import { TablutRules } from '../tablut/TablutRules';
import { minimaxTest, SlowTest } from '../utils/tests/TestUtils.spec';

class TaflPieceAndControlMinimax<M extends TaflMove> extends Minimax<M, TaflState, TaflConfig> {
    public constructor(rules: TaflRules<M>) {
        super('Pieces > Control',
              rules,
              new TaflPieceAndControlHeuristic(rules),
              new TaflMoveGenerator(rules),
        );
    }
}

describe('TaflPieceAndControlMinimax', () => {

    const minimax: TaflPieceAndControlMinimax<TablutMove> = new TaflPieceAndControlMinimax(TablutRules.get());
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const defaultConfig: TaflConfig = TablutRules.get().getDefaultRulesConfig();

    SlowTest.it('should be able play against itself', () => {
        minimaxTest({
            rules: TablutRules.get(),
            minimax,
            options: minimaxOptions,
            config: defaultConfig,
            shouldFinish: false, // not a finisher
        });
    });

});
