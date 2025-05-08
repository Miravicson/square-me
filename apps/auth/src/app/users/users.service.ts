import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../../typeorm/models/users.model';
import { FindOneOptions, Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users) private readonly userRepository: Repository<Users>
  ) {}

  async getUser(where: FindOneOptions<Users>['where']) {
    return this.userRepository.findOneOrFail({ where });
  }
}
