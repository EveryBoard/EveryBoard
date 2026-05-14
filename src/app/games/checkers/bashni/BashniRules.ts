import { MGPOptional } from '@everyboard/lib';

import { BooleanConfig, NumberConfig, RulesConfigDescription, RulesConfigDescriptionLocalizable } from '../../../components/wrapper-components/rules-configuration/RulesConfigDescription';
import { MGPValidators } from '../../../utils/MGPValidator';
import { AbstractCheckersRules, CheckersConfig, CheckersOptionLocalizable } from '../common/AbstractCheckersRules';

export class BashniRules extends AbstractCheckersRules {

    private static singleton: MGPOptional<BashniRules> = MGPOptional.empty();

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<CheckersConfig> =
        new RulesConfigDescription<CheckersConfig>({
            name: (): string => $localize`Bashni`,
            config: {
                playerRows: new NumberConfig(3,
                                             RulesConfigDescriptionLocalizable.NUMBER_OF_PIECES_ROWS,
                                             MGPValidators.range(1, 99)),
                emptyRows: new NumberConfig(2,
                                            RulesConfigDescriptionLocalizable.NUMBER_OF_EMPTY_ROWS,
                                            MGPValidators.range(1, 99)),
                width: new NumberConfig(8, RulesConfigDescriptionLocalizable.WIDTH, MGPValidators.range(2, 99)),
                canStackPieces:
                    new BooleanConfig(true, CheckersOptionLocalizable.STACK_PIECES),
                mustMakeMaximalCapture:
                    new BooleanConfig(false, CheckersOptionLocalizable.MAXIMAL_CAPTURE),
                simplePieceCanCaptureBackwards:
                    new BooleanConfig(true, CheckersOptionLocalizable.SIMPLE_PIECE_CAN_CAPTURE_BACKWARDS),
                promotedPiecesCanFly:
                    new BooleanConfig(true, CheckersOptionLocalizable.PROMOTED_PIECES_CAN_TRAVEL_LONG_DISTANCES),
                occupyEvenSquare:
                    new BooleanConfig(false, CheckersOptionLocalizable.OCCUPY_EVEN_SQUARE),
                frisianCaptureAllowed:
                    new BooleanConfig(false, CheckersOptionLocalizable.FRISIAN_CAPTURE_ALLOWED),
                canPromoteMidCapture:
                    new BooleanConfig(true, CheckersOptionLocalizable.CAN_PROMOTE_MID_CAPTURE),
            },
        });

    public static get(): BashniRules {
        if (BashniRules.singleton.isAbsent()) {
            BashniRules.singleton = MGPOptional.of(new BashniRules());
        }
        return BashniRules.singleton.get();
    }

    public override getRulesConfigDescription(): RulesConfigDescription<CheckersConfig> {
        return BashniRules.RULES_CONFIG_DESCRIPTION;
    }

}
