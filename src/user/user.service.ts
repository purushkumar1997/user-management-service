import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/dto/createUser.dto';
import { Role } from 'src/entities/role.entity';
import { User } from 'src/entities/user.entity';
import {
  JwtPayload,
  UserDetails,
  UserListDetails,
  Username,
} from 'src/interface/user.interface';
import { LoggerService } from 'src/logger/logger.service';
import { RoleService } from 'src/role/role.service';
import { JwtService } from '@nestjs/jwt';
import { Constants } from 'src/common/constants';
import { JwtDto } from 'src/dto/jwtPayload.dto';
import { Repository } from 'typeorm';
import { Console } from 'console';
import { UpdateUserDto } from 'src/dto/updateUser.dto';

@Injectable()
export class UserService {
  private readonly AppName: 'UserService';
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly logger: LoggerService,
    private readonly roleService: RoleService,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(
      `createUser started for email ${createUserDto.email}`,
      this.AppName,
    );
    try {
      const { roleId, ...details } = createUserDto;
      const role: Role = await this.roleService.findRoleById(roleId);
      if (!role) {
        this.logger.error(
          `createUser failed as role is not found in system`,
          this.AppName,
        );
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: 'Role is not found in system',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      const existingUserByUsername = await this.userRepository.findOne({
        where: { username: details.username },
      });
      if (existingUserByUsername && existingUserByUsername.active) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: 'Username is allready in system',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      const existingUserByEmail = await this.userRepository.findOne({
        where: { email: details.email },
      });
      if (existingUserByEmail && existingUserByEmail.active) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: 'Email is allready in system',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      if (
        existingUserByEmail &&
        existingUserByUsername &&
        existingUserByEmail.id !== existingUserByUsername.id
      ) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message:
              'Email and username allready in system by two different users',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (
        existingUserByEmail &&
        existingUserByUsername &&
        !existingUserByEmail.active &&
        existingUserByEmail.id === existingUserByUsername.id
      ) {
        const toUpdate = {
          active: true,
        };
        Object.assign(existingUserByEmail, toUpdate);
        return await this.userRepository.save(existingUserByEmail);
      }
      const user: User = this.userRepository.create({
        ...details,
        role,
      });

      this.logger.log(
        `createUser done for email ${createUserDto.email}`,
        this.AppName,
      );

      return await this.userRepository.save(user);
    } catch (error) {
      this.logger.error(
        `createUser failed for with error: ${error.message}`,
        this.AppName,
      );
      throw new HttpException(
        {
          status: error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message ?? 'Something went wrong',
        },
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserList(
    page: number,
    limit: number,
    sortBy: string,
    orderBy: 'ASC' | 'DESC',
    username?: string,
    email?: string,
  ): Promise<UserListDetails[]> {
    this.logger.log(`getUserList started`, this.AppName);

    try {
      const query = this.userRepository
        .createQueryBuilder('users')
        .select(['users.username', 'users.email', 'users.description'])
        .where('users.active = :active', { active: true })
        .skip((page - 1) * limit)
        .take(limit)
        .orderBy(`users.${sortBy}`, orderBy);

      if (username) {
        query.andWhere('users.username LIKE :username', {
          username: `%${username}%`,
        });
      }
      if (email) {
        query.andWhere('users.email LIKE :email', {
          email: `%${email}%`,
        });
      }
      return await query.getMany();
    } catch (error) {
      this.logger.error(
        `getUserList failed for with error: ${error.message}`,
        this.AppName,
      );
      throw new HttpException(
        {
          status: error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message ?? 'Something went wrong',
        },
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserListDetailsById(userId: number): Promise<UserDetails> {
    this.logger.log(`getUserDetailsById started for ${userId}`, this.AppName);
    try {
      const query = this.userRepository
        .createQueryBuilder('users')
        .leftJoinAndSelect('users.role', 'role')

        .where('users.id = :id', { id: userId })
        .andWhere('users.active = :active', { active: true });

      const user = await query.getOne();
      if (user) {
        return {
          roleName: user.role['name'],
          registrationDate: user['registrationDate'],
        };
      } else {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: 'User not found',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      this.logger.error(
        `getUserDetailsById failed for with error: ${error.message}`,
        this.AppName,
      );
      throw new HttpException(
        {
          status: error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message ?? 'Something went wrong',
        },
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async removeUser(userId: number) {
    this.logger.log(`removeUser started for userId - ${userId}`, this.AppName);
    try {
      const user: User = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!user) {
        throw new HttpException(
          { status: HttpStatus.BAD_REQUEST, message: "User Doesn't exists" },
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!user.active) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: 'User is allready not active',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      const update = { active: false };
      Object.assign(user, update);
      return await this.userRepository.save(user);
    } catch (error) {
      this.logger.error(
        `removeUser failed for with error: ${error.message}`,
        this.AppName,
      );
      throw new HttpException(
        {
          status: error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message ?? 'Something went wrong',
        },
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async checkAvailabilityOfUserName(username: string): Promise<Username> {
    this.logger.log(
      `checkAvailabilityOfUsername started for ${username}`,
      this.AppName,
    );
    try {
      const user: User = await this.userRepository.findOne({
        where: { username },
      });

      if (user) {
        return {
          available: false,
        };
      } else {
        return {
          available: true,
        };
      }
    } catch (error) {
      this.logger.error(
        `checkAvailabilityOfUsername failed for with error: ${error.message}`,
        this.AppName,
      );
      throw new HttpException(
        {
          status: error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message ?? 'Something went wrong',
        },
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateUser(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    try {
      const user: User = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!user) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: "User Doesn't exists",
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      Object.assign(user, updateUserDto);
      return await this.userRepository.save(user);
    } catch (error) {
      throw new HttpException(
        {
          status: error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message ?? 'Something went wrong',
        },
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async generateToken(jwtPayload: JwtDto): Promise<string> {
    try {
      return await this.jwtService.signAsync(jwtPayload, {
        secret: Constants.jwt_secret_key,
        expiresIn: '24h',
      });
    } catch (error) {
      throw new HttpException(
        {
          status: error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message ?? 'Something went wrong',
        },
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
