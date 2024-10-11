import dotenv from 'dotenv';
import path from 'path';

const a = path.resolve(__dirname, './.env') ;
dotenv.config({ path: a });

import '../src/index.ts'

