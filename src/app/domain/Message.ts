import { FirebaseDocument } from '../dao/FirebaseFirestoreDAO';
import { FirebaseJSONObject } from '../utils/utils';
import { MinimalUser } from './MinimalUser';
import { FirebaseTime } from './Time';

// A chat message
export interface Message extends FirebaseJSONObject {
    content: string; // the content of the message
    sender: MinimalUser, // the sender of the message
    postedTime: FirebaseTime; // publication time
    currentTurn?: number; // number of the turn when this message was written
}

export type MessageDocument = FirebaseDocument<Message>
