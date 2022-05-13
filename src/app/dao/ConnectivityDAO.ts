import { Injectable } from '@angular/core';
import { Database, DatabaseReference, onDisconnect, ref, set } from '@angular/fire/database';
import { serverTimestamp } from 'firebase/database';

interface ConnectivityStatus {
    // eslint-disable-next-line camelcase
    last_changed: unknown,
}

@Injectable({
    providedIn: 'root',
})
export class ConnectivityDAO {
    private static readonly OFFLINE: ConnectivityStatus = {
        last_changed: serverTimestamp(),
    };
    private static readonly ONLINE: ConnectivityStatus = {
        last_changed: serverTimestamp(),
    };
    public constructor(private readonly db: Database) {
    }
    public setOffline(uid: string): Promise<void> {
        return set(ref(this.db, '/status/' + uid), ConnectivityDAO.OFFLINE);
    }
    public async launchAutomaticPresenceUpdate(uid: string): Promise<void> {
        const userStatusDatabaseRef: DatabaseReference = ref(this.db, '/status/' + uid);
        await set(userStatusDatabaseRef, ConnectivityDAO.ONLINE);
        await onDisconnect(userStatusDatabaseRef).set(ConnectivityDAO.OFFLINE);
    }
}
