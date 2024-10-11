// path/to/file.ts
import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';

async function fetchData(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Could not download public suffix list');
    }
    return response.text();
}

function arrayToCode(data: any, level = 0): string {
    let output = '[\n';
    level++;
    const tabs = '\t'.repeat(level);

    for (const [key, node] of Object.entries(data)) {
        const formattedKey = isNaN(Number(key)) ? `'${key}': ` : '';
        const value = Array.isArray(node) ? arrayToCode(node, level) : JSON.stringify(node);
        output += `${tabs}${formattedKey}${value},\n`;
    }

    level--;
    output += '\t'.repeat(level) + ']';
    return output;
}

async function main() {
    const url = 'https://publicsuffix.org/list/public_suffix_list.dat';
    const data = await fetchData(url);
    const list = data.split('\n');

    let type: string | null = null;
    let comments: string[] = [];
    const domains: { [key: string]: { suffix: string; type: string | null; comments: string[] } } = {};

    for (const line of list) {
        if (line.includes('===BEGIN ICANN DOMAINS===')) {
            type = 'ICANN';
            comments = [];
            continue;
        }

        if (line.includes('===END ICANN DOMAINS===')) {
            type = null;
            continue;
        }

        if (line.includes('===BEGIN PRIVATE DOMAINS===')) {
            type = 'PRIVATE';
            comments = [];
            continue;
        }

        if (line.includes('===END PRIVATE DOMAINS===')) {
            type = null;
            continue;
        }

        if (line.trim() === '') {
            continue;
        }

        if (line.startsWith('// ')) {
            comments.push(line.substring(3));
            continue;
        }

        domains[line] = {
            suffix: line,
            type: type,
            comments: comments,
        };

        comments = [];
    }

    if (!domains['com']) {
        throw new Error('.com is missing from public suffix list; it must be corrupted');
    }

    const outputPath = path.join(__dirname, 'data.ts');
    fs.writeFileSync(outputPath, `export default ${arrayToCode(domains)};`);
}

main().catch(console.error);