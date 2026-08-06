import { MGPOptional } from '@everyboard/lib';

import { BooleanConfig, NumberConfig, RulesConfigDescription, RulesConfigDescriptionLocalizable } from '../../../components/wrapper-components/rules-configuration/RulesConfigDescription';
import { Coord } from '../../../jscaip/Coord';
import { Ordinal } from '../../../jscaip/Ordinal';
import { MGPValidators } from '../../../utils/MGPValidator';
import { AbstractReversiRules, BoardMode, ReversiConfig } from '../common/AbstractReversiRules';
import { ReversiState } from '../common/ReversiState';

class ToricBoard implements BoardMode {

    public getNextCoord(coord: Coord, direction: Ordinal, state: ReversiState): Coord {
        return coord.getNextToric(direction, state.getWidth(), state.getHeight());
    }

}
export class ToricReversiRules extends AbstractReversiRules {

    private static singleton: MGPOptional<ToricReversiRules> = MGPOptional.empty();

    public static get(): ToricReversiRules {
        if (ToricReversiRules.singleton.isAbsent()) {
            ToricReversiRules.singleton = MGPOptional.of(new ToricReversiRules(new ToricBoard()));
        }
        return ToricReversiRules.singleton.get();
    }

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<ReversiConfig> =
        new RulesConfigDescription<ReversiConfig>({
            name: (): string => $localize`Toric Reversi`,
            config: {
                width: new NumberConfig(8, RulesConfigDescriptionLocalizable.WIDTH, MGPValidators.range(3, 99)),
                height: new NumberConfig(8, RulesConfigDescriptionLocalizable.HEIGHT, MGPValidators.range(3, 99)),
                toric: new BooleanConfig(true, RulesConfigDescriptionLocalizable.TORIC),
            },
        });

    public override getRulesConfigDescription(): RulesConfigDescription<ReversiConfig> {
        return ToricReversiRules.RULES_CONFIG_DESCRIPTION;
    }

}
