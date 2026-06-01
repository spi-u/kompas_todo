import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiData } from '../../common/decorators/api-response.decorators';
import { ErrorResponseDto } from '../../common/dto/response-envelope.dto';
import { Auth } from './decorators/auth.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthTokenDto, CurrentUserDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { AuthenticatedUser } from './interfaces/jwt-payload.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in, issue JWT' })
  @ApiData(AuthTokenDto, 200)
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  login(@Body() dto: LoginDto): Promise<{ accessToken: string }> {
    return this.authService.login(dto);
  }

  @Get('me')
  @Auth()
  @ApiOperation({ summary: 'Current user from token' })
  @ApiData(CurrentUserDto, 200)
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  me(@CurrentUser() user: AuthenticatedUser): AuthenticatedUser {
    return user;
  }
}
