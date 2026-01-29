/* eslint-disable @typescript-eslint/no-explicit-any */
// bootstrap.ts

// Fake $localize function to prevent crash in Node.js
(globalThis as any).$localize = (strings: TemplateStringsArray, ...values: any[]): string =>
    strings.reduce((result: string, str: string, i: number) => result + (values[i - 1] ?? '') + str);

// Import your real logic
import './engine'; // or whatever your logic file is
