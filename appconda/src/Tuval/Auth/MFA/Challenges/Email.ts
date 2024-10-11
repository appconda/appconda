import { Document } from '../../../../Tuval/Core';
import {Challenge} from '../Challenge';
import { Type } from '../Type';

export class EmailChallenge  extends Challenge {
    public static verify(challenge: Document, otp: string): boolean {
        return challenge.getAttribute('code') === otp;
    }

    public static challenge(challenge: Document, user: Document, otp: string): boolean {
        if (challenge.isSet('type') && challenge.getAttribute('type') === Type.EMAIL) {
            return this.verify(challenge, otp);
        }

        return false;
    }
}