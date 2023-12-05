import { GameNode } from 'src/app/jscaip/GameNode';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { NewGameMove } from './NewGameMove';
import { NewGameState } from './NewGameState';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { RulesConfigDescription, ConfigLine } from 'src/app/components/wrapper-components/rules-configuration/RulesConfigDescription';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Utils } from 'src/app/utils/utils';
import { Rules } from 'src/app/jscaip/Rules';

/**
 * This class is optional.
 * If you don't use it, you can remove it everywhere it is mentionned.
 *
 * It provides extra information that is returned by the `isLegal` method of the rules.
 * This information is then provided to the `applyLegalMove` method of the rules.
 * That way, we can avoid duplicating some computations already made in `isLegal`.
 * By default, `void` is used if you don't provide one.
 * There are no restrictions to this definition.
 */
export class NewGameLegalityInfo {
}

/**
 * Defining the game node class is only for cosmetic purposes. It reduces the length of the argument to `getGameStatus`.
 */
export class NewGameNode extends GameNode<NewGameMove, NewGameState, NewGameConfig> {}

export type NewGameConfig = {

    the_name_you_will_use_in_your_rules_and_states: number;

};

/**
 * This is where you define the rules of the game.
 * It should be a singleton class.
 * It is used by the wrappers to check the legality of a move, and to apply the move on a state.
 */
export class NewGameRules extends Rules<NewGameMove, NewGameState, NewGameConfig, NewGameLegalityInfo> {

    /**
     * This is the singleton instance. You should keep this as is, except for adapting the class name.
     */
    private static singleton: MGPOptional<NewGameRules> = MGPOptional.empty();

    /**
     * If you want your game to be configurable (different board sizes for example)
     * then here should be the default config.
     * You have the option to create a type NewRulesConfig for more type safety.
     * It is FULLY optional, if you don't want to make your game configurable just yet, ignore this!
     */
    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<NewGameConfig> =
        new RulesConfigDescription<NewGameConfig>({
            name: (): string => 'the internationalisable name of that standard config',
            config: {
                the_name_you_will_use_in_your_rules_and_states:
                    new ConfigLine(
                        5,
                        () => `the translatable and writable name of this parameter`,
                        (value: number | null): MGPValidation => {
                            if (value == null) {
                                return MGPValidation.failure('Return a localizable message for the user saying why this config choice is unacceptable');
                            } else {
                                return MGPValidation.SUCCESS;
                            }
                        },
                    ),
            },
        }, [
            // Here, if you have other "standard" configuration, add a list
            // There are of the same type as the default one in first parameter !
        ]);

    /**
     * This gets the singleton instance. Similarly, keep this as is.
     */
    public static get(): NewGameRules {
        if (NewGameRules.singleton.isAbsent()) {
            NewGameRules.singleton = MGPOptional.of(new NewGameRules());
        }
        return NewGameRules.singleton.get();
    }

    /**
     * If you do create a configuration for the game, you must have this function, otherwise remove it
     */
    public override getRulesConfigDescription(): MGPOptional<RulesConfigDescription<NewGameConfig>> {
        return MGPOptional.of(NewGameRules.RULES_CONFIG_DESCRIPTION);
    }

    /**
     * This method returns the initial state of a game
     */
    public getInitialState(): NewGameState {
        return new NewGameState(0);
    }

    /**
     * This method checks whether it is legal to apply a move to a state.
     * @param move the move
     * @param state the state on which to check the move legality
     * @returns a MGPFallible of the GameLegalityInfo, being a success if the move is legal,
     *   a failure containing the reason for the illegality of the move.
     */
    public isLegal(move: NewGameMove, state: NewGameState): MGPFallible<NewGameLegalityInfo> {
        return MGPFallible.success(new NewGameLegalityInfo());
    }

    /**
     * This is the methods that applies the move to a state.
     * We know the move is legal because it has been checked with `isLegal`.
     * @param move the move to apply to the state
     * @param state the state on which to apply the move
     * @param info the info that had been returned by `isLegal`
     * @returns the resulting state, i.e., the state on which move has been applied
     */
    public applyLegalMove(_move: NewGameMove,
                          state: NewGameState,
                          _config: MGPOptional<NewGameConfig>,
                          _info: NewGameLegalityInfo)
    : NewGameState
    {
        return new NewGameState(state.turn + 1);
    }

    /**
     * This method checks whether the game is in progress or finished.
     * @param node the node for which we check the game status
     * @returns a GameStatus (ZERO_WON, ONE_WON, DRAW, ONGOING)
     */
    public getGameStatus(node: NewGameNode, _config: MGPOptional<NewGameConfig>): GameStatus {
        if (node.gameState.turn < 42) {
            return GameStatus.ONGOING;
        } else {
            return GameStatus.DRAW;
        }
    }

}

// For coverage
// eslint-disable-next-line max-len
Utils.getNonNullable(NewGameRules.RULES_CONFIG_DESCRIPTION.defaultConfigDescription.config.the_name_you_will_use_in_your_rules_and_states.validator)(null);
