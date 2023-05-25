import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
     ){}

     private async hashPassword(password: string, salt: string): Promise<string> {
      return bcrypt.hash(password, salt);
     }

     async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
        const { username, password } = authCredentialsDto;

        const user = new User();
        user.username = username;
        user.salt = await bcrypt.genSalt();
        user.password = await this.hashPassword(password, user.salt);

        console.log(user.password);
        
        try{
         await this.usersRepository.save(user);
        } catch(error){
            if(error.code ==='23505' ){
               throw new ConflictException('Username already exist!');
            }else {
               throw new InternalServerErrorException();
            }
        }
     }
}
 