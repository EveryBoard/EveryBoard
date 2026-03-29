import { Component, Input, OnChanges, AfterViewInit } from '@angular/core';

@Component({
    selector: '[app-ring]',
    templateUrl: './ring.component.svg',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
})
export class RingComponent implements AfterViewInit, OnChanges {

    @Input() strokeWidth: number;

    @Input() width: number;

    @Input() strokeColor: string = 'black';

    @Input() midRingClasses: string | string[];

    public outsideStrokeRadius: number;

    public midRingRadius: number;

    public insideStrokeRadius: number;

    public ngAfterViewInit(): void {
        console.log("flaffef", this.strokeWidth, this.width)
        const outsideStrokeInsideRadius: number = 100 - this.strokeWidth;
        this.outsideStrokeRadius = outsideStrokeInsideRadius + (this.strokeWidth / 2);
        const midRindInsideRadius: number = outsideStrokeInsideRadius - this.width;
        this.midRingRadius = midRindInsideRadius + (this.width / 2);
        const insideStrokeInsideRadius: number = midRindInsideRadius - this.strokeWidth;
        this.insideStrokeRadius = insideStrokeInsideRadius + (this.strokeWidth / 2);
        console.log(
            'flaffef',
            this.outsideStrokeRadius,
            outsideStrokeInsideRadius,
            this.midRingRadius,
            midRindInsideRadius,
            this.insideStrokeRadius,
            insideStrokeInsideRadius,
        )
    }

    ngOnChanges(): void {
        console.log('flaffef width', this.width, 'stroke', this.strokeWidth);
    }
}
