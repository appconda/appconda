import { Document } from '../../../../Tuval/Core';
import { totp } from 'otplib';
import { TOTP as TOTPType } from '../Types/TOTP';



export class TOTPChallenge {
    // Verify the OTP based on the user's authenticator secret
    public static verify(user: Document, otp: string): boolean {
        const authenticator = TOTPType.getAuthenticatorFromUser(user);
        if (!authenticator) return false;

        const data = authenticator.getAttribute('data');
        const secret = data['secret'];

        if (!secret) return false;

        return totp.verify({ token: otp, secret });
    }

    // Challenge the user by verifying the OTP if the type is TOTP
    public static challenge(challenge: Document, user: Document, otp: string): boolean {
        if (challenge.isSet('type') && challenge.getAttribute('type') === 'TOTP') {
            return this.verify(user, otp);
        }
        return false;
    }
}

