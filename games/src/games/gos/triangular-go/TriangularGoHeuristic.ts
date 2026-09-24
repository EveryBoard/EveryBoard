import { AbstractGoHeuristic } from '../AbstractGoHeuristic';

import { TriangularGoConfig, TriangularGoRules } from './TriangularGoRules';

export class TriangularGoHeuristic extends AbstractGoHeuristic<TriangularGoConfig> {

    public constructor() {
        super(TriangularGoRules.get());
    }

}
