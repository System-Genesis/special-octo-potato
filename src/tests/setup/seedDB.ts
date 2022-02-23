import * as mongoose from 'mongoose';

import { seedDB, emptyDB } from './seedUtils';

(async () => {
    await mongoose.connect(`mongodb://127.0.0.1:28000/genesis`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });
    try {
        await emptyDB();
        await seedDB();
    } catch (err) {
        console.log(err);
    }
})();
