import { Tool } from '@modelcontextprotocol/sdk/types.js';

/**
 * Consolidated Podio Tools
 * 
 * This file defines universal tools that group related operations together
 * to stay within MCP client tool limits.
 */

export function getConsolidatedTools(): Tool[] {
    return [
        {
            name: 'podio_items',
            description: 'Manage Podio items: fetch, create, update, delete, and filter items in apps.',
            inputSchema: {
                type: 'object',
                properties: {
                    operation: {
                        type: 'string',
                        enum: ['get', 'create', 'update', 'delete', 'filter', 'get_field_value', 'get_revisions', 'get_revision', 'get_revision_diff', 'get_field_history'],
                        description: 'The operation to perform on items'
                    },
                    itemId: { type: 'number', description: 'The ID of the item (for get, update, delete, get_field_value, get_revisions, etc.)' },
                    appId: { type: 'number', description: 'The ID of the app (for create, filter, delete-auth)' },
                    fieldId: { type: 'number', description: 'The ID of the field (for get_field_value)' },
                    revision: { type: 'number', description: 'Revision number (for get_revision)' },
                    revisionFrom: { type: 'number', description: 'Starting revision (for get_revision_diff)' },
                    revisionTo: { type: 'number', description: 'Ending revision (for get_revision_diff)' },
                    fields: { type: 'object', description: 'Field values (for create, update)', additionalProperties: true },
                    tags: { type: 'array', items: { type: 'string' }, description: 'Tags (for create, update)' },
                    fileIds: { type: 'array', items: { type: 'number' }, description: 'File IDs to attach (for create)' },
                    externalId: { type: 'string', description: 'External ID (for create)' },
                    hooks: { type: 'boolean', description: 'Enable hooks (for create, default: true)' },
                    filters: { type: 'array', items: { type: 'object' }, description: 'Filters (for filter)' },
                    sortBy: { type: 'string', description: 'Sort field (for filter)' },
                    sortDesc: { type: 'boolean', description: 'Sort descending (for filter)' },
                    limit: { type: 'number', description: 'Result limit (for filter)' },
                    offset: { type: 'number', description: 'Pagination offset (for filter)' },
                    appToken: { type: 'string', description: 'App token for app-level auth (optional)' },
                    itemFields: { type: 'string', description: 'Optional comma-separated field external IDs to include (for get)' }
                },
                required: ['operation']
            }
        },
        {
            name: 'podio_apps_spaces',
            description: 'Manage Podio Spaces, Apps, and Organizations, including activity streams.',
            inputSchema: {
                type: 'object',
                properties: {
                    operation: {
                        type: 'string',
                        enum: [
                            'get_app', 'list_apps', 'get_space', 'list_spaces', 'create_space',
                            'list_space_apps', 'list_space_members', 'get_org', 'list_orgs',
                            'get_org_members', 'get_app_stream', 'get_space_stream', 'get_global_stream'
                        ],
                        description: 'The operation to perform'
                    },
                    appId: { type: 'number', description: 'App ID' },
                    spaceId: { type: 'number', description: 'Space ID' },
                    orgId: { type: 'number', description: 'Organization ID' },
                    name: { type: 'string', description: 'Name (for create_space)' },
                    privacy: { type: 'string', enum: ['open', 'closed'], description: 'Privacy (for create_space)' },
                    limit: { type: 'number', description: 'Limit' },
                    offset: { type: 'number', description: 'Offset' }
                },
                required: ['operation']
            }
        },
        {
            name: 'podio_tasks',
            description: 'Manage Podio tasks: fetch, create, update, and complete tasks.',
            inputSchema: {
                type: 'object',
                properties: {
                    operation: {
                        type: 'string',
                        enum: ['get', 'list', 'create', 'update', 'complete'],
                        description: 'The operation to perform on tasks'
                    },
                    taskId: { type: 'number', description: 'Task ID' },
                    text: { type: 'string', description: 'Task text/description' },
                    dueOn: { type: 'string', description: 'Due date (YYYY-MM-DD HH:MM:SS)' },
                    responsible: { type: 'number', description: 'Responsible user ID' },
                    private: { type: 'boolean', description: 'Private task' },
                    refType: { type: 'string', description: 'Reference type' },
                    refId: { type: 'number', description: 'Reference ID' },
                    status: { type: 'string', enum: ['active', 'completed'], description: 'Task status' },
                    spaceId: { type: 'number', description: 'Space ID (for list)' },
                    appId: { type: 'number', description: 'App ID (for list)' },
                    orgId: { type: 'number', description: 'Org ID (for list)' },
                    completed: { type: 'boolean', description: 'Filter by completed' }
                },
                required: ['operation']
            }
        },
        {
            name: 'podio_communication',
            description: 'Manage comments, statuses, notifications, tags, and subscriptions.',
            inputSchema: {
                type: 'object',
                properties: {
                    operation: {
                        type: 'string',
                        enum: [
                            'get_comment', 'list_comments', 'create_comment', 'update_comment', 'delete_comment',
                            'get_status', 'create_status', 'delete_status',
                            'list_notifications', 'mark_notification_viewed', 'mark_all_notifications_viewed',
                            'list_subscriptions', 'create_subscription', 'delete_subscription',
                            'list_tags', 'create_tags', 'delete_tags'
                        ],
                        description: 'Communication operation'
                    },
                    commentId: { type: 'number' },
                    statusId: { type: 'number' },
                    notificationId: { type: 'number' },
                    refType: { type: 'string' },
                    refId: { type: 'number' },
                    value: { type: 'string', description: 'Comment or status text' },
                    externalId: { type: 'string' },
                    fileIds: { type: 'array', items: { type: 'number' } },
                    viewed: { type: 'boolean' },
                    starred: { type: 'boolean' },
                    text: { type: 'array', items: { type: 'string' }, description: 'Tags list' }
                },
                required: ['operation']
            }
        },
        {
            name: 'podio_search',
            description: 'Search across Podio for items, tasks, statuses, contacts, etc.',
            inputSchema: {
                type: 'object',
                properties: {
                    operation: {
                        type: 'string',
                        enum: ['global', 'app', 'contacts', 'get_contact', 'list_contacts'],
                        description: 'Search operation'
                    },
                    query: { type: 'string', description: 'Search term' },
                    appId: { type: 'number' },
                    spaceId: { type: 'number' },
                    orgId: { type: 'number' },
                    contactId: { type: 'number' },
                    refType: { type: 'string' },
                    limit: { type: 'number' }
                },
                required: ['operation']
            }
        },
        {
            name: 'podio_metadata',
            description: 'Explore Podio API, app fields, forms, and views.',
            inputSchema: {
                type: 'object',
                properties: {
                    operation: {
                        type: 'string',
                        enum: [
                            'list_api_groups', 'list_apis_by_group', 'get_api_details', 'search_apis',
                            'list_app_fields', 'get_form', 'list_forms', 'submit_form',
                            'get_view', 'list_views', 'create_view'
                        ],
                        description: 'Metadata operation'
                    },
                    group: { type: 'string' },
                    apiId: { type: 'string' },
                    keyword: { type: 'string' },
                    appName: { type: 'string' },
                    appId: { type: 'number' },
                    formId: { type: 'number' },
                    viewId: { type: 'number' },
                    name: { type: 'string' },
                    type: { type: 'string' },
                    fields: { type: 'object' },
                    filters: { type: 'object' }
                },
                required: ['operation']
            }
        },
        {
            name: 'podio_system',
            description: 'System tools: ping, config, files, hooks, batch, and calendar.',
            inputSchema: {
                type: 'object',
                properties: {
                    operation: {
                        type: 'string',
                        enum: [
                            'ping', 'get_config_status', 'generate_field_config',
                            'get_file', 'delete_file', 'attach_file',
                            'create_hook', 'list_hooks', 'delete_hook', 'verify_hook',
                            'execute_batch', 'get_calendar'
                        ],
                        description: 'System operation'
                    },
                    appId: { type: 'number' },
                    appToken: { type: 'string' },
                    outputPath: { type: 'string' },
                    fileId: { type: 'number' },
                    refType: { type: 'string' },
                    refId: { type: 'number' },
                    url: { type: 'string' },
                    type: { type: 'string' },
                    hookId: { type: 'number' },
                    items: { type: 'array', items: { type: 'object' } },
                    dateFrom: { type: 'string' },
                    dateTo: { type: 'string' },
                    spaceId: { type: 'number' }
                },
                required: ['operation']
            }
        }
    ];
}
