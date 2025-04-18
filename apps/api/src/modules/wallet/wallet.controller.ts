import { Controller, Get, Param } from '@nestjs/common';
import { WalletService } from './wallet.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { GetWalletResponseDto } from './dto/get-wallet-response.dto';
import { UserPayload } from 'src/common/types/user-payload.dto';
import { User } from 'src/common/decorators/current-user.decorator';

@ApiBearerAuth()
@Controller('wallet')
export class WalletController {
  private walletService: WalletService;

  constructor(walletService: WalletService) {
    this.walletService = walletService;
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Получить кошелек по ID' })
  @ApiParam({
    name: 'id',
    description: 'ID кошелька',
    example: 'cm7l414nt0000tlksqn3h8nui',
  })
  @ApiResponse({
    status: 200,
    description: 'Успешно найден',
    type: GetWalletResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Кошелек не найден' })
  async getWallet(
    @Param('id') walletId: string,
    @User() user: UserPayload,
  ): Promise<GetWalletResponseDto> {
    return await this.walletService.getWalletById(walletId, user.id);
  }
}
