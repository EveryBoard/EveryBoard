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

    /**
     * Gives the translation transform for coordinate x, y, based on SPACE_SIZE
     */
    public getTranslationAt(logicalCoord: Coord): string {
        return this.getTranslationAtXY(logicalCoord.x, logicalCoord.y);
    }

    public getTranslationAtXY(logicalX: number, logicalY: number): string {
        const svgX: number = logicalX * this.SPACE_SIZE;
        const svgY: number = logicalY * this.SPACE_SIZE;
        return this.getSVGTranslation(svgX, svgY);
    }

    public getSVGTranslation(x: number, y: number): string {
        return 'translate(' + x + ', ' + y + ')';
    }

    public getSVGTranslationAt(coord: Coord): string {
        return this.getSVGTranslation(coord.x, coord.y);
    }
}
