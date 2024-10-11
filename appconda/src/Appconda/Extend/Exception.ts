import { Exception as BaseException} from '../../Tuval/Core';
import { Config } from '../../Tuval/Config';

export class AppcondaException extends BaseException {
    /** General */
    public static readonly GENERAL_UNKNOWN = 'general_unknown';
    public static readonly GENERAL_MOCK = 'general_mock';
    public static readonly GENERAL_ACCESS_FORBIDDEN = 'general_access_forbidden';
    public static readonly GENERAL_UNKNOWN_ORIGIN = 'general_unknown_origin';
    public static readonly GENERAL_API_DISABLED = 'general_api_disabled';
    public static readonly GENERAL_SERVICE_DISABLED = 'general_service_disabled';
    public static readonly GENERAL_UNAUTHORIZED_SCOPE = 'general_unauthorized_scope';
    public static readonly GENERAL_RATE_LIMIT_EXCEEDED = 'general_rate_limit_exceeded';
    public static readonly GENERAL_SMTP_DISABLED = 'general_smtp_disabled';
    public static readonly GENERAL_PHONE_DISABLED = 'general_phone_disabled';
    public static readonly GENERAL_ARGUMENT_INVALID = 'general_argument_invalid';
    public static readonly GENERAL_QUERY_LIMIT_EXCEEDED = 'general_query_limit_exceeded';
    public static readonly GENERAL_QUERY_INVALID = 'general_query_invalid';
    public static readonly GENERAL_ROUTE_NOT_FOUND = 'general_route_not_found';
    public static readonly GENERAL_CURSOR_NOT_FOUND = 'general_cursor_not_found';
    public static readonly GENERAL_SERVER_ERROR = 'general_server_error';
    public static readonly GENERAL_PROTOCOL_UNSUPPORTED = 'general_protocol_unsupported';
    public static readonly GENERAL_CODES_DISABLED = 'general_codes_disabled';
    public static readonly GENERAL_USAGE_DISABLED = 'general_usage_disabled';
    public static readonly GENERAL_NOT_IMPLEMENTED = 'general_not_implemented';
    public static readonly GENERAL_INVALID_EMAIL = 'general_invalid_email';
    public static readonly GENERAL_INVALID_PHONE = 'general_invalid_phone';
    public static readonly GENERAL_REGION_ACCESS_DENIED = 'general_region_access_denied';
    public static readonly GENERAL_BAD_REQUEST = 'general_bad_request';

