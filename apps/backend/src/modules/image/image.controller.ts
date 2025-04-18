import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
  Res,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ImageService } from './image.service';
import { Response } from 'express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

export class CreateImageDto {
  id?: string;
  data: string; // Base64-кодированное изображение
  mimeType: string;
  size: number;
  name: string;
}

@ApiBearerAuth()
@Controller('images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Получить фотографию по imageId' })
  @ApiParam({ name: 'id', required: true, description: 'ID изображения' })
  @ApiResponse({
    status: 200,
    description: 'Успешный ответ',
    content: { 'image/*': {} },
    headers: {
      'Content-Type': {
        description: 'MIME-тип изображения',
        schema: { type: 'string' },
      },
      'Content-Length': {
        description: 'Размер изображения в байтах',
        schema: { type: 'integer' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Изображение не найдено' })
  async getImageById(@Param('id') id: string, @Res() res: Response) {
    const image = await this.imageService.findOne(id);

    if (!image) {
      throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
    }

    const imageBuffer = Buffer.from(image.data, 'base64');

    res.setHeader('Content-Type', image.mimeType);
    res.setHeader('Content-Length', image.size.toString());

    res.send(imageBuffer);
  }

  @Post('upload')
  @ApiOperation({ summary: 'Загрузить фотографию' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Файл успешно загружен',
    content: {
      'application/json': {
        example: {
          id: '123',
          name: 'photo.png',
          data: 'base64string',
          mimeType: 'image/png',
          size: 1024,
          uploadedAt: '2025-03-27T12:00:00Z',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Файл не загружен' })
  @ApiResponse({
    status: 400,
    description: 'Only JPG, JPEG and PNG files are allowed',
  })
  @ApiResponse({ status: 413, description: 'File too large' })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const fileTypes = /jpg|jpeg|png/;
        const extname = fileTypes.test(file.originalname.toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);

        if (extname && mimetype) {
          return cb(null, true);
        }

        cb(
          new HttpException(
            'Only JPG, JPEG and PNG files are allowed',
            HttpStatus.BAD_REQUEST,
          ),
          false,
        );
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    const fileBuffer = Buffer.from(file.buffer);
    const base64Data = fileBuffer.toString('base64');

    const createImageDto: CreateImageDto = {
      data: base64Data,
      mimeType: file.mimetype,
      size: file.size,
      name: file.originalname,
    };

    const createdImage = await this.imageService.create(createImageDto);

    return {
      id: createdImage.id,
      name: createdImage.name,
      data: createdImage.data,
    };
  }

  // @Get('delete/:id')
  // async deleteImageById(@Param('id') id: string, @Res() res: Response) {
  //   try {
  //     // Удаляем изображение через сервис
  //     const deletedImage = await this.imageService.delete(id);

  //     if (!deletedImage) {
  //       return res.status(HttpStatus.NOT_FOUND).send('Image not found');
  //     }

  //     // Возвращаем успешный ответ
  //     return res
  //       .status(HttpStatus.OK)
  //       .send({ message: 'Image deleted successfully' });
  //   } catch (error) {
  //     console.log(error);

  //     return res
  //       .status(HttpStatus.INTERNAL_SERVER_ERROR)
  //       .send('Error deleting image');
  //   }
  // }
}
