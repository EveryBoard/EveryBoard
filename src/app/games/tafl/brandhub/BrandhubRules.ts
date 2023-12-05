import { TaflState } from '../TaflState';
import { TaflNode, TaflRules } from '../TaflRules';
import { BrandhubMove } from './BrandhubMove';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { TaflConfig } from '../TaflConfig';
import { BooleanConfig, RulesConfigDescription } from 'src/app/components/wrapper-components/rules-configuration/RulesConfigDescription';
import { TaflPawn } from '../TaflPawn';
import { Table } from 'src/app/utils/ArrayUtils';

export class BrandhubNode extends TaflNode<BrandhubMove> {}

export class BrandhubRules extends TaflRules<BrandhubMove> {

    private static singleton: MGPOptional<BrandhubRules> = MGPOptional.empty();

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<TaflConfig> =
        new RulesConfigDescription<TaflConfig>({
            name: (): string => $localize`Brandhub`,
            config: {
                castleIsLeftForGood: new BooleanConfig(true, TaflRules.CASTLE_IS_LEFT_FOR_GOOD),
                edgesAreKingsEnnemy: new BooleanConfig(false, TaflRules.EDGE_ARE_KING_S_ENNEMY),
                centralThroneCanSurroundKing: new BooleanConfig(true, TaflRules.CENTRAL_THRONE_CAN_SURROUND_KING),
                kingFarFromHomeCanBeSandwiched: new BooleanConfig(true, TaflRules.KING_FAR_FROM_HOME_CAN_BE_SANDWICHED),
                invaderStarts: new BooleanConfig(true, TaflRules.INVADER_STARTS),
            },
        });

    public static get(): BrandhubRules {
        if (BrandhubRules.singleton.isAbsent()) {
            BrandhubRules.singleton = MGPOptional.of(new BrandhubRules());
        }
        return BrandhubRules.singleton.get();
    }

    private constructor() {
        super(BrandhubMove.from);
    }

    public getInitialState(config: MGPOptional<TaflConfig>): TaflState {
        const _: TaflPawn = TaflPawn.UNOCCUPIED;
        let I: TaflPawn = TaflPawn.PLAYER_ZERO_PAWN;
        let D: TaflPawn = TaflPawn.PLAYER_ONE_PAWN;
        let K: TaflPawn = TaflPawn.PLAYER_ONE_KING;
        if (config.get().invaderStarts === false) {
            I = TaflPawn.PLAYER_ONE_PAWN;
            D = TaflPawn.PLAYER_ZERO_PAWN;
            K = TaflPawn.PLAYER_ZERO_KING;
        }
        const board: Table<TaflPawn> = [
            [_, _, _, I, _, _, _],
            [_, _, _, I, _, _, _],
            [_, _, _, D, _, _, _],
            [I, I, D, K, D, I, I],
            [_, _, _, D, _, _, _],
            [_, _, _, I, _, _, _],
            [_, _, _, I, _, _, _],
        ];
        return new TaflState(board, 0);
    }

    public override getRulesConfigDescription(): MGPOptional<RulesConfigDescription<TaflConfig>> {
        return MGPOptional.of(BrandhubRules.RULES_CONFIG_DESCRIPTION);
    }

}