    /** Users */
    public static readonly USER_COUNT_EXCEEDED = 'user_count_exceeded';
    public static readonly USER_CONSOLE_COUNT_EXCEEDED = 'user_console_count_exceeded';
    public static readonly USER_JWT_INVALID = 'user_jwt_invalid';
    public static readonly USER_ALREADY_EXISTS = 'user_already_exists';
    public static readonly USER_BLOCKED = 'user_blocked';
    public static readonly USER_INVALID_TOKEN = 'user_invalid_token';
    public static readonly USER_PASSWORD_RESET_REQUIRED = 'user_password_reset_required';
    public static readonly USER_EMAIL_NOT_WHITELISTED = 'user_email_not_whitelisted';
    public static readonly USER_IP_NOT_WHITELISTED = 'user_ip_not_whitelisted';
    public static readonly USER_INVALID_CODE = 'user_invalid_code';
    public static readonly USER_INVALID_CREDENTIALS = 'user_invalid_credentials';
    public static readonly USER_ANONYMOUS_CONSOLE_PROHIBITED = 'user_anonymous_console_prohibited';
    public static readonly USER_SESSION_ALREADY_EXISTS = 'user_session_already_exists';
    public static readonly USER_NOT_FOUND = 'user_not_found';
    public static readonly USER_PASSWORD_RECENTLY_USED = 'password_recently_used';
    public static readonly USER_PASSWORD_PERSONAL_DATA = 'password_personal_data';
    public static readonly USER_EMAIL_ALREADY_EXISTS = 'user_email_already_exists';
    public static readonly USER_PASSWORD_MISMATCH = 'user_password_mismatch';
    public static readonly USER_SESSION_NOT_FOUND = 'user_session_not_found';
    public static readonly USER_IDENTITY_NOT_FOUND = 'user_identity_not_found';
    public static readonly USER_UNAUTHORIZED = 'user_unauthorized';
    public static readonly USER_AUTH_METHOD_UNSUPPORTED = 'user_auth_method_unsupported';
    public static readonly USER_PHONE_ALREADY_EXISTS = 'user_phone_already_exists';
    public static readonly USER_PHONE_NOT_FOUND = 'user_phone_not_found';
    public static readonly USER_PHONE_NOT_VERIFIED = 'user_phone_not_verified';
    public static readonly USER_EMAIL_NOT_FOUND = 'user_email_not_found';
    public static readonly USER_EMAIL_NOT_VERIFIED = 'user_email_not_verified';
    public static readonly USER_MISSING_ID = 'user_missing_id';
    public static readonly USER_MORE_FACTORS_REQUIRED = 'user_more_factors_required';
    public static readonly USER_INVALID_CHALLENGE = 'user_invalid_challenge';
    public static readonly USER_AUTHENTICATOR_NOT_FOUND = 'user_authenticator_not_found';
    public static readonly USER_AUTHENTICATOR_ALREADY_VERIFIED = 'user_authenticator_already_verified';
    public static readonly USER_RECOVERY_CODES_ALREADY_EXISTS = 'user_recovery_codes_already_exists';
    public static readonly USER_RECOVERY_CODES_NOT_FOUND = 'user_recovery_codes_not_found';
    public static readonly USER_CHALLENGE_REQUIRED = 'user_challenge_required';
    public static readonly USER_OAUTH2_BAD_REQUEST = 'user_oauth2_bad_request';
    public static readonly USER_OAUTH2_UNAUTHORIZED = 'user_oauth2_unauthorized';
    public static readonly USER_OAUTH2_PROVIDER_ERROR = 'user_oauth2_provider_error';
    public static readonly USER_EMAIL_ALREADY_VERIFIED = 'user_email_already_verified';
    public static readonly USER_PHONE_ALREADY_VERIFIED = 'user_phone_already_verified';
    public static readonly USER_DELETION_PROHIBITED = 'user_deletion_prohibited';
    public static readonly USER_TARGET_NOT_FOUND = 'user_target_not_found';
    public static readonly USER_TARGET_ALREADY_EXISTS = 'user_target_already_exists';
    public static readonly USER_API_KEY_AND_SESSION_SET = 'user_key_and_session_set';

    /** Teams */
    public static readonly TEAM_NOT_FOUND = 'team_not_found';
    public static readonly TEAM_INVITE_ALREADY_EXISTS = 'team_invite_already_exists';
    public static readonly TEAM_INVITE_NOT_FOUND = 'team_invite_not_found';
    public static readonly TEAM_INVALID_SECRET = 'team_invalid_secret';
    public static readonly TEAM_MEMBERSHIP_MISMATCH = 'team_membership_mismatch';
    public static readonly TEAM_INVITE_MISMATCH = 'team_invite_mismatch';
    public static readonly TEAM_ALREADY_EXISTS = 'team_already_exists';

    /** Membership */
    public static readonly MEMBERSHIP_NOT_FOUND = 'membership_not_found';
    public static readonly MEMBERSHIP_ALREADY_CONFIRMED = 'membership_already_confirmed';

    /** Avatars */
    public static readonly AVATAR_SET_NOT_FOUND = 'avatar_set_not_found';
    public static readonly AVATAR_NOT_FOUND = 'avatar_not_found';
    public static readonly AVATAR_IMAGE_NOT_FOUND = 'avatar_image_not_found';
    public static readonly AVATAR_REMOTE_URL_FAILED = 'avatar_remote_url_failed';
    public static readonly AVATAR_ICON_NOT_FOUND = 'avatar_icon_not_found';

