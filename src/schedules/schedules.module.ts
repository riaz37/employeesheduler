import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';
import { Schedule, ScheduleSchema } from './schemas/schedule.schema';
import { Shift, ShiftSchema } from '../shifts/schemas/shift.schema';
import { Employee, EmployeeSchema } from '../employees/schemas/employee.schema';
import { TimeOff, TimeOffSchema } from '../time-off/schemas/time-off.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Schedule.name, schema: ScheduleSchema },
      { name: Shift.name, schema: ShiftSchema },
      { name: Employee.name, schema: EmployeeSchema },
      { name: TimeOff.name, schema: TimeOffSchema },
    ]),
  ],
  controllers: [SchedulesController],
  providers: [SchedulesService],
  exports: [SchedulesService, MongooseModule],
})
export class SchedulesModule {}
