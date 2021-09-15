import { Pipe, PipeTransform } from '@angular/core';

export type Duration = number

@Pipe({ name: 'humanDuration' })
export class HumanDuration implements PipeTransform {
    public transform(duration: Duration): string {
        const seconds: number = duration % 60;
        const minutes: number = ((duration - seconds) % 3600) / 60;
        const hours: number = (duration - (minutes * 60) - seconds) / 3600;
        const text: string[] = [];
        if (hours > 1) {
            text.push($localize`${ hours } hours`);
        } else if (hours === 1) {
            text.push($localize`1 hour`);
        }
        if (minutes > 1) {
            text.push($localize`${ minutes } minutes`);
        } else if (minutes === 1) {
            text.push($localize`1 minute`);
        }
        if (seconds > 1) {
            text.push($localize`${ seconds } seconds`);
        } else if (seconds === 1) {
            text.push($localize`1 second`);
        }
        if (text.length === 0) {
            return $localize`0 seconds`;
        } else if (text.length === 1) {
            return text[0];
        } else {
            const first: string = text.slice(0, -1).join(', ');
            const second: string = text.slice(-1)[0];
            return $localize`${ first } and ${ second }`;
        }
    }
}