    /** Storage */
    public static readonly STORAGE_FILE_ALREADY_EXISTS = 'storage_file_already_exists';
    public static readonly STORAGE_FILE_NOT_FOUND = 'storage_file_not_found';
    public static readonly STORAGE_DEVICE_NOT_FOUND = 'storage_device_not_found';
    public static readonly STORAGE_FILE_EMPTY = 'storage_file_empty';
    public static readonly STORAGE_FILE_TYPE_UNSUPPORTED = 'storage_file_type_unsupported';
    public static readonly STORAGE_INVALID_FILE_SIZE = 'storage_invalid_file_size';
    public static readonly STORAGE_INVALID_FILE = 'storage_invalid_file';
    public static readonly STORAGE_BUCKET_ALREADY_EXISTS = 'storage_bucket_already_exists';
    public static readonly STORAGE_BUCKET_NOT_FOUND = 'storage_bucket_not_found';
    public static readonly STORAGE_INVALID_CONTENT_RANGE = 'storage_invalid_content_range';
    public static readonly STORAGE_INVALID_RANGE = 'storage_invalid_range';
    public static readonly STORAGE_INVALID_APPWRITE_ID = 'storage_invalid_appwrite_id';
    public static readonly STORAGE_FILE_NOT_PUBLIC = 'storage_file_not_public';

    /** VCS */
    public static readonly INSTALLATION_NOT_FOUND = 'installation_not_found';
    public static readonly PROVIDER_REPOSITORY_NOT_FOUND = 'provider_repository_not_found';
    public static readonly REPOSITORY_NOT_FOUND = 'repository_not_found';
    public static readonly PROVIDER_CONTRIBUTION_CONFLICT = 'provider_contribution_conflict';
    public static readonly GENERAL_PROVIDER_FAILURE = 'general_provider_failure';

    /** Functions */
    public static readonly FUNCTION_NOT_FOUND = 'function_not_found';
    public static readonly FUNCTION_RUNTIME_UNSUPPORTED = 'function_runtime_unsupported';
    public static readonly FUNCTION_ENTRYPOINT_MISSING = 'function_entrypoint_missing';
    public static readonly FUNCTION_SYNCHRONOUS_TIMEOUT = 'function_synchronous_timeout';

    /** Deployments */
    public static readonly DEPLOYMENT_NOT_FOUND = 'deployment_not_found';

    /** Builds */
    public static readonly BUILD_NOT_FOUND = 'build_not_found';
    public static readonly BUILD_NOT_READY = 'build_not_ready';
    public static readonly BUILD_IN_PROGRESS = 'build_in_progress';

    /** Execution */
    public static readonly EXECUTION_NOT_FOUND = 'execution_not_found';

    /** Databases */
    public static readonly DATABASE_NOT_FOUND = 'database_not_found';
    public static readonly DATABASE_ALREADY_EXISTS = 'database_already_exists';
    public static readonly DATABASE_TIMEOUT = 'database_timeout';

    /** Collections */
    public static readonly COLLECTION_NOT_FOUND = 'collection_not_found';
    public static readonly COLLECTION_ALREADY_EXISTS = 'collection_already_exists';
    public static readonly COLLECTION_LIMIT_EXCEEDED = 'collection_limit_exceeded';

    /** Documents */
    public static readonly DOCUMENT_NOT_FOUND = 'document_not_found';
    public static readonly DOCUMENT_INVALID_STRUCTURE = 'document_invalid_structure';
    public static readonly DOCUMENT_MISSING_DATA = 'document_missing_data';
    public static readonly DOCUMENT_MISSING_PAYLOAD = 'document_missing_payload';
    public static readonly DOCUMENT_ALREADY_EXISTS = 'document_already_exists';
    public static readonly DOCUMENT_UPDATE_CONFLICT = 'document_update_conflict';
    public static readonly DOCUMENT_DELETE_RESTRICTED = 'document_delete_restricted';

