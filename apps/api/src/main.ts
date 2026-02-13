import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    app.enableCors();

    // Serve uploaded files in dev
    if (process.env.NODE_ENV !== 'production') {
        app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });
    }

    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 Aanandini API running on http://localhost:${port}`);
}

bootstrap();
