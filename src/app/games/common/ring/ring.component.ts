import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
    selector: '[app-ring]',
    templateUrl: './ring.component.svg',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
})
export class RingComponent implements OnChanges {

    // outside radius meaning circle.r + (circle.strokeWidth / 2)
    @Input() outsideRadius: number = 100;

    @Input() strokeColor: string = 'black';

    @Input() strokeWidth: number;

    @Input() width: number;

    @Input() midRingClasses: string | string[];

    public outsideStrokeRadius: number;

    public midRingRadius: number;

    public insideStrokeRadius: number;

    public ngOnChanges(_: SimpleChanges): void {
        this.computeRadii();
    }

    private computeRadii(): void {
        const outsideStrokeInsideRadius: number = this.outsideRadius - this.strokeWidth;
        this.outsideStrokeRadius = outsideStrokeInsideRadius + (this.strokeWidth / 2);
        const midRindInsideRadius: number = outsideStrokeInsideRadius - this.width;
        this.midRingRadius = midRindInsideRadius + (this.width / 2);
        const insideStrokeInsideRadius: number = midRindInsideRadius - this.strokeWidth;
        this.insideStrokeRadius = insideStrokeInsideRadius + (this.strokeWidth / 2);
    }
}