    /** Attribute */
    public static readonly ATTRIBUTE_NOT_FOUND = 'attribute_not_found';
    public static readonly ATTRIBUTE_UNKNOWN = 'attribute_unknown';
    public static readonly ATTRIBUTE_NOT_AVAILABLE = 'attribute_not_available';
    public static readonly ATTRIBUTE_FORMAT_UNSUPPORTED = 'attribute_format_unsupported';
    public static readonly ATTRIBUTE_DEFAULT_UNSUPPORTED = 'attribute_default_unsupported';
    public static readonly ATTRIBUTE_ALREADY_EXISTS = 'attribute_already_exists';
    public static readonly ATTRIBUTE_LIMIT_EXCEEDED = 'attribute_limit_exceeded';
    public static readonly ATTRIBUTE_VALUE_INVALID = 'attribute_value_invalid';
    public static readonly ATTRIBUTE_TYPE_INVALID = 'attribute_type_invalid';

    /** Relationship */
    public static readonly RELATIONSHIP_VALUE_INVALID = 'relationship_value_invalid';

    /** Indexes */
    public static readonly INDEX_NOT_FOUND = 'index_not_found';
    public static readonly INDEX_LIMIT_EXCEEDED = 'index_limit_exceeded';
    public static readonly INDEX_ALREADY_EXISTS = 'index_already_exists';
    public static readonly INDEX_INVALID = 'index_invalid';

    /** Projects */
    public static readonly PROJECT_NOT_FOUND = 'project_not_found';
    public static readonly PROJECT_PROVIDER_DISABLED = 'project_provider_disabled';
    public static readonly PROJECT_PROVIDER_UNSUPPORTED = 'project_provider_unsupported';
    public static readonly PROJECT_ALREADY_EXISTS = 'project_already_exists';
    public static readonly PROJECT_INVALID_SUCCESS_URL = 'project_invalid_success_url';
    public static readonly PROJECT_INVALID_FAILURE_URL = 'project_invalid_failure_url';
    public static readonly PROJECT_RESERVED_PROJECT = 'project_reserved_project';
    public static readonly PROJECT_KEY_EXPIRED = 'project_key_expired';

    public static readonly PROJECT_SMTP_CONFIG_INVALID = 'project_smtp_config_invalid';

    public static readonly PROJECT_TEMPLATE_DEFAULT_DELETION = 'project_template_default_deletion';

    public static readonly PROJECT_REGION_UNSUPPORTED = 'project_region_unsupported';

    /** Webhooks */
    public static readonly WEBHOOK_NOT_FOUND = 'webhook_not_found';

    /** Router */
    public static readonly ROUTER_HOST_NOT_FOUND = 'router_host_not_found';
    public static readonly ROUTER_DOMAIN_NOT_CONFIGURED = 'router_domain_not_configured';

    /** Proxy */
    public static readonly RULE_RESOURCE_NOT_FOUND = 'rule_resource_not_found';
    public static readonly RULE_NOT_FOUND = 'rule_not_found';
    public static readonly RULE_ALREADY_EXISTS = 'rule_already_exists';
    public static readonly RULE_VERIFICATION_FAILED = 'rule_verification_failed';

    /** Keys */
    public static readonly KEY_NOT_FOUND = 'key_not_found';

    /** Variables */
    public static readonly VARIABLE_NOT_FOUND = 'variable_not_found';
    public static readonly VARIABLE_ALREADY_EXISTS = 'variable_already_exists';

    /** Platform */
    public static readonly PLATFORM_NOT_FOUND = 'platform_not_found';

    /** GraphQL */
    public static readonly GRAPHQL_NO_QUERY = 'graphql_no_query';
    public static readonly GRAPHQL_TOO_MANY_QUERIES = 'graphql_too_many_queries';

    /** Migrations */
    public static readonly MIGRATION_NOT_FOUND = 'migration_not_found';
    public static readonly MIGRATION_ALREADY_EXISTS = 'migration_already_exists';
    public static readonly MIGRATION_IN_PROGRESS = 'migration_in_progress';
    public static readonly MIGRATION_PROVIDER_ERROR = 'migration_provider_error';

