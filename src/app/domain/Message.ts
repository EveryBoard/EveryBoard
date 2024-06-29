import { FirestoreDocument } from '../dao/FirestoreDAO';
import { MinimalUser } from './MinimalUser';
import { FirestoreTime } from './Time';

// A chat message
export type Message = {
    content: string; // the content of the message
    sender: MinimalUser, // the sender of the message
    postedTime: FirestoreTime; // publication time
    currentTurn?: number; // number of the turn when this message was written
}

export type MessageDocument = FirestoreDocument<Message>;
