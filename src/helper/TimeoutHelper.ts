export default class TimeoutHelper {
  private timeoutId: number | null = null;

  private readonly handler: () => void;

  private readonly timeoutMs: number;

  public constructor(handler: () => void, timeoutMs: number) {
    this.handler = handler;
    this.timeoutMs = timeoutMs;
  }

  public schedule() {
    if (null !== this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(this.handler, this.timeoutMs);
  }
}
