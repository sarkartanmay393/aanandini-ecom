import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
    private readonly logger = new Logger(StorageService.name);
    private readonly isProd = process.env.NODE_ENV === 'production';
    private s3?: S3Client;
    private bucket?: string;

    constructor() {
        if (this.isProd) {
            this.s3 = new S3Client({
                region: process.env.AWS_REGION || 'ap-south-1',
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
                },
            });
            this.bucket = process.env.AWS_S3_BUCKET || 'aanandini-uploads';
            this.logger.log('StorageService configured for AWS S3');
        } else {
            const uploadsDir = path.join(process.cwd(), 'uploads');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }
            this.logger.log('StorageService configured for local disk');
        }
    }

    async uploadFile(
        file: Express.Multer.File,
        folder: 'images' | 'videos',
    ): Promise<string> {
        const ext = path.extname(file.originalname) || '.jpg';
        const filename = `${folder}/${this.generateId()}${ext}`;

        if (this.isProd && this.s3 && this.bucket) {
            await this.s3.send(
                new PutObjectCommand({
                    Bucket: this.bucket,
                    Key: filename,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                }),
            );
            const url = `https://${this.bucket}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${filename}`;
            this.logger.log(`Uploaded to S3: ${url}`);
            return url;
        }

        // Dev: save to disk
        const uploadsDir = path.join(process.cwd(), 'uploads', folder);
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const filePath = path.join(uploadsDir, `${this.generateId()}${ext}`);
        fs.writeFileSync(filePath, file.buffer);

        const relativePath = path.relative(path.join(process.cwd(), 'uploads'), filePath);
        const url = `http://localhost:${process.env.PORT || 3000}/uploads/${relativePath}`;
        this.logger.log(`Saved to disk: ${url}`);
        return url;
    }

    private generateId(): string {
        return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    }
}
