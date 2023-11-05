import { Encoder } from 'src/app/utils/Encoder';
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { GameState } from '../GameState';
import { GameNode } from '../GameNode';
import { Move } from '../Move';
import { Rules } from '../Rules';
import { MoveGenerator } from '../AI';
import { RulesConfig } from '../RulesConfigUtil';

export class MoveTestUtils {

    public static testFirstTurnMovesBijectivity<M extends Move,
                                                S extends GameState,
                                                L,
                                                C extends RulesConfig = RulesConfig>(
        rules: Rules<M, S, C, L>,
        generator: MoveGenerator<M, S>,
        encoder: Encoder<M>,
        config: C,
    ): void
    {
        const node: GameNode<M, S> = rules.getInitialNode(config);
        const moves: M[] = generator.getListMoves(node);
        for (const move of moves) {
            EncoderTestUtils.expectToBeBijective(encoder, move);
        }
    }
}
