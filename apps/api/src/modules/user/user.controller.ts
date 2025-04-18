import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { IdParamDto } from 'src/common/dto/id-param.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import {
  UserExampleRequestUpdate,
  UserResponseExample,
} from './dto/examples/user.example';
import { UserResponseDto } from './dto/user-response.dto';
import { TransformField } from 'src/common/decorators/transform-field.decorator';
import { TransformFieldInterceptor } from 'src/common/interceptors/transform-field.interceptor';
import { User } from 'src/common/decorators/current-user.decorator';
import { UserPayload } from 'src/common/types/user-payload.dto';
import { UserGlobalResponseDto } from './dto/response-user.dto';

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
@UseInterceptors(TransformFieldInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Получить профиль текущего пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Профиль пользователя успешно получен',
    schema: {
      example: UserResponseExample,
    },
  })
  @ApiResponse({ status: 401, description: 'Неавторизованный доступ' })
  @TransformField({ '': UserGlobalResponseDto })
  async getProfile(@User() user: UserPayload) {
    return await this.userService.findMe(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить пользователя по ID' })
  @ApiParam({
    name: 'id',
    description: 'ID пользователя в формате UUID',
    example: '123e4567-e89b-12d3-a456-426655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Пользователь успешно найден',
    schema: {
      example: UserResponseExample,
    },
  })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  @TransformField({ '': UserGlobalResponseDto })
  async findOne(@Param() { id }: IdParamDto, @User() user: UserPayload) {
    return await this.userService.findById(id, user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Обновить данные пользователя' })
  @ApiParam({
    name: 'id',
    description: 'ID пользователя в формате UUID',
    example: '123e4567-e89b-12d3-a456-426655440000',
  })
  @ApiBody({
    description: 'Данные для обновления пользователя',
    schema: {
      example: UserExampleRequestUpdate,
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Данные пользователя успешно обновлены',
    schema: {
      example: UserResponseExample,
    },
  })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  @TransformField({ '': UserGlobalResponseDto })
  async updateUser(
    @User() user: UserPayload,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.updateUser(user.id, updateUserDto);
  }

  @Get('/by-event/:eventId')
  @ApiOperation({
    summary: 'Получение всех пользователей - участников по id события',
  })
  @ApiParam({
    name: 'eventId',
    required: true,
    description: 'Данные для получения всех пользователей по id события',
  })
  @ApiResponse({
    status: 200,
    description: 'Список пользователей, связанных с событием',
    type: [UserResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Событие не найдено.' })
  @TransformField({ '': UserResponseDto })
  async getUsersByEventId(
    @Param('eventId') eventId: string,
  ): Promise<UserResponseDto[] | null> {
    return await this.userService.findUsersByEventId(eventId);
  }

  @Patch('ban/:id')
  @ApiOperation({
    summary: 'ADMIN-API Заблокировать/разблокировать пользователя',
  })
  @ApiParam({
    name: 'id',
    description: 'ID пользователя в формате UUID',
    example: '123e4567-e89b-12d3-a456-426655440000',
  })
  @ApiBody({
    description: 'Данные для блокировки/разблокировки пользователя',
    schema: {
      example: {
        isActive: true,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Пользователь успешно заблокирован/разблокирован',
  })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  @TransformField({ '': UserGlobalResponseDto })
  async banUser(
    @Param() { id }: IdParamDto,
    @Body('isActive') isActive: boolean,
  ) {
    return await this.userService.banUser(id, isActive);
  }

  @Get('/by-activity/:activityId')
  @ApiOperation({
    summary: 'ADMIN-API Получение пользователя по id активности',
  })
  @ApiParam({
    name: 'activityId',
    required: true,
    description: 'Данные для получения пользователя по id активности',
  })
  @ApiResponse({
    status: 200,
    description: 'Пользователь, связанный с активностью, найден.',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Пользователь не найден.' })
  @TransformField({ '': UserResponseDto })
  async getUserByActivityId(
    @Param('activityId') activityId: string,
  ): Promise<UserResponseDto | null> {
    return await this.userService.findUserByActivityId(activityId);
  }

  // deprecated
  // @Get()
  // @ApiOperation({ summary: 'Получить список пользователей' })
  // @ApiQuery({
  //   name: 'limit',
  //   required: false,
  //   description: 'Количество записей на странице',
  //   example: 10,
  // })
  // @ApiQuery({
  //   name: 'page',
  //   required: false,
  //   description: 'Номер страницы',
  //   example: 1,
  // })
  // @ApiQuery({
  //   name: 'search',
  //   required: false,
  //   description: 'Поиск по firstName, lastName либо username пользователя',
  //   example: 'John',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Список пользователей успешно получен',
  //   schema: {
  //     example: UserResponsePaginationExample,
  //   },
  // })
  // @TransformField({ '': UserGlobalResponseDto })
  // async findAll(
  //   @Query('limit') limit: number = DEFAULT_PAGE_SIZE,
  //   @Query('page') page: number = 1,
  //   @Query('search') search: string,
  // ) {
  //   const paginationDto: PaginationDto = { limit, page };

  //   return this.userService.findAll(paginationDto, search);
  // }

  // @Post()
  // @ApiOperation({ summary: 'Создать нового пользователя' })
  // @ApiBody({
  //   description: 'Данные для создания пользователя',
  //   examples: {
  //     example: {
  //       value: UserExampleCreate,
  //     },
  //   },
  // })
  // @ApiResponse({
  //   status: 201,
  //   description: 'Пользователь успешно создан',
  //   schema: {
  //     example: UserResponseExample,
  //   },
  // })
  // @ApiResponse({ status: 400, description: 'Некорректные данные' })
  // @UsePipes()
  // @TransformField({ '': UserGlobalResponseDto })
  // async create(@Body() createUserDto: CreateUserDto) {
  //   return await this.userService.create(createUserDto);
  // }
  //
  // @Patch(':id')
  // @ApiOperation({ summary: 'Обновить данные пользователя' })
  // @ApiParam({
  //   name: 'id',
  //   description: 'ID пользователя в формате UUID',
  //   example: '123e4567-e89b-12d3-a456-426655440000',
  // })
  // @ApiBody({
  //   description: 'Данные для обновления пользователя',
  //   schema: {
  //     example: UserExampleUpdate,
  //   },
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Данные пользователя успешно обновлены',
  //   schema: {
  //     example: UserResponseExample,
  //   },
  // })
  // @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  // @TransformField({ '': UserGlobalResponseDto })
  // async update(
  //   @Param() { id }: IdParamDto,
  //   @Body() updateUserDto: UpdateUserDto,
  // ) {
  //   return await this.userService.update(id, updateUserDto);
  // }
}
