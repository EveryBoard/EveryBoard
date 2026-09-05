import { MancalaMoveGenerator } from '../common/MancalaMoveGenerator';

import { BaAwaRules } from './BaAwaRules';

export class BaAwaMoveGenerator extends MancalaMoveGenerator {

    public constructor() {
        super(BaAwaRules.get());
    }

}
