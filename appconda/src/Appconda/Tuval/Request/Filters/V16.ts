import { Filter } from '../Filter';

export class V16 extends Filter {
    // Convert 1.3 params to 1.4
    public parse(content: Record<string, any>, model: string): Record<string, any> {
        switch (model) {
            case 'functions.create':
                content['commands'] = this.getCommands(content['runtime'] ?? '');
                break;
            case 'functions.update':
                content['commands'] = this.getCommands(content['runtime'] ?? '');
                break;
            case 'functions.createExecution':
                content['body'] = content['data'] ?? '';
                delete content['data'];
                break;
        }

        return content;
    }

    private getCommands(runtime: string): string {
        if (runtime.startsWith('node')) {
            return 'npm install';
        } else if (runtime.startsWith('python')) {
            return 'pip install --no-cache-dir -r requirements.txt';
        } else if (runtime.startsWith('dart')) {
            return 'dart pub get';
        } else if (runtime.startsWith('php')) {
            return 'composer update --no-interaction --ignore-platform-reqs --optimize-autoloader --prefer-dist --no-dev';
        } else if (runtime.startsWith('ruby')) {
            return 'bundle install';
        } else if (runtime.startsWith('swift')) {
            return 'swift package resolve';
        } else if (runtime.startsWith('dotnet')) {
            return 'dotnet restore';
        }

        return '';
    }
}
