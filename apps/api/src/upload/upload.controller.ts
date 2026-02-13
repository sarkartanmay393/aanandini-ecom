import {
    Controller,
    Post,
    UploadedFiles,
    UploadedFile,
    UseInterceptors,
    UseGuards,
    BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { StorageService } from './storage.service';

const IMAGE_MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const VIDEO_MAX_SIZE = 50 * 1024 * 1024; // 50 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

@Controller('upload')
@UseGuards(AuthGuard('jwt'))
export class UploadController {
    constructor(private readonly storageService: StorageService) { }

    @Post('images')
    @UseInterceptors(
        FilesInterceptor('files', 10, {
            limits: { fileSize: IMAGE_MAX_SIZE },
            fileFilter: (_, file, cb) => {
                if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
                    return cb(new BadRequestException(`Invalid image type: ${file.mimetype}. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`), false);
                }
                cb(null, true);
            },
        }),
    )
    async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
        if (!files || files.length === 0) {
            throw new BadRequestException('No image files provided');
        }

        const urls = await Promise.all(
            files.map((file) => this.storageService.uploadFile(file, 'images')),
        );

        return { urls };
    }

    @Post('video')
    @UseInterceptors(
        FileInterceptor('file', {
            limits: { fileSize: VIDEO_MAX_SIZE },
            fileFilter: (_, file, cb) => {
                if (!ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
                    return cb(new BadRequestException(`Invalid video type: ${file.mimetype}. Allowed: ${ALLOWED_VIDEO_TYPES.join(', ')}`), false);
                }
                cb(null, true);
            },
        }),
    )
    async uploadVideo(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No video file provided');
        }

        const url = await this.storageService.uploadFile(file, 'videos');
        return { url };
    }
}
