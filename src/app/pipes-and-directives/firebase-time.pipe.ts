import { formatDate } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { FirebaseTime, Time } from '../domain/Time';

@Pipe({ name: 'firebaseDate' })
export class FirebaseTimePipe implements PipeTransform {
    public transform(firebaseTime: FirebaseTime): string | null {
        const timestamp: number =(firebaseTime as Time).seconds * 1000;
        return formatDate(timestamp, 'HH:mm:ss', 'en-US');
    }
}
