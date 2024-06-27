import { AbstractGoMinimax } from '../AbstractGoMinimax';
import { TriGoMoveGenerator } from './TriGoMoveGenerator';
import { TriGoConfig, TriGoRules } from './TriGoRules';

export class TriGoMinimax extends AbstractGoMinimax<TriGoConfig> {

    constructor() {
        super(
            TriGoRules.get(),
            new TriGoMoveGenerator(),
        );
    }

}
