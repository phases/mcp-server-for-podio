#!/usr/bin/env node

import express from 'express';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { registerTools } from './tools/index.js';
import { ensureConfigFile } from './config/podio.config.js';

/**
 * Podio MCP Server
 *
 * A Model Context Protocol server for Podio integration development.
 * Provides tools to inspect Podio APIs, authenticate, and generate configs.
 * Supports stdio (for Cursor) and HTTP/SSE (for remote access).
 */

/** Session map for HTTP/SSE: sessionId -> transport (for routing POST /message). */
const sseSessions = new Map<string, SSEServerTransport>();

/** Creates and configures an MCP server instance (no transport connected). */
function createMcpServer(): Server {
  const server = new Server(
    {
      name: 'podio-developer-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Set up error handling
  server.onerror = error => {
    console.error('[MCP Error]', error);
  };

  // Handle tool listing
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: await registerTools(server),
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;

    try {
      // Universal tool handlers
      const toolHandlers: Record<string, (args: any) => Promise<any>> = {
        podio_items: async (args: {
          operation: 'get' | 'create' | 'update' | 'delete' | 'filter' | 'get_field_value' | 'get_revisions' | 'get_revision' | 'get_revision_diff' | 'get_field_history';
          itemId?: number;
          appId?: number;
          fieldId?: number;
          revision?: number;
          revisionFrom?: number;
          revisionTo?: number;
          fields?: Record<string, unknown>;
          tags?: string[];
          fileIds?: number[];
          externalId?: string;
          hooks?: boolean;
          filters?: Array<Record<string, unknown>>;
          sortBy?: string;
          sortDesc?: boolean;
          limit?: number;
          offset?: number;
          appToken?: string;
          itemFields?: string;
        }) => {
          const { callPodioApi } = await import('./lib/apiCaller.js');
          switch (args.operation) {
            case 'get': {
              const { getItem } = await import('./tools/getItem.js');
              if (!args.itemId) throw new Error('itemId is required for get');
              return await getItem({ itemId: args.itemId, fields: args.itemFields, appId: args.appId, appToken: args.appToken });
            }
            case 'create': {
              const { createItem } = await import('./tools/createItem.js');
              if (!args.appId || !args.fields) throw new Error('appId and fields are required for create');
              return await createItem(args.appId, { fields: args.fields, tags: args.tags, fileIds: args.fileIds, externalId: args.externalId, appToken: args.appToken, hooks: args.hooks });
            }
            case 'update': {
              const { updateItem } = await import('./tools/updateItem.js');
              if (!args.itemId) throw new Error('itemId is required for update');
              return await updateItem(args.itemId, { fields: args.fields, tags: args.tags });
            }
            case 'delete': {
              const { deleteItem } = await import('./tools/deleteItem.js');
              if (!args.itemId) throw new Error('itemId is required for delete');
              return await deleteItem({ itemId: args.itemId, appId: args.appId, appToken: args.appToken });
            }
            case 'filter': {
              const { filterItems } = await import('./tools/filterItems.js');
              if (!args.appId) throw new Error('appId is required for filter');
              return await filterItems(args.appId, { filters: args.filters, sortBy: args.sortBy, sortDesc: args.sortDesc, limit: args.limit, offset: args.offset });
            }
            case 'get_field_value': {
              if (!args.itemId || !args.fieldId) throw new Error('itemId and fieldId are required for get_field_value');
              return await callPodioApi('items-value', { pathParams: { item_id: args.itemId, field_id: args.fieldId } });
            }
            case 'get_revisions': {
              if (!args.itemId) throw new Error('itemId is required for get_revisions');
              return await callPodioApi('items-revision', { pathParams: { item_id: args.itemId } });
            }
            case 'get_revision': {
              if (!args.itemId || args.revision === undefined) throw new Error('itemId and revision are required for get_revision');
              return await callPodioApi('items-revision-get', { pathParams: { item_id: args.itemId, revision: args.revision } });
            }
            case 'get_revision_diff': {
              if (!args.itemId || args.revisionFrom === undefined || args.revisionTo === undefined) throw new Error('itemId, revisionFrom, and revisionTo are required for get_revision_diff');
              return await callPodioApi('items-revision-diff', { pathParams: { item_id: args.itemId, revision_from: args.revisionFrom, revision_to: args.revisionTo } });
            }
            case 'get_field_history': {
              if (!args.itemId || !args.fieldId) throw new Error('itemId and fieldId are required for get_field_history');
              const limit = args.limit || 5;

              // 1. Get current item to get the latest value
              const { getItem } = await import('./tools/getItem.js');
              const itemResult = await getItem({ itemId: args.itemId, appId: args.appId, appToken: args.appToken });
              if (!itemResult.success) return itemResult;

              const itemData = itemResult.data as any;
              const field = itemData.fields?.find((f: any) => f.field_id === args.fieldId || f.external_id === String(args.fieldId));
              const history: any[] = [];

              if (field) {
                history.push({
                  revision: itemData.revision,
                  value: field.values,
                  created_on: itemData.created_on,
                  created_by: itemData.created_by
                });
              }

              if (history.length >= limit) return { success: true, history };

              // 2. Get all revisions
              const revisionsResult = await callPodioApi('items-revision', { pathParams: { item_id: args.itemId } }, undefined, args.appId, args.appToken);
              if (!revisionsResult.success) return revisionsResult;

              const revisions = (revisionsResult.data as any[]).sort((a, b) => b.revision - a.revision);

              // 3. Iterate through revisions and fetch diffs
              for (let i = 0; i < revisions.length - 1; i++) {
                const currentRev = revisions[i];
                const prevRev = revisions[i + 1];

                const diffResult = await callPodioApi('items-revision-diff', {
                  pathParams: {
                    item_id: args.itemId,
                    revision_from: prevRev.revision,
                    revision_to: currentRev.revision
                  }
                }, undefined, args.appId, args.appToken);

                if (diffResult.success) {
                  const diffData = diffResult.data as any[];
                  const fieldDiff = diffData.find((d: any) => d.field_id === args.fieldId || d.external_id === String(args.fieldId));

                  if (fieldDiff) {
                    // The 'from' value in this diff is the value at prevRev
                    history.push({
                      revision: prevRev.revision,
                      value: fieldDiff.from,
                      created_on: prevRev.created_on,
                      created_by: prevRev.created_by
                    });
                  }
                }

                if (history.length >= limit) break;
              }

              return { success: true, history };
            }
            default: throw new Error(`Unknown operation: ${args.operation} for podio_items`);
          }
        },
        podio_apps_spaces: async (args: {
          operation: 'get_app' | 'list_apps' | 'get_space' | 'list_spaces' | 'create_space' | 'list_space_apps' | 'list_space_members' | 'get_org' | 'list_orgs' | 'get_org_members' | 'get_app_stream' | 'get_space_stream' | 'get_global_stream';
          appId?: number;
          spaceId?: number;
          orgId?: number;
          name?: string;
          privacy?: 'open' | 'closed';
          limit?: number;
          offset?: number;
        }) => {
          switch (args.operation) {
            case 'get_app': {
              const { getApp } = await import('./tools/getApp.js');
              if (!args.appId) throw new Error('appId is required');
              return await getApp(args.appId);
            }
            case 'list_apps': {
              const { listApps } = await import('./tools/listApps.js');
              return await listApps(args.spaceId);
            }
            case 'get_space': {
              const { getSpace } = await import('./tools/getSpace.js');
              if (!args.spaceId) throw new Error('spaceId is required');
              return await getSpace(args.spaceId);
            }
            case 'list_spaces': {
              const { listSpaces } = await import('./tools/listSpaces.js');
              return await listSpaces({ orgId: args.orgId });
            }
            case 'create_space': {
              const { createSpace } = await import('./tools/createSpace.js');
              if (!args.name || !args.orgId || !args.privacy) throw new Error('name, orgId, and privacy are required');
              return await createSpace({ name: args.name, orgId: args.orgId, privacy: args.privacy });
            }
            case 'list_space_apps': {
              const { listSpaceApps } = await import('./tools/listSpaceApps.js');
              if (!args.spaceId) throw new Error('spaceId is required');
              return await listSpaceApps(args.spaceId);
            }
            case 'list_space_members': {
              const { listSpaceMembers } = await import('./tools/listSpaceMembers.js');
              if (!args.spaceId) throw new Error('spaceId is required');
              return await listSpaceMembers(args.spaceId);
            }
            case 'get_org': {
              const { getOrganization } = await import('./tools/getOrganization.js');
              if (!args.orgId) throw new Error('orgId is required');
              return await getOrganization(args.orgId);
            }
            case 'list_orgs': {
              const { listOrganizations } = await import('./tools/listOrganizations.js');
              return await listOrganizations();
            }
            case 'get_org_members': {
              const { getOrganizationMembers } = await import('./tools/getOrganizationMembers.js');
              if (!args.orgId) throw new Error('orgId is required');
              return await getOrganizationMembers(args.orgId);
            }
            case 'get_app_stream': {
              const { getAppStream } = await import('./tools/getAppStream.js');
              if (!args.appId) throw new Error('appId is required');
              return await getAppStream({ appId: args.appId, limit: args.limit });
            }
            case 'get_space_stream': {
              const { getSpaceStream } = await import('./tools/getSpaceStream.js');
              if (!args.spaceId) throw new Error('spaceId is required');
              return await getSpaceStream({ spaceId: args.spaceId, limit: args.limit });
            }
            case 'get_global_stream': {
              const { getGlobalStream } = await import('./tools/getGlobalStream.js');
              return await getGlobalStream({ limit: args.limit, offset: args.offset });
            }
            default: throw new Error(`Unknown operation: ${args.operation} for podio_apps_spaces`);
          }
        },
        podio_tasks: async (args: {
          operation: 'get' | 'list' | 'create' | 'update' | 'complete';
          taskId?: number;
          text?: string;
          dueOn?: string;
          responsible?: number;
          private?: boolean;
          refType?: string;
          refId?: number;
          status?: 'active' | 'completed';
          spaceId?: number;
          appId?: number;
          orgId?: number;
          completed?: boolean;
        }) => {
          switch (args.operation) {
            case 'get': {
              const { getTask } = await import('./tools/getTask.js');
              if (!args.taskId) throw new Error('taskId is required');
              return await getTask(args.taskId);
            }
            case 'list': {
              const { listTasks } = await import('./tools/listTasks.js');
              return await listTasks({ responsible: args.responsible, spaceId: args.spaceId, appId: args.appId, orgId: args.orgId, completed: args.completed });
            }
            case 'create': {
              const { createTask } = await import('./tools/createTask.js');
              if (!args.text) throw new Error('text is required');
              return await createTask({ text: args.text, dueOn: args.dueOn, responsible: args.responsible, private: args.private, refType: args.refType, refId: args.refId });
            }
            case 'update': {
              const { updateTask } = await import('./tools/updateTask.js');
              if (!args.taskId) throw new Error('taskId is required');
              return await updateTask(args.taskId, { text: args.text, status: args.status, dueOn: args.dueOn });
            }
            case 'complete': {
              const { completeTask } = await import('./tools/completeTask.js');
              if (!args.taskId) throw new Error('taskId is required');
              return await completeTask(args.taskId);
            }
            default: throw new Error(`Unknown operation: ${args.operation} for podio_tasks`);
          }
        },
        podio_communication: async (args: {
          operation: 'get_comment' | 'list_comments' | 'create_comment' | 'update_comment' | 'delete_comment' | 'get_status' | 'create_status' | 'delete_status' | 'list_notifications' | 'mark_notification_viewed' | 'mark_all_notifications_viewed' | 'list_subscriptions' | 'create_subscription' | 'delete_subscription' | 'list_tags' | 'create_tags' | 'delete_tags';
          commentId?: number;
          statusId?: number;
          notificationId?: number;
          refType?: string;
          refId?: number;
          value?: string;
          externalId?: string;
          fileIds?: number[];
          viewed?: boolean;
          starred?: boolean;
          text?: string[];
          spaceId?: number;
        }) => {
          switch (args.operation) {
            case 'get_comment': {
              const { getComment } = await import('./tools/getComment.js');
              if (!args.commentId) throw new Error('commentId is required');
              return await getComment(args.commentId);
            }
            case 'list_comments': {
              const { listComments } = await import('./tools/listComments.js');
              if (!args.refType || !args.refId) throw new Error('refType and refId are required');
              return await listComments(args.refType, args.refId);
            }
            case 'create_comment': {
              const { createComment } = await import('./tools/createComment.js');
              if (!args.refType || !args.refId || !args.value) throw new Error('refType, refId, and value are required');
              return await createComment(args.refType, args.refId, { value: args.value, externalId: args.externalId });
            }
            case 'update_comment': {
              const { updateComment } = await import('./tools/updateComment.js');
              if (!args.commentId || !args.value) throw new Error('commentId and value are required');
              return await updateComment(args.commentId, args.value);
            }
            case 'delete_comment': {
              const { deleteComment } = await import('./tools/deleteComment.js');
              if (!args.commentId) throw new Error('commentId is required');
              return await deleteComment(args.commentId);
            }
            case 'get_status': {
              const { getStatus } = await import('./tools/getStatus.js');
              if (!args.statusId) throw new Error('statusId is required');
              return await getStatus(args.statusId);
            }
            case 'create_status': {
              const { createStatus } = await import('./tools/createStatus.js');
              if (!args.spaceId || !args.value) throw new Error('spaceId and value are required');
              // spaceId is in args but types might need casting or additional check
              return await createStatus({ spaceId: args.refId as number || 0, value: args.value, fileIds: args.fileIds });
            }
            case 'delete_status': {
              const { deleteStatus } = await import('./tools/deleteStatus.js');
              if (!args.statusId) throw new Error('statusId is required');
              return await deleteStatus(args.statusId);
            }
            case 'list_notifications': {
              const { listNotifications } = await import('./tools/listNotifications.js');
              return await listNotifications({ viewed: args.viewed, starred: args.starred });
            }
            case 'mark_notification_viewed': {
              const { markNotificationViewed } = await import('./tools/markNotificationViewed.js');
              if (!args.notificationId) throw new Error('notificationId is required');
              return await markNotificationViewed(args.notificationId);
            }
            case 'mark_all_notifications_viewed': {
              const { markAllNotificationsViewed } = await import('./tools/markAllNotificationsViewed.js');
              return await markAllNotificationsViewed();
            }
            case 'list_subscriptions': {
              const { listSubscriptions } = await import('./tools/listSubscriptions.js');
              if (!args.refType || !args.refId) throw new Error('refType and refId are required');
              return await listSubscriptions({ refType: args.refType, refId: args.refId });
            }
            case 'create_subscription': {
              const { createSubscription } = await import('./tools/createSubscription.js');
              if (!args.refType || !args.refId) throw new Error('refType and refId are required');
              return await createSubscription({ refType: args.refType, refId: args.refId });
            }
            case 'delete_subscription': {
              const { deleteSubscription } = await import('./tools/deleteSubscription.js');
              if (!args.refType || !args.refId) throw new Error('refType and refId are required');
              return await deleteSubscription({ refType: args.refType, refId: args.refId });
            }
            case 'list_tags': {
              const { listTags } = await import('./tools/listTags.js');
              if (!args.refType || !args.refId) throw new Error('refType and refId are required');
              return await listTags({ refType: args.refType, refId: args.refId });
            }
            case 'create_tags': {
              const { createTags } = await import('./tools/createTags.js');
              if (!args.refType || !args.refId || !args.text) throw new Error('refType, refId, and text are required');
              return await createTags({ refType: args.refType, refId: args.refId, text: args.text });
            }
            case 'delete_tags': {
              const { deleteTags } = await import('./tools/deleteTags.js');
              if (!args.refType || !args.refId || !args.text) throw new Error('refType, refId, and text are required');
              return await deleteTags({ refType: args.refType, refId: args.refId, text: args.text });
            }
            default: throw new Error(`Unknown operation: ${args.operation} for podio_communication`);
          }
        },
        podio_search: async (args: {
          operation: 'global' | 'app' | 'contacts' | 'get_contact' | 'list_contacts';
          query?: string;
          appId?: number;
          contactId?: number;
          refType?: string;
          limit?: number;
          spaceId?: number;
          orgId?: number;
        }) => {
          switch (args.operation) {
            case 'global': {
              const { search } = await import('./tools/search.js');
              if (!args.query) throw new Error('query is required');
              return await search({ query: args.query, refType: args.refType, limit: args.limit });
            }
            case 'app': {
              const { searchApp } = await import('./tools/searchApp.js');
              if (!args.appId || !args.query) throw new Error('appId and query are required');
              return await searchApp({ appId: args.appId, query: args.query, limit: args.limit });
            }
            case 'contacts': {
              const { searchContacts } = await import('./tools/searchContacts.js');
              if (!args.query) throw new Error('query is required');
              return await searchContacts({ query: args.query, limit: args.limit });
            }
            case 'get_contact': {
              const { getContact } = await import('./tools/getContact.js');
              if (!args.contactId) throw new Error('contactId is required');
              return await getContact(args.contactId);
            }
            case 'list_contacts': {
              const { listContacts } = await import('./tools/listContacts.js');
              return await listContacts({ spaceId: args.spaceId, orgId: args.orgId });
            }
            default: throw new Error(`Unknown operation: ${args.operation} for podio_search`);
          }
        },
        podio_metadata: async (args: {
          operation: 'list_api_groups' | 'list_apis_by_group' | 'get_api_details' | 'search_apis' | 'list_app_fields' | 'get_form' | 'list_forms' | 'submit_form' | 'get_view' | 'list_views' | 'create_view';
          group?: string;
          apiId?: string;
          keyword?: string;
          appName?: string;
          appId?: number;
          formId?: number;
          viewId?: number;
          name?: string;
          type?: string;
          fields?: Record<string, unknown>;
          filters?: Record<string, unknown>;
        }) => {
          switch (args.operation) {
            case 'list_api_groups': {
              const { listApiGroups } = await import('./tools/listApiGroups.js');
              return await listApiGroups();
            }
            case 'list_apis_by_group': {
              const { listApisByGroup } = await import('./tools/listApisByGroup.js');
              if (!args.group) throw new Error('group is required');
              return await listApisByGroup(args.group);
            }
            case 'get_api_details': {
              const { getApiDetails } = await import('./tools/getApiDetails.js');
              if (!args.apiId) throw new Error('apiId is required');
              return await getApiDetails(args.apiId);
            }
            case 'search_apis': {
              const { searchApis } = await import('./tools/searchApis.js');
              if (!args.keyword) throw new Error('keyword is required');
              return await searchApis(args.keyword);
            }
            case 'list_app_fields': {
              const { listAppFields } = await import('./tools/listAppFields.js');
              if (!args.appName) throw new Error('appName is required');
              return await listAppFields(args.appName);
            }
            case 'get_form': {
              const { getForm } = await import('./tools/getForm.js');
              if (!args.formId) throw new Error('formId is required');
              return await getForm(args.formId);
            }
            case 'list_forms': {
              const { listForms } = await import('./tools/listForms.js');
              if (!args.appId) throw new Error('appId is required');
              return await listForms(args.appId);
            }
            case 'submit_form': {
              const { submitForm } = await import('./tools/submitForm.js');
              if (!args.formId || !args.fields) throw new Error('formId and fields are required');
              return await submitForm({ formId: args.formId, fields: args.fields });
            }
            case 'get_view': {
              const { getView } = await import('./tools/getView.js');
              if (!args.viewId) throw new Error('viewId is required');
              return await getView(args.viewId);
            }
            case 'list_views': {
              const { listViews } = await import('./tools/listViews.js');
              if (!args.appId) throw new Error('appId is required');
              return await listViews(args.appId);
            }
            case 'create_view': {
              const { createView } = await import('./tools/createView.js');
              if (!args.appId || !args.name || !args.type) throw new Error('appId, name, and type are required');
              return await createView({ appId: args.appId, name: args.name, type: args.type, filters: args.filters });
            }
            default: throw new Error(`Unknown operation: ${args.operation} for podio_metadata`);
          }
        },
        podio_system: async (args: {
          operation: 'ping' | 'get_config_status' | 'generate_field_config' | 'get_file' | 'delete_file' | 'attach_file' | 'create_hook' | 'list_hooks' | 'delete_hook' | 'verify_hook' | 'execute_batch' | 'get_calendar';
          appId?: number;
          appToken?: string;
          outputPath?: string;
          fileId?: number;
          refType?: string;
          refId?: number;
          url?: string;
          type?: string;
          hookId?: number;
          items?: Array<{ method: string; url: string; body?: unknown }>;
          dateFrom?: string;
          dateTo?: string;
          spaceId?: number;
        }) => {
          switch (args.operation) {
            case 'ping': {
              const { pingTool } = await import('./tools/ping.js');
              return await pingTool();
            }
            case 'get_config_status': {
              const { getConfigStatus } = await import('./tools/getConfigStatus.js');
              return await getConfigStatus();
            }
            case 'generate_field_config': {
              const { generatePodioFieldConfig } = await import('./tools/generatePodioFieldConfig.js');
              if (!args.appId || !args.appToken) throw new Error('appId and appToken are required');
              return await generatePodioFieldConfig({ appId: args.appId, appToken: args.appToken, outputPath: args.outputPath });
            }
            case 'get_file': {
              const { getFile } = await import('./tools/getFile.js');
              if (!args.fileId) throw new Error('fileId is required');
              return await getFile(args.fileId);
            }
            case 'delete_file': {
              const { deleteFile } = await import('./tools/deleteFile.js');
              if (!args.fileId) throw new Error('fileId is required');
              return await deleteFile(args.fileId);
            }
            case 'attach_file': {
              const { attachFile } = await import('./tools/attachFile.js');
              if (!args.fileId || !args.refType || !args.refId) throw new Error('fileId, refType, and refId are required');
              return await attachFile({ fileId: args.fileId, refType: args.refType, refId: args.refId });
            }
            case 'create_hook': {
              const { createHook } = await import('./tools/createHook.js');
              if (!args.refType || !args.refId || !args.url || !args.type) throw new Error('refType, refId, url, and type are required');
              return await createHook({ refType: args.refType, refId: args.refId, url: args.url, type: args.type });
            }
            case 'list_hooks': {
              const { listHooks } = await import('./tools/listHooks.js');
              if (!args.refType || !args.refId) throw new Error('refType and refId are required');
              return await listHooks({ refType: args.refType, refId: args.refId });
            }
            case 'delete_hook': {
              const { deleteHook } = await import('./tools/deleteHook.js');
              if (!args.hookId) throw new Error('hookId is required');
              return await deleteHook(args.hookId);
            }
            case 'verify_hook': {
              const { verifyHook } = await import('./tools/verifyHook.js');
              if (!args.hookId) throw new Error('hookId is required');
              return await verifyHook(args.hookId);
            }
            case 'execute_batch': {
              const { executeBatch } = await import('./tools/executeBatch.js');
              if (!args.items) throw new Error('items are required');
              return await executeBatch({ items: args.items });
            }
            case 'get_calendar': {
              const { getCalendar } = await import('./tools/getCalendar.js');
              return await getCalendar({ dateFrom: args.dateFrom, dateTo: args.dateTo, spaceId: args.spaceId });
            }
            default: throw new Error(`Unknown operation: ${args.operation} for podio_system`);
          }
        },
        callPodioApi: async (args: {
          endpointId: string;
          pathParams?: Record<string, string | number>;
          queryParams?: Record<string, string | number | boolean | undefined>;
          bodyParams?: Record<string, unknown>;
          useAppAuth?: boolean;
          appId?: number;
          appToken?: string;
        }) => {
          const { callPodioApiTool } = await import('./tools/callPodioApi.js');
          if (!args?.endpointId) {
            throw new Error('endpointId parameter is required');
          }
          return await callPodioApiTool(
            args.endpointId,
            args.pathParams,
            args.queryParams,
            args.bodyParams,
            args.useAppAuth || false,
            args.appId,
            args.appToken
          );
        },
      };

      const handler = toolHandlers[name];
      if (!handler) {
        throw new Error(`Unknown tool: ${name}`);
      }

      const result = await handler(args || {});
      return {
        content: [
          {
            type: 'text',
            text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

/** Run HTTP/SSE server for remote MCP connections (e.g. https://podiomcp.bitkit.dk). */
async function runHttpServer(port: number): Promise<void> {
  const app = express();

  app.get('/sse', async (_req, res: ServerResponse) => {
    const transport = new SSEServerTransport('/message', res);
    const server = createMcpServer();
    server.onerror = error => {
      console.error('[MCP Error]', error);
    };
    server.onclose = () => {
      sseSessions.delete(transport.sessionId);
    };
    await server.connect(transport);
    sseSessions.set(transport.sessionId, transport);
  });

  app.post('/message', async (req: IncomingMessage, res: ServerResponse) => {
    const sessionId = typeof req.url === 'string' ? new URL(req.url, 'http://localhost').searchParams.get('sessionId') : null;
    if (!sessionId) {
      res.writeHead(400).end('Missing sessionId');
      return;
    }
    const transport = sseSessions.get(sessionId);
    if (!transport) {
      res.writeHead(404).end('Session not found');
      return;
    }
    await transport.handlePostMessage(req, res);
  });

  app.get('/health', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'ok', service: 'podio-mcp' }));
  });

  app.listen(port, () => {
    console.error(`Podio MCP Server (HTTP/SSE) running on port ${port}`);
    console.error(`  SSE:  http://localhost:${port}/sse`);
    console.error(`  Health: http://localhost:${port}/health`);
  });
}

async function main() {
  ensureConfigFile();

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 0;
  if (port > 0) {
    await runHttpServer(port);
  } else {
    const server = createMcpServer();
    server.onerror = error => {
      console.error('[MCP Error]', error);
    };
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Podio MCP Server running on stdio');
  }
}

main().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
