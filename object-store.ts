import { ModelMetadata } from "./model-registry";

const generateStoreHash = async (modelName: string, properties: string[], schemaVersion: number): Promise<string> => {
    const hashContent = `${modelName}-${properties.join(',')}-${schemaVersion}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(hashContent);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

abstract class ObjectStore {
    protected dbName: string = '';
    protected storeName: string = ''; 
    protected isInitialized: boolean = false;

    constructor(protected model: ModelMetadata) {}

    protected async initializeStore() {
        const properties = Object.keys(this.model.properties);
        this.storeName = await generateStoreHash(
            this.model.name,
            properties,
            this.model.schemaVersion
        );
    }

    abstract createStore(db: IDBDatabase): void;
    abstract getDatabaseName(): string;
    abstract initialize(): Promise<void>;
}

class FullObjectStore extends ObjectStore {
    constructor(model: ModelMetadata) {
        super(model);
        console.log("FullObjectStore constructor", model);
    }

    async initialize() {
        this.dbName = await generateStoreHash(
            this.model.name,
            Object.keys(this.model.properties),
            this.model.schemaVersion
        );
       await this.initializeStore();
        this.isInitialized = true;
    }

    getDatabaseName() {
        if (!this.isInitialized) {
            throw new Error("Store not initialized");
        }
        return this.dbName;
    }

    createStore(db: IDBDatabase) {
        if (!this.isInitialized) {
            throw new Error("Store not initialized");
        }

        if (!db.objectStoreNames.contains(this.storeName)) {
            const store = db.createObjectStore(this.storeName, {
                keyPath: 'id',
                autoIncrement: false
            });

            // Create indexes for indexed properties
            Object.entries(this.model.properties).forEach(([name, meta]) => {
                if (meta.indexed) {
                    store.createIndex(name, name, { unique: false });
                }
            });
        }
    }
}

class PartialObjectStore extends ObjectStore {
    private partialDbName: string;

    constructor(model: ModelMetadata) {
        super(model);
    }

    getDatabaseName() {
        return this.partialDbName;
    }

    async initialize() {
        this.initializeStore();
        this.partialDbName = `${this.storeName}_partial`;
        this.isInitialized = true;
    }

    createStore(db: IDBDatabase) {
        // Create main store
        if (!db.objectStoreNames.contains(this.storeName)) {
            const store = db.createObjectStore(this.storeName, {
                keyPath: 'id',
                autoIncrement: false
            });

            // Create partial index store
            db.createObjectStore('partial_indexes', {
                keyPath: 'indexKey'
            });
        }
    }

    async initializeDB() {
        this.dbName = await generateStoreHash(
            this.model.name,
            Object.keys(this.model.properties),
            this.model.schemaVersion
        );
    }
}

export { ObjectStore, FullObjectStore, PartialObjectStore };