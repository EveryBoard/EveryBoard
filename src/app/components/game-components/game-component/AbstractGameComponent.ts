import { Move } from '../../../jscaip/Move';
import { SuperRules } from '../../../jscaip/Rules';
import { RulesConfig } from '../../../jscaip/RulesConfigUtil';
import { GameState } from '../../../jscaip/state/GameState';

import { GameComponent } from './GameComponent';

export abstract class AbstractGameComponent
    extends GameComponent<SuperRules<Move,
                                     GameState,
                                     RulesConfig,
                                     unknown>,
                          Move,
                          GameState,
                          RulesConfig,
                          unknown>
{
}
