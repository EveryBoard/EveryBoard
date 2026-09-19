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

    private readonly outsideStrokeInsideRadius: Signal<number> = computed(() =>
        this.outsideRadius() - this.strokeWidth(),
    );

    protected readonly outsideStrokeRadius: Signal<number> = computed(() =>
        this.outsideStrokeInsideRadius() + (this.strokeWidth() / 2),
    );

    private readonly midRingInsideRadius: Signal<number> = computed(() =>
        this.outsideStrokeInsideRadius() - this.width(),
    );

    protected readonly midRingRadius: Signal<number> = computed(() =>
        this.midRingInsideRadius() + (this.width() / 2),
    );

    private readonly insideStrokeInsideRadius: Signal<number> = computed(() =>
        this.midRingInsideRadius() - this.strokeWidth(),
    );

    protected readonly insideStrokeRadius: Signal<number> = computed(() =>
        this.insideStrokeInsideRadius() + (this.strokeWidth() / 2),
    );

}
