export class Status {
    /**
     * Message that is not ready to be sent
     */
    public static readonly DRAFT = 'draft';
    /**
     * Scheduled to be sent for a later time
     */
    public static readonly SCHEDULED = 'scheduled';
    /**
     * Picked up by the worker and starting to send
     */
    public static readonly PROCESSING = 'processing';
    /**
     * Sent without errors
     */
    public static readonly SENT = 'sent';
    /**
     * Sent with some errors
     */
    public static readonly FAILED = 'failed';
}