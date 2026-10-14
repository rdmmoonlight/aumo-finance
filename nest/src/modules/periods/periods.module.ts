import { Module } from '@nestjs/common';
import { db } from '../../main';
import { GeneralLedgersService } from '../ledgers/gl.service';
import {
    DRIZZLE_DB,
    GL_SERVICE,
    PeriodsService,
    TX_NUMBER_SERVICE
} from '../periods/periods.sevice';
import { TransactionNumberService } from '../transactions/tx-number.service';

@Module({
    controllers: [PeriodsController], // Uncomment jika Anda punya controller
    providers: [
        PeriodsService,

        // 1. Injeksi Drizzle ORM Instance
        {
            provide: DRIZZLE_DB,
            useValue: db, // Memasukkan instance Drizzle ORM yang sudah terkonfigurasi
        },

        // 2. Injeksi TransactionNumberService
        {
            provide: TX_NUMBER_SERVICE,
            useClass: TransactionNumberService, // Class nyata yang mengimplementasikan ITransactionNumberService
        },

        // 3. Injeksi GeneralLedgersService
        {
            provide: GL_SERVICE,
            useClass: GeneralLedgersService, // Class nyata yang mengimplementasikan IGeneralLedgersService
        },
    ],
    // Export PeriodsService agar module lain (misal: ReportsModule) bisa menggunakannya
    exports: [PeriodsService],
})
export class PeriodsModule { }