import { Move } from '@everyboard/games';
import { SuperRules } from '@everyboard/games';
import { RulesConfig } from '@everyboard/games';
import { GameState } from '@everyboard/games';

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
