import { ClientModel, Property } from "./decorator";
import { Model } from "./model";
import { UpdateOperation } from "./operation";

@ClientModel('Customer')
class Customer extends Model {
    @Property({ type: 'string' })
    name!: string;

    constructor(id: string) {
        super(id);
        this.name = '';
    }

    initialize(name: string) {
        this.name = name;
        return this;
    }

    save() {
        const changes = this.getChanges();
        if (Object.keys(changes).length > 0) {
            const transaction = new UpdateOperation(
                this.id,
                'Customer',
                changes
            );
            this.markChanged();
            this.operationQueue.enqueue(transaction);
        }
    }

    protected getChanges(): Record<string, any> {
        return {
            name: this.name
        };
    }
}

export { Customer };
