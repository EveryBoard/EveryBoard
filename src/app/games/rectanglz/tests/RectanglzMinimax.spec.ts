import { RectanglzState } from '../RectanglzState';
import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { RectanglzMove } from '../RectanglzMove';
import { RectanglzNode, RectanglzRules } from '../RectanglzRules';
import { RectanglzMinimax } from '../RectanglzMinimax';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';
import { PlayerOrNone } from 'src/app/jscaip/Player';

fdescribe('RectanglzMinimax', () => {

    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;
    const X: PlayerOrNone = PlayerOrNone.ONE;

    let minimax: Minimax<RectanglzMove, RectanglzState>;
    const defaultConfig: NoConfig = RectanglzRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        minimax = new RectanglzMinimax();
    });

    it('should provide  move TODO KILL IT IS HEURISTIC', () => {
    });

});
