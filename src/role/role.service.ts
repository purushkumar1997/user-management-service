import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoggerService } from '../logger/logger.service';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { CreateRoleDto } from '../dto/createRole.dto';

@Injectable()
export class RoleService {
  private readonly AppName: string = 'RoleService';
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly logger: LoggerService,
  ) {}

  async createRole(roleDto: CreateRoleDto): Promise<Role> {
    this.logger.log(`createRole started for ${roleDto.name}`, this.AppName);
    try {
      const role = this.roleRepository.create(roleDto);
      this.logger.log(
        `createRole in progress for ${roleDto.name}`,
        this.AppName,
      );
      return await this.roleRepository.save(role);
    } catch (error) {
      this.logger.error(
        `createRole failed for ${roleDto.name} with error: ${error.message}`,
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

  async getAllRoles(): Promise<Role[]> {
    this.logger.log(`getAllRoles started`, this.AppName);
    try {
      const roles: Role[] = await this.roleRepository.find();
      this.logger.log(`getAllRoles finished`, this.AppName);
      return roles;
    } catch (error) {
      this.logger.error(
        `getAllRoles failed with error: ${error.message}`,
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

  async findRoleByName(name: string): Promise<Role> {
    this.logger.log(`findRoleByName started for ${name}`, this.AppName);
    try {
      const role: Role = await this.roleRepository.findOne({ where: { name } });
      if (!role) {
        this.logger.warn(
          `findRoleByName - role with name ${name} not found`,
          this.AppName,
        );
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: 'Role not found',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      return role;
    } catch (error) {
      this.logger.error(
        `findRoleByName failed for ${name} with error: ${error.message}`,
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

  async findRoleById(id: number): Promise<Role> {
    this.logger.log(`findRoleById started for id - ${id}`, this.AppName);
    try {
      const role: Role = await this.roleRepository.findOne({ where: { id } });
      if (!role) {
        this.logger.warn(
          `findRoleById - role with name ${id} not found`,
          this.AppName,
        );
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: 'Role not found',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      return role;
    } catch (error) {
      this.logger.error(
        `findRoleById failed with error: ${error.message}`,
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
}
