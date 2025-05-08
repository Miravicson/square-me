import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../../typeorm/models/users.model';
import { FindOneOptions, Repository } from 'typeorm';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(this.constructor.name);
  constructor(
    @InjectRepository(Users) private readonly userRepository: Repository<Users>
  ) {}

  async getUser(where: FindOneOptions<Users>['where']) {
    return this.userRepository.findOneOrFail({ where });
  }

  async createBasicUserOrFail(email: string, password: string) {
    const userExists = await this.userRepository.exists({ where: { email } });

    if (userExists) {
      this.logger.error(`The user with email: ${email} already exists`);
      throw new Error('user already exists');
    }

    const user = await this.userRepository.create({ email, password });
    await this.userRepository.save(user);
    return user;
  }
}
