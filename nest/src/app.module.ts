import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter.js';
import { databaseProvider } from './db/database.provider.js';

@Module({
  imports: [
    // Tambahkan modul-modul route di sini (misal: AuthModule, UserModule)
  ],
  providers: [
    databaseProvider,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Middleware kustom bisa didaftarkan di sini menggunakan consumer.apply(...)
  }
}
