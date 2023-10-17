type EventCallback = ((...params: any) => void);

interface EventListener {
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
  /**
   * Unsubscribes to the event.
   */
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
  /**
   * Subscribes to an event.
   * @param {string} eventName Event name.
   * @param {EventCallback} cb Event callback.
   */
  public on (eventName: string, cb: EventCallback): EventDisposable {
    this.listeners[eventName] = this.listeners[eventName] || [];
    const length = this.listeners[eventName].push(cb);
    return new EventDisposable(this.listeners, eventName, length - 1);
  }
  /**
   * Unsubscribes to an event.
   * @param {string} eventName Event name.
   * @param {EventCallback} cb Event callback.
   */
  public off (eventName: string, cb: EventCallback): void {
    const listeners = this.listeners[eventName];
    if (listeners) {
      for (let i = listeners.length - 1; i > 0; i--) {
        if (listeners[i] === cb) {
          listeners.splice(i, 1);
          break;
        }
      }
    }
  }
  /**
   * Emits an event.
   * @param {string} eventName Event name.
   * @param args Optional parameters.
   */
  
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
  public dispose (): void {
    this.listeners = {};
  }
}
