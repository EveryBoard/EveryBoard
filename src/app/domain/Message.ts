import { FirestoreDocument } from '../dao/FirestoreDAO';
import { FirestoreJSONObject } from '../utils/utils';
import { MinimalUser } from './MinimalUser';
import { FirestoreTime } from './Time';

// A chat message
export interface Message extends FirestoreJSONObject {
    content: string; // the content of the message
    sender: MinimalUser, // the sender of the message
    postedTime: FirestoreTime; // publication time
    currentTurn?: number; // number of the turn when this message was written
}

export type MessageDocument = FirestoreDocument<Message>
