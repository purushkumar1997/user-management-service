import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ResponseMessage } from 'src/decorators/responseMessageDecorators';
import { CreateRoleDto } from 'src/dto/createRole.dto';
import { LoggerService } from 'src/logger/logger.service';
import { Role } from '../entities/role.entity';
import { AuthGuard } from '../guards/auth.guard';
import { RoleService } from './role.service';

@Controller('role')
export class RoleController {
  constructor(
    private readonly roleService: RoleService,
    private readonly logger: LoggerService,
  ) {}

  @Post('')
  @UseGuards(AuthGuard)
  @ResponseMessage('Role created successfully')
  async createRole(@Body() roleDto: CreateRoleDto): Promise<Role> {
    return await this.roleService.createRole(roleDto);
  }

  @Get('all')
  @UseGuards(AuthGuard)
  @ResponseMessage('Roled found successfully')
  async findAllRoles(): Promise<Role[]> {
    return await this.roleService.getAllRoles();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ResponseMessage('Role found successfully')
  async findRoleById(@Param('id') id: number): Promise<Role> {
    if (!id) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Please provide role id',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.roleService.findRoleById(id);
  }

  @Get('/username/:name')
  @UseGuards(AuthGuard)
  @ResponseMessage('Role found successfully')
  async getRoleByName(@Param('name') name: string) {
    if (!name) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Please provide role name',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.roleService.findRoleByName(name);
  }
}
