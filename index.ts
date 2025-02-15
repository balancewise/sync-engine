import { Invoice } from "./invoice-model";
import { StoreManager } from "./store-manager";
import { Database } from "./database";

async function main() {
    const database = new Database();
    await database.initialize();

    const invoice = new Invoice("1");
    invoice.initialize(100, "pending");
    invoice.save();

    console.log(invoice.operationQueue);
}

main().catch(console.error);

