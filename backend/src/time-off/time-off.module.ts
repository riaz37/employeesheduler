import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TimeOffService } from './time-off.service';
import { TimeOffController } from './time-off.controller';
import { TimeOff, TimeOffSchema } from './schemas/time-off.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TimeOff.name, schema: TimeOffSchema }]),
  ],
  controllers: [TimeOffController],
  providers: [TimeOffService],
  exports: [TimeOffService, MongooseModule],
})
export class TimeOffModule {}
