export abstract class Filter {
    /**
     * Parse the content to another format.
     *
     * @param content
     * @param model
     * @return Record<string, any>
     */
    abstract parse(content: Record<string, any>, model: string): Record<string, any>;

    /**
     * Handle list
     *
     * @param content
     * @param key
     * @param callback
     * @return Record<string, any>
     */
    protected handleList(content: Record<string, any>, key: string, callback: (item: any) => any): Record<string, any> {
        if (content.hasOwnProperty(key) && Array.isArray(content[key])) {
            content[key] = content[key].map(callback);
        }

        return content;
    }
}