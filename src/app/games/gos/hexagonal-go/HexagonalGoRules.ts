import { MGPOptional } from '@everyboard/lib';

import { AbstractGoRules } from '../AbstractGoRules';
import { GoState } from '../GoState';
import { GoPiece } from '../GoPiece';
import { PlayerNumberMap } from '../../../jscaip/PlayerMap';
import { NumberConfig, RulesConfigDescription, RulesConfigDescriptionLocalizable } from '../../../components/wrapper-components/rules-configuration/RulesConfigDescription';
import { MGPValidators } from '../../../utils/MGPValidator';
import { HexagonalGoGroupDataFactory } from '../GoGroupDataFactory';
import { GroupDataFactory } from '../../../jscaip/BoardData';
import { HexagonalUtils } from '../../../jscaip/HexagonalUtils';
import { GoPhase } from '../GoPhase';
import { TableUtils } from 'src/app/jscaip/TableUtils';

export type HexagonalGoConfig = {

    size: number;

    // hexagonal: boolean;

};

export class HexagonalGoRules extends AbstractGoRules<HexagonalGoConfig> {

    private static singleton: MGPOptional<HexagonalGoRules> = MGPOptional.empty();

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<HexagonalGoConfig> =
        new RulesConfigDescription<HexagonalGoConfig>({
            name: (): string => $localize`Standard`,
            config: {
                size: new NumberConfig(
                    7,
                    RulesConfigDescriptionLocalizable.SIZE,
                    MGPValidators.range(1, 99)),
                // hexagonal: new BooleanConfig(
                //     false,
                //     () => $localize`Hexagonal`),
            },
        });

    public static get(): HexagonalGoRules {
        if (HexagonalGoRules.singleton.isAbsent()) {
            HexagonalGoRules.singleton = MGPOptional.of(new HexagonalGoRules());
        }
        return HexagonalGoRules.singleton.get();
    }

    public override getInitialState(optionalConfig: MGPOptional<HexagonalGoConfig>): GoState {

            const X: GoPiece = GoPiece.LIGHT;
            const O: GoPiece = GoPiece.DARK;
            const k: GoPiece = GoPiece.DEAD_LIGHT;
            const u: GoPiece = GoPiece.DEAD_DARK;
            const w: GoPiece = GoPiece.LIGHT_TERRITORY;
            const b: GoPiece = GoPiece.DARK_TERRITORY;
            const _: GoPiece = GoPiece.EMPTY;
            const N: GoPiece = GoPiece.UNREACHABLE;
        const config: HexagonalGoConfig = optionalConfig.get();
        const size: number = config.size;
        const boardSize: number = (size * 2) - 1;
        const maximumDiagonalIndex: number = (3 * size) - 2;
        let board: GoPiece[][] = TableUtils.create(boardSize, boardSize, GoPiece.UNREACHABLE);
        for (let y: number = 0; y < boardSize; y++) {
            for (let x: number = 0; x < boardSize; x++) {
                const diagonalIndex: number = x + y;
                if (size - 2 < diagonalIndex && diagonalIndex < maximumDiagonalIndex) {
                    board[y][x] = GoPiece.EMPTY;
                }
            }
        }
        board = [
                [N, N, N, N, N, N, _, _, _, _, _, X, _],
                [N, N, N, N, N, _, _, _, _, _, _, X, _],
                [N, N, N, N, _, _, _, _, _, _, _, _, _],
                [N, N, N, _, _, _, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, O, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, _, _, N, N, N, N],
                [_, _, O, O, _, _, _, _, N, N, N, N, N],
                [_, _, _, O, _, _, _, N, N, N, N, N, N],
        ];
        return new GoState(board, PlayerNumberMap.of(0, 0), 0, MGPOptional.empty(), GoPhase.PLAYING);
        // return new GoState(board, PlayerNumberMap.of(0, 0), 0, MGPOptional.empty(), GoPhase.COUNTING);
    }

    public override getRulesConfigDescription(): MGPOptional<RulesConfigDescription<HexagonalGoConfig>> {
        return MGPOptional.of(HexagonalGoRules.RULES_CONFIG_DESCRIPTION);
    }

    public override getGoGroupDataFactory(): GroupDataFactory<GoPiece> {
        return new HexagonalGoGroupDataFactory();
    }

}
