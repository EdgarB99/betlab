import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import { BetsModule } from "./bets/bets.module";
import { EventsModule } from "./events/events.module";
import { HealthModule } from "./health/health.module";
import { FootballModule } from "./football/football.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({
        type: "postgres",
        host: c.get("DB_HOST", "postgres"),
        port: c.get("DB_PORT", 5432),
        username: c.get("DB_USER", "betlab"),
        password: c.get("DB_PASSWORD"),
        database: c.get("DB_NAME", "betlab"),
        autoLoadEntities: true,
        synchronize: c.get("NODE_ENV") !== "production",
      }),
    }),
    AuthModule,
    UsersModule,
    EventsModule,
    BetsModule,
    HealthModule,
    FootballModule,
  ],
})
export class AppModule {}
