import { AbstractGoHeuristic } from '../AbstractGoHeuristic';

import { TrigoConfig, TrigoRules } from './TrigoRules';

export class TrigoHeuristic extends AbstractGoHeuristic<TrigoConfig> {

    public constructor() {
        super(TrigoRules.get());
    }

}