    /** Realtime */
    public static readonly REALTIME_MESSAGE_FORMAT_INVALID = 'realtime_message_format_invalid';
    public static readonly REALTIME_TOO_MANY_MESSAGES = 'realtime_too_many_messages';
    public static readonly REALTIME_POLICY_VIOLATION = 'realtime_policy_violation';

    /** Health */
    public static readonly HEALTH_QUEUE_SIZE_EXCEEDED = 'health_queue_size_exceeded';
    public static readonly HEALTH_CERTIFICATE_EXPIRED = 'health_certificate_expired';
    public static readonly HEALTH_INVALID_HOST = 'health_invalid_host';

    /** Provider */
    public static readonly PROVIDER_NOT_FOUND = 'provider_not_found';
    public static readonly PROVIDER_ALREADY_EXISTS = 'provider_already_exists';
    public static readonly PROVIDER_INCORRECT_TYPE = 'provider_incorrect_type';
    public static readonly PROVIDER_MISSING_CREDENTIALS = 'provider_missing_credentials';

    /** Topic */
    public static readonly TOPIC_NOT_FOUND = 'topic_not_found';
    public static readonly TOPIC_ALREADY_EXISTS = 'topic_already_exists';

    /** Subscriber */
    public static readonly SUBSCRIBER_NOT_FOUND = 'subscriber_not_found';
    public static readonly SUBSCRIBER_ALREADY_EXISTS = 'subscriber_already_exists';

    /** Message */
    public static readonly MESSAGE_NOT_FOUND = 'message_not_found';
    public static readonly MESSAGE_MISSING_TARGET = 'message_missing_target';
    public static readonly MESSAGE_ALREADY_SENT = 'message_already_sent';
    public static readonly MESSAGE_ALREADY_PROCESSING = 'message_already_processing';
    public static readonly MESSAGE_ALREADY_FAILED = 'message_already_failed';
    public static readonly MESSAGE_ALREADY_SCHEDULED = 'message_already_scheduled';
    public static readonly MESSAGE_TARGET_NOT_EMAIL = 'message_target_not_email';
    public static readonly MESSAGE_TARGET_NOT_SMS = 'message_target_not_sms';
    public static readonly MESSAGE_TARGET_NOT_PUSH = 'message_target_not_push';
    public static readonly MESSAGE_MISSING_SCHEDULE = 'message_missing_schedule';

    /** Targets */
    public static readonly TARGET_PROVIDER_INVALID_TYPE = 'target_provider_invalid_type';

    /** Schedules */
    public static readonly SCHEDULE_NOT_FOUND = 'schedule_not_found';

    protected type: string = '';
    protected errors: Record<string, any> = {};
    protected publish: boolean = false;

    constructor(
        type: string = AppcondaException.GENERAL_UNKNOWN,
        message: string  = null as any ,
        code?: number | string ,
        previous?: Error 
    ) {
        super(message,code,previous);
        const errors = Config.getParam('errors');
        this.type = type;
        let numericCode: number;

        if (typeof code === 'string') {
            numericCode = isNaN(Number(code)) ? 500 : Number(code);
        } else if (typeof code === 'number') {
            numericCode = code;
        } else {
            numericCode = errors[type]?.code || 500;
        }

        this.message = message || errors[type]?.description || 'An error occurred.';
        this.code = numericCode;
        this.publish = errors[type]?.publish ?? (this.code >= 500);

        if (previous) {
            this.stack = previous.stack;
        }

       // super(this.message);
        this.name = 'AppcondaException';
    }

    /**
     * Get the type of the exception.
     *
     * @return string
     */
    public getType(): string {
        return this.type;
    }

    /**
     * Set the type of the exception.
     *
     * @param type
     *
     * @return void
     */
    public setType(type: string): void {
        this.type = type;
    }

    /**
     * Check whether the log is publishable for the exception.
     *
     * @return boolean
     */
    public isPublishable(): boolean {
        return this.publish;
    }
}
