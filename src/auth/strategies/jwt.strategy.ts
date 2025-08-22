import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Employee,
  EmployeeDocument,
} from '../../employees/schemas/employee.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: any): Promise<EmployeeDocument> {
    const { sub: employeeId, email } = payload;

    const employee = await this.employeeModel
      .findById(employeeId)
      .select('-password')
      .exec();

    if (!employee) {
      throw new UnauthorizedException('Invalid token: Employee not found');
    }

    if (employee.status !== 'active') {
      throw new UnauthorizedException('Employee account is not active');
    }

    return employee;
  }
}
