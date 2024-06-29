import { AwaleRules } from './AwaleRules';
import { MancalaMoveGenerator } from '../common/MancalaMoveGenerator';

export class AwaleMoveGenerator extends MancalaMoveGenerator {

    public constructor() {
        super(AwaleRules.get());
    }

}
