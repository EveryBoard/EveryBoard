import { MGPOptional } from '@everyboard/lib';

import { NumberConfig, RulesConfigDescription, RulesConfigDescriptionLocalizable, BooleanConfig } from '../../../components/wrapper-components/rules-configuration/RulesConfigDescription';
import { MGPValidators } from '../../../utils/MGPValidator';
import { AbstractRectangularGoRules, RectangularGoConfig } from '../abstract-rectangular-go/AbstractRectangularGoRules';

export class GoRules extends AbstractRectangularGoRules {

    private static singleton: MGPOptional<GoRules> = MGPOptional.empty();

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<RectangularGoConfig> =
        new RulesConfigDescription<RectangularGoConfig>({
            name: (): string => $localize`19 x 19`,
            config: {
                width: new NumberConfig(19, RulesConfigDescriptionLocalizable.WIDTH, MGPValidators.range(1, 99)),
                height: new NumberConfig(19, RulesConfigDescriptionLocalizable.HEIGHT, MGPValidators.range(1, 99)),
                handicap: new NumberConfig(0, () => $localize`Handicap`, MGPValidators.range(0, 9)),
                zoom: new NumberConfig(1, () => $localize`Zoom`, MGPValidators.range(1, 5)),
                showZooms: new BooleanConfig(false, () => $localize`Show zooms`),
            },
        }, [{
            name: (): string => $localize`13 x 13`,
            config: {
                width: 13,
                height: 13,
                handicap: 0,
                zoom: 1,
                showZooms: false,
            },
        }, {
            name: (): string => $localize`9 x 9`,
            config: {
                width: 9,
                height: 9,
                handicap: 0,
                zoom: 1,
                showZooms: false,
            },
        }]);

    public static get(): GoRules {
        if (GoRules.singleton.isAbsent()) {
            GoRules.singleton = MGPOptional.of(new GoRules());
        }
        return GoRules.singleton.get();
    }

    public constructor() {
        super(true);
    }

    public override getRulesConfigDescription(): RulesConfigDescription<RectangularGoConfig> {
        return GoRules.RULES_CONFIG_DESCRIPTION;
    }

}
