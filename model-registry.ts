import { Model } from './model';

type ModelClass = typeof Model;
export type ModelProperty = { type: string, lazy?: boolean, indexed?: boolean };

export type ModelMetadata = {
  name: string;
  loadStrategy: 'full' | 'partial';
  schemaVersion: number;
  properties: Map<string, ModelProperty>;
}

export class ModelRegistry {
  private static modelLookup = new Map<string, ModelClass>();
  private static modelProperties = new Map<string, Map<string, ModelProperty>>();

  static registerModel(name: string, constructor: ModelClass) {
    this.modelLookup.set(name, constructor);
    if (!this.modelProperties.has(name)) {
      this.modelProperties.set(name, new Map());
    }
  }

  static registerProperty(modelName: string, propName: string, meta: ModelProperty) {
    const props = this.modelProperties.get(modelName) || new Map();
    props.set(propName, meta);
    this.modelProperties.set(modelName, props);
  }

  static getModel(name: string): ModelClass | undefined {
    return this.modelLookup.get(name);
  }

  static getModels(): ModelClass[] {
    return Array.from(this.modelLookup.values());
  }

  static getModelMetadata(modelClass: ModelClass): ModelMetadata {
    const name = modelClass.name;
    return {
      name,
      loadStrategy: modelClass.loadStrategy,
      schemaVersion: 1, // You might want to make this configurable
      properties: this.modelProperties.get(name) || new Map()
    };
  }
}



