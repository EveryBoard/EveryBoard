import { MGPOptional } from '@everyboard/lib';

import { BooleanConfig, NumberConfig, RulesConfigDescription, RulesConfigDescriptionLocalizable } from '../../../components/wrapper-components/rules-configuration/RulesConfigDescription';
import { HexagonalUtils } from '../../../jscaip/HexagonalUtils';
import { PlayerNumberMap } from '../../../jscaip/PlayerMap';
import { RulesConfig } from '../../../jscaip/RulesConfigUtil';
import { TriangularCheckerBoard } from '../../../jscaip/state/TriangularCheckerBoard';
import { MGPValidators } from '../../../utils/MGPValidator';
import { AbstractGoRules } from '../AbstractGoRules';
import { GoGroupDataFactory, TriangularGoGroupDataFactory } from '../GoGroupDataFactory';
import { GoPhase } from '../GoPhase';
import { GoPiece } from '../GoPiece';
import { GoState } from '../GoState';

export type TrigoConfig = RulesConfig & {

    size: number;

    hexagonal: boolean;

}

export class TrigoRules extends AbstractGoRules<TrigoConfig> {

    private static singleton: MGPOptional<TrigoRules> = MGPOptional.empty();

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<TrigoConfig> =
        new RulesConfigDescription<TrigoConfig>({
            name: (): string => $localize`Standard`,
            config: {
                size: new NumberConfig(7, RulesConfigDescriptionLocalizable.SIZE, MGPValidators.range(1, 99)),
                hexagonal: new BooleanConfig(false, () => $localize`Hexagonal`),
            },
        });

    public static get(): TrigoRules {
        if (TrigoRules.singleton.isAbsent()) {
            TrigoRules.singleton = MGPOptional.of(new TrigoRules());
        }
        return TrigoRules.singleton.get();
    }

    public constructor() {
        super(false);
    }

    public override getInitialState(optionalConfig: MGPOptional<TrigoConfig>): GoState {
        const config: TrigoConfig = optionalConfig.get();
        const size: number = config.size;
        let board: GoPiece[][];
        if (config.hexagonal) {
            board = HexagonalUtils.createBoard(size, GoPiece.UNREACHABLE, GoPiece.EMPTY);
        } else {
            board = TriangularCheckerBoard.createBoard(size, GoPiece.UNREACHABLE, GoPiece.EMPTY);
        }
        return new GoState(board, PlayerNumberMap.of(0, 0), 0, MGPOptional.empty(), GoPhase.PLAYING);
    }

    public override getRulesConfigDescription(): MGPOptional<RulesConfigDescription<TrigoConfig>> {
        return MGPOptional.of(TrigoRules.RULES_CONFIG_DESCRIPTION);
    }

    public override getGoGroupDataFactory(): GoGroupDataFactory {
        return new TriangularGoGroupDataFactory();
    }

}
