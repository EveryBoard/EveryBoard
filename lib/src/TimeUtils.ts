export class TimeUtils {

    public static sleep(ms: number): Promise<void> {
        return new Promise((resolve: (result: void) => void) => {
            setTimeout(resolve, ms);
        });
    }
}
