import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'elo' })
export class EloPipe implements PipeTransform {
    public transform(value: number): string {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
            useGrouping: false,
        }).format(value);
    }
}
