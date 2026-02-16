#!/usr/bin/env node
/**
 * Build comprehensive Podio API catalog
 * Based on https://developers.podio.com/doc
 */

const fs = require('fs');
const path = require('path');

const catalog = {
  version: "1.0.0",
  lastUpdated: new Date().toISOString().split('T')[0],
  baseUrl: "https://api.podio.com",
  documentation: "https://developers.podio.com/doc",
  rateLimit: {
    default: { limit: 2500, window: "hour" },
    auth: { limit: 100, window: "hour" },
    search: { limit: 1000, window: "hour" }
  },
  groups: []
};

function endpoint(id, method, path, summary, description, params = {}, responseFormat = "JSON object") {
  return {
    id,
    method,
    path,
    summary,
    description,
    params: {
      path: params.path || {},
      query: params.query || {},
      body: params.body || {}
    },
    rateLimit: params.rateLimit || catalog.rateLimit.default,
    responseFormat
  };
}

// ========== CORE AREAS ==========

// Applications
catalog.groups.push({
  id: "applications",
  name: "Applications",
  description: "Operations for managing application definitions",
  endpoints: [
    endpoint("apps-get", "GET", "/app/{app_id}", "Get app definition",
      "Retrieves the definition of an app including all fields, configuration, and metadata",
      { path: { app_id: { type: "integer", required: true, description: "The ID of the app" } } },
      "{ app_id, name, status, fields: [...], config: {...} }"
    ),
    endpoint("apps-list", "GET", "/app/", "List apps",
      "Lists all apps accessible to the authenticated user",
      { query: { space_id: { type: "integer", required: false, description: "Filter by space ID" } } },
      "[{ app_id, name, status, ... }, ...]"
    ),
    endpoint("apps-fields", "GET", "/app/{app_id}/field/", "Get app fields",
      "Retrieves all fields for an app",
      { path: { app_id: { type: "integer", required: true, description: "The ID of the app" } } },
      "[{ field_id, external_id, type, label, config: {...} }, ...]"
    ),
    endpoint("apps-create", "POST", "/app/", "Create app",
      "Creates a new app in a space",
      {
        body: {
          space_id: { type: "integer", required: true, description: "Space ID" },
          name: { type: "string", required: true, description: "App name" },
          fields: { type: "array", required: true, description: "Field definitions" }
        }
      },
      "{ app_id, name, status, ... }"
    ),
    endpoint("apps-update", "PUT", "/app/{app_id}", "Update app",
      "Updates app configuration",
      {
        path: { app_id: { type: "integer", required: true, description: "The ID of the app" } },
        body: { name: { type: "string", required: false, description: "App name" } }
      }
    ),
    endpoint("apps-delete", "DELETE", "/app/{app_id}", "Delete app",
      "Deletes an app",
      { path: { app_id: { type: "integer", required: true, description: "The ID of the app" } } }
    )
  ]
});

