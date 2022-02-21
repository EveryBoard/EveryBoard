import { FirebaseDocument } from '../dao/FirebaseFirestoreDAO';
import { FirebaseJSONObject } from '../utils/utils';
import { FirebaseTime } from './Time';

// A chat message
export interface Message extends FirebaseJSONObject {
    content: string; // the content of the message
    senderId: string; // user id of the sender
    sender: string; // the name of the sender
    postedTime: FirebaseTime; // publication time
    currentTurn?: number; // number of the turn when this message was written
}

export type MessageDocument = FirebaseDocument<Message>
