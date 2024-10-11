export abstract class Filter {
    /**
     * Parse params to another format.
     *
     * @param content
     * @param model
     * @return Record<string, any>
     */
    abstract parse(content: Record<string, any>, model: string): Record<string, any>;
}
