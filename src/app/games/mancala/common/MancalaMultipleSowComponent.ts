import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MancalaMove } from './MancalaMove';
import { MancalaRules } from './MancalaRules';
import { MancalaComponent } from './MancalaComponent';

export abstract class MancalaMultipleSowComponent<R extends MancalaRules<M>, M extends MancalaMove>
    extends MancalaComponent<R, M>
{

    protected updateOrCreateCurrentMove(x: number): void {
        if (this.currentMove.isAbsent()) {
            this.hideLastMove();
            this.currentMove = MGPOptional.of(this.generateMove(x));
        } else {
            const newMove: M = this.addToMove(x);
            this.currentMove = MGPOptional.of(newMove);
        }
    }
    /**
     * @param x the x of the MancalaDistribution just made by user click
     * this function must modify or "create" (if absent) this.currentMove
     */
    protected abstract addToMove(x: number): M;
}
