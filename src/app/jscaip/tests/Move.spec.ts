import { Encoder } from 'src/app/utils/Encoder';
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { GameState } from '../GameState';
import { GameNode } from '../GameNode';
import { Move } from '../Move';
import { SuperRules } from '../Rules';
import { MoveGenerator } from '../AI';
import { EmptyRulesConfig, RulesConfig } from '../RulesConfigUtil';
import { MGPOptional } from 'src/app/utils/MGPOptional';

export class MoveTestUtils {

    public static testFirstTurnMovesBijectivity<M extends Move,
                                                S extends GameState,
                                                L,
                                                C extends RulesConfig = EmptyRulesConfig>(
        rules: SuperRules<M, S, C, L>,
        generator: MoveGenerator<M, S, C>,
        encoder: Encoder<M>,
        nullableConfig?: MGPOptional<C>,
    ): void
    {
        let config: MGPOptional<C> = rules.getDefaultRulesConfig();
        if (nullableConfig !== undefined) {
            config = nullableConfig;
        }
        const node: GameNode<M, S> = rules.getInitialNode(config);
        const moves: M[] = generator.getListMoves(node, config);
        for (const move of moves) {
            EncoderTestUtils.expectToBeBijective(encoder, move);
        }
    }
}
