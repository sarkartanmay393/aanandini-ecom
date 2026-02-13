import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class SendOtpDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^[6-9]\d{9}$/, { message: 'Please enter a valid 10-digit Indian mobile number' })
    phone: string;
}

export class VerifyOtpDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^[6-9]\d{9}$/, { message: 'Please enter a valid 10-digit Indian mobile number' })
    phone: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^\d{6}$/, { message: 'OTP must be a 6-digit number' })
    code: string;
}
