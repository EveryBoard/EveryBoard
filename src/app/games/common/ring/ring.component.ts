import { NgClass } from '@angular/common';
import { Component, computed, input, InputSignal, Signal } from '@angular/core';

@Component({
    selector: '[app-ring]',
    templateUrl: './ring.component.svg',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
    imports: [NgClass],
})
export class RingComponent {

    // outside radius meaning circle.r + (circle.strokeWidth / 2)
    public readonly outsideRadius: InputSignal<number> = input(100);

    public readonly strokeColor: InputSignal<string> = input('var(--base-stroke)');

    public readonly strokeWidth: InputSignal<number> = input.required();

    public readonly width: InputSignal<number> = input.required();

    public readonly midRingClasses: InputSignal<string | string[]> = input.required();

    protected outsideStrokeRadius: Signal<number> = computed(() => {
        const outsideStrokeInsideRadius: number = this.outsideRadius() - this.strokeWidth();
        return outsideStrokeInsideRadius + (this.strokeWidth() / 2);
    });

    protected midRingRadius: Signal<number> = computed(() => {
        const outsideStrokeInsideRadius: number = this.outsideRadius() - this.strokeWidth();
        const midRindInsideRadius: number = outsideStrokeInsideRadius - this.width();
        return midRindInsideRadius + (this.width() / 2);
    });

    protected insideStrokeRadius: Signal<number> = computed(() => {
        const outsideStrokeInsideRadius: number = this.outsideRadius() - this.strokeWidth();
        const midRindInsideRadius: number = outsideStrokeInsideRadius - this.width();
        const insideStrokeInsideRadius: number = midRindInsideRadius - this.strokeWidth();
        return insideStrokeInsideRadius + (this.strokeWidth() / 2);
    });

}
