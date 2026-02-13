import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);
    private readonly isDev = process.env.NODE_ENV !== 'production';

    /**
     * Send an OTP via SMS. In dev mode, logs to console.
     * In production, calls 2factor.in API.
     */
    async sendSmsOtp(phone: string, otp: string): Promise<boolean> {
        if (this.isDev) {
            this.logger.log(`📱 [DEV] OTP for ${phone}: ${otp}`);
            return true;
        }

        // Production: 2factor.in SMS API
        const apiKey = process.env.TWOFACTOR_API_KEY;
        if (!apiKey) {
            this.logger.error('TWOFACTOR_API_KEY not configured');
            return false;
        }

        try {
            const url = `https://2factor.in/API/V1/${apiKey}/SMS/${phone}/${otp}/Aanandini OTP`;
            const res = await fetch(url);
            const data = await res.json();

            if (data.Status === 'Success') {
                this.logger.log(`SMS OTP sent to ${phone}`);
                return true;
            } else {
                this.logger.error(`SMS send failed: ${JSON.stringify(data)}`);
                return false;
            }
        } catch (error) {
            this.logger.error(`SMS send error: ${error}`);
            return false;
        }
    }

    /**
     * Send email notification via AWS SES. In dev mode, logs to console.
     */
    async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
        if (this.isDev) {
            this.logger.log(`📧 [DEV] Email to ${to}: ${subject}\n${body}`);
            return true;
        }

        // Production: AWS SES
        try {
            // Dynamic import to avoid compile-time dependency
            const sesModule = await import('@aws-sdk/client-ses' as any) as any;
            const ses = new sesModule.SESClient({ region: process.env.AWS_REGION || 'ap-south-1' });

            await ses.send(new sesModule.SendEmailCommand({
                Source: process.env.SES_FROM_EMAIL || 'noreply@aanandini.com',
                Destination: { ToAddresses: [to] },
                Message: {
                    Subject: { Data: subject },
                    Body: { Text: { Data: body } },
                },
            }));

            this.logger.log(`Email sent to ${to}`);
            return true;
        } catch (error) {
            this.logger.error(`Email send error: ${error}`);
            return false;
        }
    }

    /** Generate a random 6-digit OTP */
    generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
}
