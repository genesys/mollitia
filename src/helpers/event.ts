type EventCallback = ((...params: any) => void);

interface EventListener {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [eventName: string]: ((...args: any[]) => void)[]
}

class EventDisposable {
  // Private Attributes
  private listeners: EventListener;
  private eventName: string;
  private index: number;
  // Constructor
  constructor (listeners: EventListener, eventName: string, index: number) {
    this.listeners = listeners;
    this.eventName = eventName;
    this.index = index;
  }
  // Public Methods
  public dispose (): void {
    this.listeners[this.eventName].splice(this.index, 1);
  }
}

export class EventEmitter {
  // Private Attributes
  private listeners: EventListener;
  // Constructor
  constructor () {
    this.listeners = {};
  }
  // Public Methods
  public on (eventName: string, cb: EventCallback): EventDisposable {
    this.listeners[eventName] = this.listeners[eventName] || [];
    const length = this.listeners[eventName].push(cb);
    return new EventDisposable(this.listeners, eventName, length - 1);
  }
  public off (eventName: string, cb: EventCallback): void {
    const listeners = this.listeners[eventName];
    if (listeners) {
      for (let i = listeners.length; i > 0; i--) {
        if (listeners[i] === cb) {
          listeners.splice(i, 1);
          break;
        }
      }
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public emit (eventName: string, ...args: any[]): boolean {
    const listeners = this.listeners[eventName];
    if (listeners) {
      listeners.forEach((cb) => {
        cb(...args);
      });
      return true;
    }
    return false;
  }
}
