import { MGPOptional } from '@everyboard/lib';
import { AbstractCheckersRules, CheckersConfig, CheckersLocalizable } from '../common/AbstractCheckersRules';
import { BooleanConfig, NumberConfig, RulesConfigDescription, RulesConfigDescriptionLocalizable } from 'src/app/components/wrapper-components/rules-configuration/RulesConfigDescription';
import { MGPValidators } from 'src/app/utils/MGPValidator';

export class InternationalCheckersRules extends AbstractCheckersRules {

    private static singleton: MGPOptional<InternationalCheckersRules> = MGPOptional.empty();

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<CheckersConfig> =
        new RulesConfigDescription<CheckersConfig>({
            name: (): string => $localize`InternationalCheckers`,
            config: {
                playerRows: new NumberConfig(4,
                                             RulesConfigDescriptionLocalizable.NUMBER_OF_PIECES_ROWS,
                                             MGPValidators.range(1, 99)),
                emptyRows: new NumberConfig(2,
                                            RulesConfigDescriptionLocalizable.NUMBER_OF_EMPTY_ROWS,
                                            MGPValidators.range(1, 99)),
                width:
                    new NumberConfig(10, RulesConfigDescriptionLocalizable.WIDTH, MGPValidators.range(2, 99)),
                stackPiece:
                    new BooleanConfig(false, CheckersLocalizable.STACK_PIECE),
                maximalCapture:
                    new BooleanConfig(true, CheckersLocalizable.MAXIMAL_CAPTURE),
                simplePieceCanCaptureBackwards:
                    new BooleanConfig(true, CheckersLocalizable.SIMPLE_PIECE_CAN_CAPTURE_BACKWARDS),
                promotedPiecesCanTravelLongDistances:
                    new BooleanConfig(true, CheckersLocalizable.PROMOTED_PIECES_CAN_TRAVEL_LONG_DISTANCES),
                promotedPiecesCanLandWhereTheyWantAfterCapture:
                    new BooleanConfig(true, CheckersLocalizable.PROMOTED_PIECES_CAN_LAND_WHERE_THEY_WANT_AFTER_CAPTURE),
            },
        });

    public static get(): InternationalCheckersRules {
        if (InternationalCheckersRules.singleton.isAbsent()) {
            InternationalCheckersRules.singleton = MGPOptional.of(new InternationalCheckersRules());
        }
        return InternationalCheckersRules.singleton.get();
    }

    public override getRulesConfigDescription(): MGPOptional<RulesConfigDescription<CheckersConfig>> {
        return MGPOptional.of(InternationalCheckersRules.RULES_CONFIG_DESCRIPTION);
    }

}
