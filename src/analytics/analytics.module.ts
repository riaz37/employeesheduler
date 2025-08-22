import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Shift, ShiftSchema } from '../shifts/schemas/shift.schema';
import { Employee, EmployeeSchema } from '../employees/schemas/employee.schema';
import { TimeOff, TimeOffSchema } from '../time-off/schemas/time-off.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Shift.name, schema: ShiftSchema },
      { name: Employee.name, schema: EmployeeSchema },
      { name: TimeOff.name, schema: TimeOffSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
