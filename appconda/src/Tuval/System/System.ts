
    export class System {
        public static readonly X86 = 'x86';
        public static readonly PPC = 'ppc';
        public static readonly ARM64 = 'arm64';
        public static readonly ARMV7 = 'armv7';
        public static readonly ARMV8 = 'armv8';

        private static readonly RegExX86 = /(x86*|i386|i686)/;
        private static readonly RegexARM64 = /(arm64|aarch64)/;
        private static readonly RegexARMV7 = /(armv7)/;
        private static readonly RegexARMV8 = /(armv8)/;
        private static readonly RegExPPC = /(ppc*)/;

        private static readonly INVALID_DISKS = ['loop', 'ram'];
        private static readonly INVALIDNETINTERFACES = ['veth', 'docker', 'lo', 'tun', 'vboxnet', '.', 'bonding_masters'];

        public static getOS(): string {
            return require('os').type();
        }

        public static getArch(): string {
            return require('os').arch();
        }

        public static getArchEnum(): string {
            const arch = this.getArch();
            if (this.RegExX86.test(arch)) return System.X86;
            if (this.RegExPPC.test(arch)) return System.PPC;
            if (this.RegexARM64.test(arch)) return System.ARM64;
            if (this.RegexARMV7.test(arch)) return System.ARMV7;
            if (this.RegexARMV8.test(arch)) return System.ARMV8;
            throw new Error(`'${arch}' enum not found.`);
        }

        public static getHostname(): string {
            return require('os').hostname();
        }

        public static getCPUCores(): number {
            const os = this.getOS();
            switch (os) {
                case 'Linux':
                    return require('os').cpus().length;
                case 'Darwin':
                    return parseInt(require('child_process').execSync('sysctl -n hw.ncpu').toString());
                case 'Windows_NT':
                    return parseInt(require('child_process').execSync('wmic cpu get NumberOfCores').toString());
                default:
                    throw new Error(`${os} not supported.`);
            }
        }

        public static getCPUUsage(duration: number = 1): number {
            const os = this.getOS();
            if (os !== 'Linux') {
                throw new Error(`${os} not supported.`);
            }

            const startCpu = this.getProcStatData()['total'];
            require('child_process').execSync(`sleep ${duration}`);
            const endCpu = this.getProcStatData()['total'];

            const prevIdle = startCpu['idle'] + startCpu['iowait'];
            const idle = endCpu['idle'] + endCpu['iowait'];

            const prevNonIdle = startCpu['user'] + startCpu['nice'] + startCpu['system'] + startCpu['irq'] + startCpu['softirq'] + startCpu['steal'];
            const nonIdle = endCpu['user'] + endCpu['nice'] + endCpu['system'] + endCpu['irq'] + endCpu['softirq'] + endCpu['steal'];

            const prevTotal = prevIdle + prevNonIdle;
            const total = idle + nonIdle;

            const totalDiff = total - prevTotal;
            const idleDiff = idle - prevIdle;

            const percentage = (totalDiff - idleDiff) / totalDiff;

            return percentage * 100;
        }

        public static getMemoryTotal(): number {
            const os = this.getOS();
            switch (os) {
                case 'Linux':
                    const memInfo = require('fs').readFileSync('/proc/meminfo', 'utf8');
                    const matches = memInfo.match(/MemTotal:\s+(\d+)/);
                    if (matches && matches[1]) {
                        return parseInt(matches[1]) / 1024;
                    }
                    throw new Error('Unable to find memtotal in /proc/meminfo.');
                case 'Darwin':
                    return parseInt(require('child_process').execSync('sysctl -n hw.memsize').toString()) / 1024 / 1024;
                default:
                    throw new Error(`${os} not supported.`);
            }
        }

        public static getMemoryFree(): number {
            const os = this.getOS();
            switch (os) {
                case 'Linux':
                    const meminfo = require('fs').readFileSync('/proc/meminfo', 'utf8');
                    const matches = meminfo.match(/MemFree:\s+(\d+)/);
                    if (matches && matches[1]) {
                        return parseInt(matches[1]) / 1024;
                    }
                    throw new Error('Could not find MemFree in /proc/meminfo.');
                case 'Darwin':
                    return parseInt(require('child_process').execSync('sysctl -n vm.page_free_count').toString()) / 1024 / 1024;
                default:
                    throw new Error(`${os} not supported.`);
            }
        }

        public static getDiskTotal(): number {
            const totalSpace = require('fs').statSync(__dirname).size;
            if (totalSpace === undefined) {
                throw new Error('Unable to get disk space');
            }
            return totalSpace / 1024 / 1024;
        }

        public static getDiskFree(): number {
            const totalSpace = require('fs').statSync(__dirname).size;
            if (totalSpace === undefined) {
                throw new Error('Unable to get free disk space');
            }
            return totalSpace / 1024 / 1024;
        }

        public static getIOUsage(duration: number = 1): { [key: string]: { read: number, write: number } } {
            const diskStat = this.getDiskStats();
            require('child_process').execSync(`sleep ${duration}`);
            const diskStat2 = this.getDiskStats();

            const stats: { [key: string]: { read: number, write: number } } = {};

            for (const key in diskStat) {
                const read2 = diskStat2[key][5];
                const read1 = diskStat[key][5];

                const write2 = diskStat2[key][9];
                const write1 = diskStat[key][9];

                stats[key] = {
                    read: ((parseInt(read2) - parseInt(read1)) * 512) / 1048576,
                    write: ((parseInt(write2) - parseInt(write1)) * 512) / 1048576
                };
            }

            stats['total'] = {
                read: Object.values(stats).reduce((acc, stat) => acc + stat.read, 0),
                write: Object.values(stats).reduce((acc, stat) => acc + stat.write, 0)
            };

            return stats;
        }

        public static getNetworkUsage(duration: number = 1): { [key: string]: { download: number, upload: number } } {
            const interfaces = require('fs').readdirSync('/sys/class/net');

            const IOUsage: { [key: string]: { download: number, upload: number } } = {};

            for (const interfaceName of interfaces) {
                const tx1 = parseInt(require('fs').readFileSync(`/sys/class/net/${interfaceName}/statistics/tx_bytes`, 'utf8'));
                const rx1 = parseInt(require('fs').readFileSync(`/sys/class/net/${interfaceName}/statistics/rx_bytes`, 'utf8'));
                require('child_process').execSync(`sleep ${duration}`);
                const tx2 = parseInt(require('fs').readFileSync(`/sys/class/net/${interfaceName}/statistics/tx_bytes`, 'utf8'));
                const rx2 = parseInt(require('fs').readFileSync(`/sys/class/net/${interfaceName}/statistics/rx_bytes`, 'utf8'));

                IOUsage[interfaceName] = {
                    download: (rx2 - rx1) / 1048576,
                    upload: (tx2 - tx1) / 1048576
                };
            }

            IOUsage['total'] = {
                download: Object.values(IOUsage).reduce((acc, usage) => acc + usage.download, 0),
                upload: Object.values(IOUsage).reduce((acc, usage) => acc + usage.upload, 0)
            };

            return IOUsage;
        }

        public static getEnv(name: string, defaultValue: string | null = null): string | null {
            return process.env[name] || defaultValue;
        }

        public static isArm64(): boolean {
            return this.RegexARM64.test(this.getArch());
        }

        public static isArmV7(): boolean {
            return this.RegexARMV7.test(this.getArch());
        }

        public static isArmV8(): boolean {
            return this.RegexARMV8.test(this.getArch());
        }

        public static isX86(): boolean {
            return this.RegExX86.test(this.getArch());
        }

        public static isPPC(): boolean {
            return this.RegExPPC.test(this.getArch());
        }

        public static isArch(arch: string): boolean {
            switch (arch) {
                case this.X86:
                    return this.isX86();
                case this.PPC:
                    return this.isPPC();
                case this.ARM64:
                    return this.isArm64();
                case this.ARMV7:
                    return this.isArmV7();
                case this.ARMV8:
                    return this.isArmV8();
                default:
                    throw new Error(`'${arch}' not found.`);
            }
        }

        private static getProcStatData(): { [key: string]: { [key: string]: number } } {
            const data: { [key: string]: { [key: string]: number } } = {};
            const cpustats = require('fs').readFileSync('/proc/stat', 'utf8');
            const cpus = cpustats.split('\n').filter(cpu => /^cpu[0-999]/.test(cpu));

            for (const cpu of cpus) {
                const parts = cpu.split(' ');
                const cpuNumber = parts[0] === 'cpu' ? 'total' : parts[0].substring(3);

                data[cpuNumber] = {
                    user: parseInt(parts[1]) || 0,
                    nice: parseInt(parts[2]) || 0,
                    system: parseInt(parts[3]) || 0,
                    idle: parseInt(parts[4]) || 0,
                    iowait: parseInt(parts[5]) || 0,
                    irq: parseInt(parts[6]) || 0,
                    softirq: parseInt(parts[7]) || 0,
                    steal: parseInt(parts[8]) || 0,
                    guest: parseInt(parts[9]) || 0
                };
            }

            if (!data['total']) {
                data['total'] = {
                    user: 0,
                    nice: 0,
                    system: 0,
                    idle: 0,
                    iowait: 0,
                    irq: 0,
                    softirq: 0,
                    steal: 0,
                    guest: 0
                };

                for (const cpu of Object.values(data)) {
                    data['total'].user += cpu.user;
                    data['total'].nice += cpu.nice;
                    data['total'].system += cpu.system;
                    data['total'].idle += cpu.idle;
                    data['total'].iowait += cpu.iowait;
                    data['total'].irq += cpu.irq;
                    data['total'].softirq += cpu.softirq;
                    data['total'].steal += cpu.steal;
                    data['total'].guest += cpu.guest;
                }
            }

            return data;
        }

        private static getDiskStats(): { [key: string]: string[] } {
            const diskStats = require('fs').readFileSync('/proc/diskstats', 'utf8').split('\n').map(line => line.trim()).filter(line => line);
            const data: { [key: string]: string[] } = {};

            for (const disk of diskStats) {
                const parts = disk.split(/\s+/);
                data[parts[2]] = parts;
            }

            return data;
        }
    }
