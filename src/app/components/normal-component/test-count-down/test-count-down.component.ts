import { Component, ViewChild } from '@angular/core';
import { display } from 'src/app/utils/utils/utils';
import { CountDownComponent } from '../count-down/count-down.component';

@Component({
    selector: 'app-test-count-down',
    templateUrl: './test-count-down.component.html',
})
export class TestCountDownComponent {

    @ViewChild('testChrono') public testChrono: CountDownComponent;

    public set(duration: number): void {
        this.testChrono.setDuration(duration);
    }
    public start(): void {
        this.testChrono.start();
    }
    public pause(): void {
        this.testChrono.pause();
    }
    public resume(): void {
        this.testChrono.resume();
    }
    public stop(): void {
        this.testChrono.stop();
    }
    public reachedOutOfTime(): void {
        display(true, 'reachedOutOfTime CONNAER!');
    }
}
