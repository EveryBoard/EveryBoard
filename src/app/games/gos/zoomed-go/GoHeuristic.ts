import { AbstractGoHeuristic } from '@everyboard/games';
import { RectangularGoConfig } from '@everyboard/games';
import { ZoomedGoRules } from '@everyboard/games';

export class ZoomedGoHeuristic extends AbstractGoHeuristic<RectangularGoConfig> {

    public constructor() {
        super(ZoomedGoRules.get());
    }

}
