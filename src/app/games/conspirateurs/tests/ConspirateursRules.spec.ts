import { Minimax } from 'src/app/jscaip/Minimax';
import { Player } from 'src/app/jscaip/Player';
import { ConspirateursMove } from '../ConspirateursMove';
import { ConspirateursRules } from '../ConspirateursRules';
import { ConspirateursState } from '../ConspirateursState';

describe('ConspirateursRules', () => {
    const _: Player = Player.NONE;
    const A: Player = Player.ZERO;
    const B: Player = Player.ONE;

    let rules: ConspirateursRules;

    let minimaxes: Minimax<ConspirateursMove, ConspirateursState>[];

    beforeEach(() => {
        rules = ConspirateursRules.get();
        minimaxes = [
            // TODO
        ]
    });
});
