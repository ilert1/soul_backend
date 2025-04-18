import { Injectable } from '@nestjs/common';
import { ResponseHashDto } from 'src/common/dto/response-hash.dto';
import { getObjectHash } from 'src/common/utils/hash.utils';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class EventQrService {
  constructor(private prisma: PrismaService) {}

  async getHash(eventId: string, userId: string): Promise<ResponseHashDto> {
    await this.prisma.event.findUniqueOrThrow({
      where: { id: eventId },
    });

    return { hash: getObjectHash({ eventId, inviterId: userId }) };
  }
}
