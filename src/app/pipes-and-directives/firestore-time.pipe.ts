import { formatDate } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { Timestamp } from 'firebase/firestore';
import { FirestoreTime } from '../domain/Time';

@Pipe({ name: 'firebaseDate' })
export class FirestoreTimePipe implements PipeTransform {
    public transform(firebaseTime: FirestoreTime): string | null {
        const timestamp: number = (firebaseTime as Timestamp).seconds * 1000;
        return formatDate(timestamp, 'HH:mm:ss', 'en-US');
    }
}
