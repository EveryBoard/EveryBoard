import { GameNode } from 'src/app/jscaip/GameNode';
import { TablutMove } from './TablutMove';
import { TablutState } from './TablutState';
import { TaflRules } from '../TaflRules';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { TaflConfig } from '../TaflConfig';
import { RulesConfigDescription } from 'src/app/components/wrapper-components/rules-configuration/RulesConfigDescription';

export class TablutNode extends GameNode<TablutMove, TablutState> {}

export class TablutRules extends TaflRules<TablutMove, TablutState> {

    private static singleton: MGPOptional<TablutRules> = MGPOptional.empty();

    public static readonly TODO_REMOVE_APRES_REVOYAGE_VOYAGE: TaflConfig = {
        castleIsLeftForGood: false,
        edgesAreKingsEnnemy: true,
        centralThroneCanSurroundKing: false,
        kingFarFromHomeCanBeSandwiched: false,
        invaderStarts: true,
    };

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<TaflConfig> =
        new RulesConfigDescription(
            {
                name: (): string => $localize`Tablut`,
                config: TablutRules.TODO_REMOVE_APRES_REVOYAGE_VOYAGE,
            }, {
                castleIsLeftForGood: (): string => $localize`Central throne is left for good`,
                TODO_FOR_REVIEW: (): string => `quand config est la ref d'une variable, cette ligne est acceptée, si on colle cette exacte même valeur au lieu d'une ref, cette ligne ne compile plus, on fait quoi ? Pareil si qqch manque, seulement repéré at run time (du coup bah ça pète bien clairement et casse les tests qui commencent même pas)`,
                edgesAreKingsEnnemy: (): string => $localize`Edges are king's ennemy`,
                centralThroneCanSurroundKing: (): string => $localize`Central throne can surround king`,
                kingFarFromHomeCanBeSandwiched: (): string => $localize`King far from home can be sandwiched`,
                invaderStarts: (): string => $localize`Invader Starts`,
            });

    public static get(): TablutRules {
        if (TablutRules.singleton.isAbsent()) {
            TablutRules.singleton = MGPOptional.of(new TablutRules());
        }
        return TablutRules.singleton.get();
    }

    private constructor() {
        super(TablutState, TablutRules.TODO_REMOVE_APRES_REVOYAGE_VOYAGE, TablutMove.from);
    }

    public override getRulesConfigDescription(): RulesConfigDescription<TaflConfig> {
        return TablutRules.RULES_CONFIG_DESCRIPTION;
    }

}
