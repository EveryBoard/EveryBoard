import { MGPOptional } from '@everyboard/lib';

import { AbstractGoRules } from '../AbstractGoRules';
import { GoState } from '../GoState';
import { GoPiece } from '../GoPiece';
import { PlayerNumberMap } from '../../../jscaip/PlayerMap';
import { BooleanConfig, NumberConfig, RulesConfigDescription, RulesConfigDescriptionLocalizable } from '../../../components/wrapper-components/rules-configuration/RulesConfigDescription';
import { MGPValidators } from '../../../utils/MGPValidator';
import { TriangularGoGroupDataFactory } from '../GoGroupDataFactory';
import { GroupDataFactory } from '../../../jscaip/BoardData';
import { TriangularCheckerBoard } from '../../../jscaip/state/TriangularCheckerBoard';
import { HexagonalUtils } from '../../../jscaip/HexagonalUtils';
import { GoPhase } from '../GoPhase';

export type TrigoConfig = {

    size: number;

    hexagonal: boolean;

};

export class TrigoRules extends AbstractGoRules<TrigoConfig> {

    private static singleton: MGPOptional<TrigoRules> = MGPOptional.empty();

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<TrigoConfig> =
        new RulesConfigDescription<TrigoConfig>({
            name: (): string => $localize`Standard`,
            config: {
                size: new NumberConfig(
                    7,
                    RulesConfigDescriptionLocalizable.SIZE,
                    MGPValidators.range(1, 99)),
                hexagonal: new BooleanConfig(
                    false,
                    () => $localize`Hexagonal`),
            },
        });

    public static get(): TrigoRules {
        if (TrigoRules.singleton.isAbsent()) {
            TrigoRules.singleton = MGPOptional.of(new TrigoRules());
        }
        return TrigoRules.singleton.get();
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
            const X: GoPiece = GoPiece.LIGHT;
            const O: GoPiece = GoPiece.DARK;
            const k: GoPiece = GoPiece.DEAD_LIGHT;
            const u: GoPiece = GoPiece.DEAD_DARK;
            const w: GoPiece = GoPiece.LIGHT_TERRITORY;
            const b: GoPiece = GoPiece.DARK_TERRITORY;
            const _: GoPiece = GoPiece.EMPTY;
            const N: GoPiece = GoPiece.UNREACHABLE;
        board = [

                [N, N, N, N, N, N, w, N, N, N, N, N, N],
                [N, N, N, N, N, w, w, w, N, N, N, N, N],
                [N, N, N, N, w, w, w, w, w, N, N, N, N],
                [N, N, N, w, w, w, w, w, w, w, N, N, N],
                [N, N, X, w, w, w, w, w, w, w, w, N, N],
                [N, b, O, O, X, w, w, w, w, w, w, w, N],
                [b, b, b, O, X, w, w, w, w, w, w, w, w],
        ];
        return new GoState(board, PlayerNumberMap.of(0, 0), 0, MGPOptional.empty(), GoPhase.PLAYING);
    }

    public override getRulesConfigDescription(): MGPOptional<RulesConfigDescription<TrigoConfig>> {
        return MGPOptional.of(TrigoRules.RULES_CONFIG_DESCRIPTION);
    }

    public override getGoGroupDataFactory(): GroupDataFactory<GoPiece> {
        return new TriangularGoGroupDataFactory();
    }

}
