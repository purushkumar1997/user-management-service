import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { query } from 'express';
import { ResponseMessage } from 'src/decorators/responseMessageDecorators';
import { CreateUserDto } from 'src/dto/createUser.dto';
import { JwtDto } from 'src/dto/jwtPayload.dto';
import { UpdateUserDto } from 'src/dto/updateUser.dto';
import { User } from 'src/entities/user.entity';
import { AuthGuard } from 'src/guards/auth.guard';
import {
  JwtPayload,
  UserDetails,
  UserListDetails,
  Username,
} from 'src/interface/user.interface';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @UseGuards(AuthGuard)
  @ResponseMessage('User added successfully')
  async addUser(@Body() userDto: CreateUserDto): Promise<User> {
    return await this.userService.createUser(userDto);
  }

  @Get('')
  @UseGuards(AuthGuard)
  @ResponseMessage('User found successfully')
  async getUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('sortBy') sortBy: string = 'registrationDate',
    @Query('order') order: 'ASC' | 'DESC' = 'DESC',
    @Query('username') username: string,
    @Query('email') email: string,
  ): Promise<UserListDetails[]> {
    return await this.userService.getUserList(
      page,
      limit,
      sortBy,
      order,
      username,
      email,
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ResponseMessage('User details found successfully')
  async getUserDetailsById(@Param('id') id: number): Promise<UserDetails> {
    if (!id) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Please provide role id',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.userService.getUserListDetailsById(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ResponseMessage('User Deleted successfully')
  async removeUsers(@Param('id') id: number) {
    if (!id) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Please provide role id',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.userService.removeUser(id);
  }

  @Get('available/:username')
  @UseGuards(AuthGuard)
  @ResponseMessage('Availability of username')
  async availabilityOfUsername(
    @Param('username') username: string,
  ): Promise<Username> {
    return await this.userService.checkAvailabilityOfUserName(username);
  }

  @Post('token')
  @ResponseMessage('Token created successfully')
  async createToken(@Body() payload: JwtDto): Promise<string> {
    return await this.userService.generateToken(payload);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ResponseMessage('User updated successfully')
  async updateUser(
    @Param('id') id: number,
    @Body() updateDto: UpdateUserDto,
  ): Promise<User> {
    if (!id) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Please provide role id',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.userService.updateUser(id, updateDto);
  }
}
