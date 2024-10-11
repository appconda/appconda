import { execSync, spawnSync } from 'child_process';
import { writeFileSync, readFileSync, readSync } from 'fs';
import * as cc from 'node-console-colors'

export class Console {
    /**
     * Title
     *
     * Sets the process title visible in tools such as top and ps.
     *
     * @param  string  title
     * @return boolean
     */
    public static title(title: string): boolean {
        try {
            execSync(`title ${title}`);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Log
     *
     * Log messages to console
     *
     * @param  string  message
     * @return boolean
     */
    public static log(message: string): boolean {
        try {
            process.stdout.write(message + "\n");
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Success
     *
     * Log success messages to console
     *
     * @param  string  message
     * @return boolean
     */
    public static success(message: string): boolean {
        try {

            /* console.log("\x1b[32m Output with green text \x1b[0m")
            console.log("\x1b[35m Output with magenta text \x1b[0m")
            console.log("\x1b[34m Output with blue text \x1b[0m")
            
            console.log("\x1b[41m Output with red background \x1b[0m")
            console.log("\x1b[42m Output with green background \x1b[0m")
            console.log("\x1b[43m Output with yellow background \x1b[0m") */

            console.log(`\x1b[32m ${message} \x1b[0m`);

            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Error
     *
     * Log error messages to console
     *
     * @param  string  message
     * @return boolean
     */
    public static error(message: string): boolean {
        try {
            console.log(cc.set("fg_white", "bg_red", message));
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Info
     *
     * Log informative messages to console
     *
     * @param  string  message
     * @return boolean
     */
    public static info(message: string): boolean {
        try {
            console.log(`\x1b[34m ${message} \x1b[0m`);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Warning
     *
     * Log warning messages to console
     *
     * @param  string  message
     * @return boolean
     */
    public static warning(message: string): boolean {
        try {
            console.log(`\x1b[43m ${message} \x1b[0m`);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Confirm
     *
     * Log warning messages to console
     *
     * @param  string  question
     * @return string
     */
    public static confirm(question: string): string {
        if (!this.isInteractive()) {
            return '';
        }

        this.log(question);

        const buffer = Buffer.alloc(1024);
        const bytesRead = readSync(0, buffer as any, 0, buffer.length, null);
        return buffer.toString('utf8', 0, bytesRead).trim();
    }

    /**
     * Exit
     *
     * Log warning messages to console
     *
     * @param  number  status
     * @return void
     */
    public static exit(status: number = 0): void {
        process.exit(status);
    }

    /**
     * Execute a Command
     *
     * @param  string  cmd
     * @param  string  stdin
     * @param  string  stdout
     * @param  string  stderr
     * @param  number  timeout
     * @return number
     */
    public static execute(cmd: string, stdin: string, stdout: string, stderr: string, timeout: number = -1): number {
        const result = spawnSync(cmd, {
            input: stdin,
            timeout: timeout > 0 ? timeout * 1000 : undefined,
            shell: true,
        });

        stdout = result.stdout.toString();
        stderr = result.stderr.toString();

        return result.status ?? 1;
    }

    /**
     * Is Interactive Mode?
     *
     * @return boolean
     */
    public static isInteractive(): boolean {
        return process.stdout.isTTY;
    }

    /**
     * Loop
     *
     * @param  Function  callback
     * @param  number  sleep // in seconds!
     * @param  number  delay // in seconds!
     * @param  Function|null  onError
     * @return void
     */
    public static loop(callback: Function, sleep: number = 1, delay: number = 0, onError: Function | null = null): void {
        if (delay > 0) {
            setTimeout(() => { }, delay * 1000);
        }

        const interval = setInterval(() => {
            try {
                callback();
            } catch (e) {
                if (onError) {
                    onError(e);
                } else {
                    clearInterval(interval);
                    throw e;
                }
            }
        }, sleep * 1000);
    }
}