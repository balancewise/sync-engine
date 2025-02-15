import { OperationQueue } from "./operation-queue";

export abstract class Model {
  id: string;
  operationQueue: OperationQueue;
    _version = 0;

  static loadStrategy: 'full' | 'partial' = 'full';
  
  constructor(id: string) {
    this.id = id;
    this.operationQueue = new OperationQueue();
  }

  protected abstract getChanges(): Record<string, any>;

  abstract save(): void;
  markChanged() {
    this._version++;
  }
}