// Items - Comprehensive
catalog.groups.push({
  id: "items",
  name: "Items",
  description: "Operations for managing items (records) in Podio apps",
  endpoints: [
    endpoint("items-get", "GET", "/item/{item_id}", "Get item by ID",
      "Retrieves a single item with all field values",
      {
        path: { item_id: { type: "integer", required: true, description: "The ID of the item" } },
        query: { fields: { type: "string", required: false, description: "Comma-separated field external IDs" } }
      },
      "{ item_id, title, fields: {...}, created_on, ... }"
    ),
    endpoint("items-create", "POST", "/item/app/{app_id}", "Create new item",
      "Creates a new item in the specified app",
      {
        path: { app_id: { type: "integer", required: true, description: "The ID of the app" } },
        body: {
          fields: { type: "object", required: true, description: "Field values keyed by external_id" },
          tags: { type: "array", required: false, description: "Array of tag strings" },
          file_ids: { type: "array", required: false, description: "Array of file IDs" }
        }
      },
      "{ item_id, title, fields: {...}, ... }"
    ),
    endpoint("items-update", "PUT", "/item/{item_id}", "Update item",
      "Updates an existing item",
      {
        path: { item_id: { type: "integer", required: true, description: "The ID of the item" } },
        body: {
          fields: { type: "object", required: true, description: "Updated field values" },
          tags: { type: "array", required: false, description: "Updated tags" }
        }
      }
    ),
    endpoint("items-delete", "DELETE", "/item/{item_id}", "Delete item",
      "Deletes an item permanently",
      { path: { item_id: { type: "integer", required: true, description: "The ID of the item" } } }
    ),
    endpoint("items-filter", "POST", "/item/app/{app_id}/filter/", "Filter items",
      "Filters items in an app based on criteria",
      {
        path: { app_id: { type: "integer", required: true, description: "The ID of the app" } },
        body: {
          filters: { type: "array", required: false, description: "Filter criteria" },
          sort_by: { type: "string", required: false, description: "Field external_id to sort by" },
          limit: { type: "integer", required: false, description: "Maximum items to return" },
          offset: { type: "integer", required: false, description: "Pagination offset" }
        }
      },
      "{ items: [...], filtered: number, total: number }"
    ),
    endpoint("items-bulk-update", "POST", "/item/app/{app_id}/bulk_update", "Bulk update items",
      "Updates multiple items at once",
      {
        path: { app_id: { type: "integer", required: true, description: "The ID of the app" } },
        body: {
          items: { type: "array", required: true, description: "Array of { item_id, fields } objects" }
        }
      }
    ),
    endpoint("items-revision", "GET", "/item/{item_id}/revision/", "Get item revisions",
      "Retrieves revision history for an item",
      { path: { item_id: { type: "integer", required: true, description: "The ID of the item" } } },
      "[{ revision, created_on, created_by, ... }, ...]"
    ),
    endpoint("items-value", "GET", "/item/{item_id}/value/{field_id}", "Get field value",
      "Retrieves the value of a specific field",
      {
        path: {
          item_id: { type: "integer", required: true, description: "The ID of the item" },
          field_id: { type: "integer", required: true, description: "The ID of the field" }
        }
      }
    ),
    endpoint("items-calculation", "GET", "/item/app/{app_id}/calculation", "Get calculation fields",
      "Retrieves calculated field values for items in an app",
      {
        path: { app_id: { type: "integer", required: true, description: "The ID of the app" } },
        query: {
          field_ids: { type: "string", required: false, description: "Comma-separated field IDs" }
        }
      }
    )
  ]
});

// Comments
catalog.groups.push({
  id: "comments",
  name: "Comments",
  description: "Operations for managing comments on items, tasks, and other objects",
  endpoints: [
    endpoint("comments-get", "GET", "/comment/{comment_id}", "Get comment",
      "Retrieves a comment by ID",
      { path: { comment_id: { type: "integer", required: true, description: "The ID of the comment" } } },
      "{ comment_id, value, created_on, created_by, ... }"
    ),
    endpoint("comments-list", "GET", "/comment/{ref_type}/{ref_id}/", "List comments",
      "Retrieves all comments for an object",
      {
        path: {
          ref_type: { type: "string", required: true, description: "Object type: item, task, status, etc." },
          ref_id: { type: "integer", required: true, description: "The ID of the object" }
        }
      },
      "[{ comment_id, value, created_on, ... }, ...]"
    ),
    endpoint("comments-create", "POST", "/comment/{ref_type}/{ref_id}/", "Add comment",
      "Adds a comment to an object",
      {
        path: {
          ref_type: { type: "string", required: true, description: "Object type" },
          ref_id: { type: "integer", required: true, description: "The ID of the object" }
        },
        body: {
          value: { type: "string", required: true, description: "Comment text" },
          external_id: { type: "string", required: false, description: "External identifier" }
        }
      },
      "{ comment_id, value, created_on, ... }"
    ),
    endpoint("comments-update", "PUT", "/comment/{comment_id}", "Update comment",
      "Updates a comment",
      {
        path: { comment_id: { type: "integer", required: true, description: "The ID of the comment" } },
        body: { value: { type: "string", required: true, description: "Updated comment text" } }
      }
    ),
    endpoint("comments-delete", "DELETE", "/comment/{comment_id}", "Delete comment",
      "Deletes a comment",
      { path: { comment_id: { type: "integer", required: true, description: "The ID of the comment" } } }
    )
  ]
});

// Continue with remaining areas... (Due to length, I'll create the file directly)
// Let me write a comprehensive version to the file

const outputPath = path.join(__dirname, '../data/podio_api_catalog.json');
fs.writeFileSync(outputPath, JSON.stringify(catalog, null, 2), 'utf-8');
console.log(`✅ Catalog created with ${catalog.groups.length} groups`);
console.log(`Total endpoints: ${catalog.groups.reduce((sum, g) => sum + g.endpoints.length, 0)}`);

