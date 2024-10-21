/* eslint-disable @typescript-eslint/no-explicit-any */
import { nanoid } from '../../../Platform/Services/id-service/nanoid/nanoid';
import { State, StateInterface } from './State';
import { Status } from './Status';

export interface TokenInterface {
  readonly id: string;
  parent?: string;
  locked?: boolean;
  history: StateInterface[];
}

export class Token implements TokenInterface {
  public readonly id = nanoid();

  public parent?: string;
  public locked?: boolean;

  public history: State[] = [];

  constructor(data?: Partial<TokenInterface>) {
    if (data) Object.assign(this, data);
  }


  push(state: State) {
    this.history.push(state);

    return this;
  }


  pop() {
    return !this.locked && this.history.pop();
  }

  pause() {
    this.status = Status.Paused;

    return this;
  }


  resume(force = false) {
    if (force) this.status = Status.Ready;
    else if (this.status !== Status.Terminated) {
      this.status = Status.Ready;
    }

    return this;
  }


  isReady() {
    return this.status === Status.Ready;
  }

  isPaused() {
    return this.status === Status.Paused;
  }


  set status(status: Status) {
    this.state.status = status;
  }


  get status() {
    if (!this.state) {
      return Status.Ready;
    }
    else {
      return this.state.status;
    }
  }


  get state() {
    return this.history[this.history.length - 1];
  }


  serialize({ value } = { value: true }) {
    return {
      id: this.id,
      history: this.history.map((s) => s.serialize({ value })),
      ...(this.parent ? { parent: this.parent } : {}),
      ...(this.locked !== undefined ? { locked: this.locked } : {}),
    };
  }


  static deserialize(token: TokenInterface) {
    return new Token({
      ...token,
      history: token.history.map((s) => State.deserialize(s)),
    });
  }


  static build(options?: Partial<TokenInterface>) {
    return new Token({ ...options });
  }
}