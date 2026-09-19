import { MancalaMoveGenerator } from '../common/MancalaMoveGenerator';

import { KalahRules } from './KalahRules';

export class KalahMoveGenerator extends MancalaMoveGenerator {

    public constructor() {
        super(KalahRules.get());
    }

}
