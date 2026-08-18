import { AbstractGoHeuristic } from '../AbstractGoHeuristic';

import { GoConfig, GoRules } from './GoRules';

export class GoHeuristic extends AbstractGoHeuristic<GoConfig> {

    public constructor() {
        super(GoRules.get());
    }

}
