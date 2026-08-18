import { Coord } from '@everyboard/games';

import { BaseComponent } from '../../BaseComponent';

/**
 * Define some methods that are useful to have in game components.
 * We can't define these in GameComponent itself, as they are required
 * by sub components which themselves are not GameComponent subclasses
 */
export abstract class BaseGameComponent extends BaseComponent {

    public SPACE_SIZE: number = 100;

    public readonly STROKE_WIDTH: number = 8;

    public readonly SMALL_STROKE_WIDTH: number = 2;

    public getSVGTranslation(x: number, y: number): string {
        return 'translate(' + x + ', ' + y + ')';
    }

    public getSVGTranslationAt(coord: Coord): string {
        return this.getSVGTranslation(coord.x, coord.y);
    }
}
