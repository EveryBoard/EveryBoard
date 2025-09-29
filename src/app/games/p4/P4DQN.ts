import { MGPOptional } from 'src/lib/dist';
import { AI, AIDepthLimitOptions } from '../../jscaip/AI/AI';
import { GameNode } from '../../jscaip/AI/GameNode';
import { P4Move } from './P4Move';
import { P4Config } from './P4Rules';
import { P4State } from './P4State';
import { DqnAiService } from 'src/src/tmp_ai_scripts/dqn-ai.service';
import { inject } from '@angular/core';

export class P4DQN extends AI<P4Move, P4State, AIDepthLimitOptions, P4Config> {

    public override name: string;

    public override availableOptions: AIDepthLimitOptions[];

    // private readonly dqnAiService: DqnAiService = inject(DqnAiService);

    public constructor() {
        super();
        this.name = $localize`DQN`;
    }

    public override chooseNextMove(node: GameNode<P4Move, P4State>,
                                   options: AIDepthLimitOptions,
                                   config: MGPOptional<P4Config>,
    ): P4Move
    {
        console.log('chooseNextMove', node, options, config);
        return P4Move.of(4); // TODO
    }

    public override getInfo(node: GameNode<P4Move, P4State>, config: MGPOptional<P4Config>): string {
        console.log('getInfo', node, config);
        return 'mais quelle belle jajette, TODO'; // TODO
    }

}