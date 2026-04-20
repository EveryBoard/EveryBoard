import { NgClass } from '@angular/common';
import { Component, input, InputSignal, model, ModelSignal, OnChanges, SimpleChanges } from '@angular/core';

@Component({
    selector: '[app-ring]',
    templateUrl: './ring.component.svg',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
    imports: [NgClass],
})
export class RingComponent implements OnChanges {

    // outside radius meaning circle.r + (circle.strokeWidth / 2)
    public outsideRadius: ModelSignal<number> = model(100);

    public readonly strokeColor: ModelSignal<string> = model('var(--base-stroke)');

    public readonly strokeWidth: InputSignal<number> = input.required();

    public readonly width: InputSignal<number> = input.required();

    public readonly midRingClasses: InputSignal<string | string[]> = input.required();

    public outsideStrokeRadius: ModelSignal<number> = model(0);

    public midRingRadius: ModelSignal<number> = model(0);

    public insideStrokeRadius: ModelSignal<number> = model(0);

    public ngOnChanges(_: SimpleChanges): void {
        this.computeRadii();
    }

    private computeRadii(): void {
        const outsideStrokeInsideRadius: number = this.outsideRadius() - this.strokeWidth();
        this.outsideStrokeRadius.set(
            outsideStrokeInsideRadius + (this.strokeWidth() / 2),
        );
        const midRindInsideRadius: number = outsideStrokeInsideRadius - this.width();
        this.midRingRadius.set(
            midRindInsideRadius + (this.width() / 2),
        );
        const insideStrokeInsideRadius: number = midRindInsideRadius - this.strokeWidth();
        this.insideStrokeRadius.set(
            insideStrokeInsideRadius + (this.strokeWidth() / 2),
        );
    }
}
