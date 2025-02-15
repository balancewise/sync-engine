import { ClientModel, Property } from "./decorator";
import { Model } from "./model";
import { UpdateOperation } from "./operation";

@ClientModel('Invoice')
class Invoice extends Model {
    @Property({ type: 'number' })
    amount!: number;

    @Property({ type: 'string' })
    status!: string;

    constructor(id: string) {
        super(id);
        this.amount = 0;
        this.status = 'pending';
    }

    initialize(amount: number, status: string) {
        this.amount = amount;
        this.status = status;
        return this;
    }

    save() {
        const changes = this.getChanges();
        if (Object.keys(changes).length > 0) {
            const transaction = new UpdateOperation(
                this.id,
                'Invoice',
                changes
            );
            this.operationQueue.enqueue(transaction);
        }
    }

    protected getChanges(): Record<string, any> {
        return {
            amount: this.amount,
            status: this.status
        }
    }
}

export { Invoice };