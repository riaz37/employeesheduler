import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import {
  Employee,
  EmployeeDocument,
} from '../employees/schemas/employee.schema';

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  employee: {
    id: string;
    employeeId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    department: string;
    location: string;
    team: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateEmployee(
    email: string,
    password: string,
  ): Promise<EmployeeDocument> {
    const employee = await this.employeeModel
      .findOne({ email: email.toLowerCase() })
      .select('+password')
      .exec();

    if (!employee) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (employee.status !== 'active') {
      throw new UnauthorizedException('Account is not active');
    }

    const isPasswordValid = await bcrypt.compare(password, employee.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return employee;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const employee = await this.validateEmployee(email, password);

    const payload = {
      sub: employee._id,
      email: employee.email,
      role: employee.role,
      department: employee.department,
      location: employee.location,
      team: employee.team,
    };

    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(
      { sub: employee._id, type: 'refresh' },
      {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
      },
    );

    // Update last active date
    await this.employeeModel.updateOne(
      { _id: employee._id },
      { lastActiveDate: new Date() },
    );

    return {
      access_token,
      refresh_token,
      employee: {
        id: employee._id.toString(),
        employeeId: employee.employeeId,
        email: employee.email,
        firstName: employee.firstName,
        lastName: employee.lastName,
        role: employee.role,
        department: employee.department,
        location: employee.location,
        team: employee.team,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const employee = await this.employeeModel
        .findById(payload.sub)
        .select('-password')
        .exec();

      if (!employee || employee.status !== 'active') {
        throw new UnauthorizedException('Employee not found or inactive');
      }

      const newPayload = {
        sub: employee._id,
        email: employee.email,
        role: employee.role,
        department: employee.department,
        location: employee.location,
        team: employee.team,
      };

      const access_token = this.jwtService.sign(newPayload);

      return { access_token };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = this.configService.get<number>(
      'security.bcryptSaltRounds',
      12,
    );
    return bcrypt.hash(password, saltRounds);
  }

  async changePassword(
    employeeId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const employee = await this.employeeModel
      .findById(employeeId)
      .select('+password')
      .exec();

    if (!employee) {
      throw new BadRequestException('Employee not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      employee.password,
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedNewPassword = await this.hashPassword(newPassword);
    await this.employeeModel.updateOne(
      { _id: employeeId },
      { password: hashedNewPassword },
    );
  }

  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async getProfile(employeeId: string): Promise<any> {
    const employee = await this.employeeModel
      .findById(employeeId)
      .select('-password')
      .exec();

    if (!employee) {
      throw new BadRequestException('Employee not found');
    }

    if (employee.status !== 'active') {
      throw new BadRequestException('Employee account is not active');
    }

    return {
      id: employee._id.toString(),
      employeeId: employee.employeeId,
      email: employee.email,
      firstName: employee.firstName,
      lastName: employee.lastName,
      role: employee.role,
      department: employee.department,
      location: employee.location,
      team: employee.team,
      status: employee.status,
      hireDate: employee.hireDate,
      phone: employee.phone,
      emergencyContact: employee.emergencyContact,
      notes: employee.notes,
      isPartTime: employee.isPartTime,
      totalHoursWorked: employee.totalHoursWorked,
      lastActiveDate: employee.lastActiveDate,
      skills: employee.skills,
      availabilityWindows: employee.availabilityWindows,
      workPreference: employee.workPreference,
    };
  }
}
