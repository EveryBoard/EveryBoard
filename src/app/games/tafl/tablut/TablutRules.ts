import { TablutMove } from './TablutMove';
import { TaflNode, TaflRules } from '../TaflRules';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { TaflConfig } from '../TaflConfig';
import { RulesConfigDescription } from 'src/app/components/wrapper-components/rules-configuration/RulesConfigDescription';
import { TaflPawn } from '../TaflPawn';
import { Table } from 'src/app/utils/ArrayUtils';
import { TaflState } from '../TaflState';

export class TablutNode extends TaflNode<TablutMove> {}

export class TablutRules extends TaflRules<TablutMove> {

    private static singleton: MGPOptional<TablutRules> = MGPOptional.empty();

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<TaflConfig> =
        new RulesConfigDescription(
            {
                name: (): string => $localize`Tablut`,
                config: {
                    castleIsLeftForGood: false,
                    edgesAreKingsEnnemy: true,
                    centralThroneCanSurroundKing: false,
                    kingFarFromHomeCanBeSandwiched: false,
                    invaderStarts: true,
                },
            }, {
                castleIsLeftForGood: (): string => $localize`Central throne is left for good`,
                edgesAreKingsEnnemy: (): string => $localize`Edges are king's ennemy`,
                centralThroneCanSurroundKing: (): string => $localize`Central throne can surround king`,
                kingFarFromHomeCanBeSandwiched: (): string => $localize`King far from home can be sandwiched`,
                invaderStarts: (): string => $localize`Invader starts`,
            });

    public static get(): TablutRules {
        if (TablutRules.singleton.isAbsent()) {
            TablutRules.singleton = MGPOptional.of(new TablutRules());
        }
        return TablutRules.singleton.get();
    }

    private constructor() {
        super(TablutMove.from);
    }

    public getInitialState(config: TaflConfig): TaflState {
        const _: TaflPawn = TaflPawn.UNOCCUPIED;
        let I: TaflPawn = TaflPawn.PLAYER_ZERO_PAWN;
        let D: TaflPawn = TaflPawn.PLAYER_ONE_PAWN;
        let K: TaflPawn = TaflPawn.PLAYER_ONE_KING;
        if (config.invaderStarts === false) {
            I = TaflPawn.PLAYER_ONE_PAWN;
            D = TaflPawn.PLAYER_ZERO_PAWN;
            K = TaflPawn.PLAYER_ZERO_KING;
        }
        const board: Table<TaflPawn> = [
            [_, _, _, I, I, I, _, _, _],
            [_, _, _, _, I, _, _, _, _],
            [_, _, _, _, D, _, _, _, _],
            [I, _, _, _, D, _, _, _, I],
            [I, I, D, D, K, D, D, I, I],
            [I, _, _, _, D, _, _, _, I],
            [_, _, _, _, D, _, _, _, _],
            [_, _, _, _, I, _, _, _, _],
            [_, _, _, I, I, I, _, _, _],
        ];
        return new TaflState(board, 0);
    }

    public override getRulesConfigDescription(): MGPOptional<RulesConfigDescription<TaflConfig>> {
        return MGPOptional.of(TablutRules.RULES_CONFIG_DESCRIPTION);
    }

}
