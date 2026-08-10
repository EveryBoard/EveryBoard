import { MGPOptional } from '@everyboard/lib';

import { NumberConfig, RulesConfigDescription, RulesConfigDescriptionLocalizable, BooleanConfig } from '../../../components/wrapper-components/rules-configuration/RulesConfigDescription';
import { MGPValidators } from '../../../utils/MGPValidator';
import { AbstractRectangularGoRules, RectangularGoConfig } from '../abstract-rectangular-go/AbstractRectangularGoRules';

export class ZoomedGoRules extends AbstractRectangularGoRules {

    private static singleton: MGPOptional<ZoomedGoRules> = MGPOptional.empty();

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<RectangularGoConfig> =
        new RulesConfigDescription<RectangularGoConfig>(
            {
                name: (): string => $localize`Zoom ${ 3 } ` + $localize`(medium)`,
                config: {
                    width: new NumberConfig(12, RulesConfigDescriptionLocalizable.WIDTH, MGPValidators.range(1, 99)),
                    height: new NumberConfig(12, RulesConfigDescriptionLocalizable.HEIGHT, MGPValidators.range(1, 99)),
                    handicap: new NumberConfig(0, () => $localize`Handicap`, MGPValidators.range(0, 9)),
                    zoom: new NumberConfig(3, () => $localize`Zoom`, MGPValidators.range(1, 5)),
                    showZooms: new BooleanConfig(true, () => $localize`Show Zooms`),
                },
            },
            [
                {
                    name: (): string => $localize`Zoom ${ 2 } ` + $localize`(small)`,
                    config: {
                        width: 6,
                        height: 6,
                        handicap: 0,
                        zoom: 2,
                        showZooms: true,
                    },
                }, {
                    name: (): string => $localize`Zoom ${ 2 } ` + $localize`(medium)`,
                    config: {
                        width: 10,
                        height: 10,
                        handicap: 0,
                        zoom: 2,
                        showZooms: true,
                    },
                }, {
                    name: (): string => $localize`Zoom ${ 2 } ` + $localize`(large)`,
                    config: {
                        width: 14,
                        height: 14,
                        handicap: 0,
                        zoom: 2,
                        showZooms: true,
                    },
                }, {
                    name: (): string => $localize`Zoom ${ 3 } ` + $localize`(small)`,
                    config: {
                        width: 6,
                        height: 6,
                        handicap: 0,
                        zoom: 3,
                        showZooms: true,
                    },
                }, {
                    name: (): string => $localize`Zoom ${ 3 } ` + $localize`(large)`,
                    config: {
                        width: 18,
                        height: 18,
                        handicap: 0,
                        zoom: 3,
                        showZooms: true,
                    },
                },
            ],
        );

    public static get(): ZoomedGoRules {
        if (ZoomedGoRules.singleton.isAbsent()) {
            ZoomedGoRules.singleton = MGPOptional.of(new ZoomedGoRules());
        }
        return ZoomedGoRules.singleton.get();
    }

    public constructor() {
        super(true);
    }

    public override getRulesConfigDescription(): RulesConfigDescription<RectangularGoConfig> {
        return ZoomedGoRules.RULES_CONFIG_DESCRIPTION;
    }

}
