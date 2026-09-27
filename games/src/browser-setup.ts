import '@angular/localize/init';

class MemoryStorage implements Storage {

    private readonly values: Map<string, string> = new Map<string, string>();

    public get length(): number {
        return this.values.size;
    }

    public clear(): void {
        this.values.clear();
    }

    public getItem(key: string): string | null {
        return this.values.get(key) ?? null;
    }

    public key(index: number): string | null {
        return Array.from(this.values.keys())[index] ?? null;
    }

    public removeItem(key: string): void {
        this.values.delete(key);
    }

    public setItem(key: string, value: string): void {
        this.values.set(key, value);
    }
}

Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: new MemoryStorage(),
});
Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { language: 'en' },
});
Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: globalThis,
});
