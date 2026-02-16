#!/usr/bin/env python3
"""
Build comprehensive Podio API catalog
Based on https://developers.podio.com/doc
Includes all API areas with endpoints, parameters, and response formats
"""

import json
from datetime import datetime

def endpoint(id, method, path, summary, description, params=None, rate_limit=None, response_format="JSON object"):
    """Create an endpoint definition"""
    if params is None:
        params = {"path": {}, "query": {}, "body": {}}
    return {
        "id": id,
        "method": method,
        "path": path,
        "summary": summary,
        "description": description,
        "params": {
            "path": params.get("path", {}),
            "query": params.get("query", {}),
            "body": params.get("body", {})
        },
        "rateLimit": rate_limit or {"limit": 2500, "window": "hour"},
        "responseFormat": response_format
    }

def param(type_str, required, description):
    """Create a parameter definition"""
    return {"type": type_str, "required": required, "description": description}

# Initialize catalog
catalog = {
    "version": "1.0.0",
    "lastUpdated": datetime.now().strftime("%Y-%m-%d"),
    "baseUrl": "https://api.podio.com",
    "documentation": "https://developers.podio.com/doc",
    "rateLimit": {
        "default": {"limit": 2500, "window": "hour"},
        "auth": {"limit": 100, "window": "hour"},
        "search": {"limit": 1000, "window": "hour"}
    },
    "groups": []
}

# ========== CORE AREAS ==========

# Applications
catalog["groups"].append({
    "id": "applications",
    "name": "Applications",
    "description": "Operations for managing application definitions",
    "endpoints": [
        endpoint("apps-get", "GET", "/app/{app_id}", "Get app definition",
            "Retrieves the definition of an app including all fields, configuration, and metadata",
            {"path": {"app_id": param("integer", True, "The ID of the app")}},
            response_format="{ app_id, name, status, fields: [...], config: {...} }"
        ),
        endpoint("apps-list", "GET", "/app/", "List apps",
            "Lists all apps accessible to the authenticated user",
            {"query": {"space_id": param("integer", False, "Filter by space ID")}},
            response_format="[{ app_id, name, status, ... }, ...]"
        ),
        endpoint("apps-fields", "GET", "/app/{app_id}/field/", "Get app fields",
            "Retrieves all fields for an app with their configurations",
            {"path": {"app_id": param("integer", True, "The ID of the app")}},
            response_format="[{ field_id, external_id, type, label, config: {...} }, ...]"
        ),
        endpoint("apps-create", "POST", "/app/", "Create app",
            "Creates a new app in a space",
            {
                "body": {
                    "space_id": param("integer", True, "Space ID where app will be created"),
                    "name": param("string", True, "App name"),
                    "fields": param("array", True, "Array of field definitions")
                }
            },
            response_format="{ app_id, name, status, ... }"
        ),
        endpoint("apps-update", "PUT", "/app/{app_id}", "Update app",
            "Updates app configuration",
            {
                "path": {"app_id": param("integer", True, "The ID of the app")},
                "body": {"name": param("string", False, "Updated app name")}
            }
        ),
        endpoint("apps-delete", "DELETE", "/app/{app_id}", "Delete app",
            "Deletes an app (requires appropriate permissions)",
            {"path": {"app_id": param("integer", True, "The ID of the app")}}
        ),
        endpoint("apps-install", "POST", "/app/{app_id}/install", "Install app",
            "Installs an app from the app market",
            {
                "path": {"app_id": param("integer", True, "The ID of the app")},
                "body": {"space_id": param("integer", True, "Space ID to install app in")}
            }
        ),
        endpoint("apps-usage", "GET", "/app/{app_id}/usage", "Get app usage",
            "Retrieves usage statistics for an app",
            {"path": {"app_id": param("integer", True, "The ID of the app")}},
            response_format="{ item_count, view_count, ... }"
        )
    ]
})

# Items - Comprehensive
catalog["groups"].append({
    "id": "items",
    "name": "Items",
    "description": "Operations for managing items (records) in Podio apps",
    "endpoints": [
        endpoint("items-get", "GET", "/item/{item_id}", "Get item by ID",
            "Retrieves a single item with all field values",
            {
                "path": {"item_id": param("integer", True, "The ID of the item")},
                "query": {"fields": param("string", False, "Comma-separated field external IDs to include")}
            },
            response_format="{ item_id, title, fields: {...}, created_on, ... }"
        ),
        endpoint("items-create", "POST", "/item/app/{app_id}", "Create new item",
            "Creates a new item in the specified app",
            {
                "path": {"app_id": param("integer", True, "The ID of the app")},
                "body": {
                    "fields": param("object", True, "Field values keyed by external_id"),
                    "tags": param("array", False, "Array of tag strings"),
                    "file_ids": param("array", False, "Array of file IDs to attach"),
                    "external_id": param("string", False, "External identifier for the item")
                }
            },
            response_format="{ item_id, title, fields: {...}, ... }"
        ),
        endpoint("items-update", "PUT", "/item/{item_id}", "Update item",
            "Updates an existing item's field values",
            {
                "path": {"item_id": param("integer", True, "The ID of the item")},
                "body": {
                    "fields": param("object", True, "Updated field values"),
                    "tags": param("array", False, "Updated tags")
                }
            }
        ),
        endpoint("items-delete", "DELETE", "/item/{item_id}", "Delete item",
            "Deletes an item permanently",
            {"path": {"item_id": param("integer", True, "The ID of the item")}}
        ),
        endpoint("items-filter", "POST", "/item/app/{app_id}/filter/", "Filter items",
            "Filters items in an app based on criteria",
            {
                "path": {"app_id": param("integer", True, "The ID of the app")},
                "body": {
                    "filters": param("array", False, "Array of filter objects"),
                    "sort_by": param("string", False, "Field external_id to sort by"),
                    "sort_desc": param("boolean", False, "Sort descending"),
                    "limit": param("integer", False, "Maximum number of items to return (default: 30)"),
                    "offset": param("integer", False, "Offset for pagination")
                }
            },
            response_format="{ items: [...], filtered: number, total: number }"
        ),
        endpoint("items-bulk-update", "POST", "/item/app/{app_id}/bulk_update", "Bulk update items",
            "Updates multiple items at once",
            {
                "path": {"app_id": param("integer", True, "The ID of the app")},
                "body": {
                    "items": param("array", True, "Array of { item_id, fields: {...} } objects")
                }
            }
        ),
        endpoint("items-revision", "GET", "/item/{item_id}/revision/", "Get item revisions",
            "Retrieves revision history for an item",
            {"path": {"item_id": param("integer", True, "The ID of the item")}},
            response_format="[{ revision, created_on, created_by, ... }, ...]"
        ),
        endpoint("items-value", "GET", "/item/{item_id}/value/{field_id}", "Get field value",
            "Retrieves the value of a specific field in an item",
            {
                "path": {
                    "item_id": param("integer", True, "The ID of the item"),
                    "field_id": param("integer", True, "The ID of the field")
                }
            }
        ),
        endpoint("items-calculation", "GET", "/item/app/{app_id}/calculation", "Get calculation fields",
            "Retrieves calculated field values for items in an app",
            {
                "path": {"app_id": param("integer", True, "The ID of the app")},
                "query": {
                    "field_ids": param("string", False, "Comma-separated field IDs")
                }
            }
        ),
        endpoint("items-xlsx", "GET", "/item/app/{app_id}/xlsx/", "Export items to XLSX",
            "Exports items from an app to Excel format",
            {
                "path": {"app_id": param("integer", True, "The ID of the app")},
                "query": {
                    "view_id": param("integer", False, "View ID to use for export")
                }
            },
            response_format="XLSX file download"
        )
    ]
})

# Comments
catalog["groups"].append({
    "id": "comments",
    "name": "Comments",
    "description": "Operations for managing comments on items, tasks, and other objects",
    "endpoints": [
        endpoint("comments-get", "GET", "/comment/{comment_id}", "Get comment",
            "Retrieves a comment by ID",
            {"path": {"comment_id": param("integer", True, "The ID of the comment")}},
            response_format="{ comment_id, value, created_on, created_by, ... }"
        ),
        endpoint("comments-list", "GET", "/comment/{ref_type}/{ref_id}/", "List comments",
            "Retrieves all comments for an object (item, task, status, etc.)",
            {
                "path": {
                    "ref_type": param("string", True, "Object type: item, task, status, etc."),
                    "ref_id": param("integer", True, "The ID of the object")
                }
            },
            response_format="[{ comment_id, value, created_on, ... }, ...]"
        ),
        endpoint("comments-create", "POST", "/comment/{ref_type}/{ref_id}/", "Add comment",
            "Adds a comment to an object",
            {
                "path": {
                    "ref_type": param("string", True, "Object type"),
                    "ref_id": param("integer", True, "The ID of the object")
                },
                "body": {
                    "value": param("string", True, "Comment text"),
                    "external_id": param("string", False, "External identifier")
                }
            },
            response_format="{ comment_id, value, created_on, ... }"
        ),
        endpoint("comments-update", "PUT", "/comment/{comment_id}", "Update comment",
            "Updates a comment",
            {
                "path": {"comment_id": param("integer", True, "The ID of the comment")},
                "body": {"value": param("string", True, "Updated comment text")}
            }
        ),
        endpoint("comments-delete", "DELETE", "/comment/{comment_id}", "Delete comment",
            "Deletes a comment",
            {"path": {"comment_id": param("integer", True, "The ID of the comment")}}
        )
    ]
})

# Files
catalog["groups"].append({
    "id": "files",
    "name": "Files",
    "description": "Operations for managing file uploads and downloads",
    "endpoints": [
        endpoint("files-upload", "POST", "/file/", "Upload file",
            "Uploads a file to Podio",
            {
                "body": {
                    "source": param("string", True, "File source: 'computer', 'url', etc."),
                    "filename": param("string", True, "File name"),
                    "file": param("file", True, "File data (multipart/form-data)")
                }
            },
            response_format="{ file_id, name, mimetype, size, created_on, ... }"
        ),
        endpoint("files-get", "GET", "/file/{file_id}", "Get file",
            "Retrieves file information",
            {"path": {"file_id": param("integer", True, "The ID of the file")}},
            response_format="{ file_id, name, mimetype, size, created_on, ... }"
        ),
        endpoint("files-download", "GET", "/file/{file_id}/download", "Download file",
            "Downloads the file content",
            {"path": {"file_id": param("integer", True, "The ID of the file")}},
            response_format="Binary file content"
        ),
        endpoint("files-delete", "DELETE", "/file/{file_id}", "Delete file",
            "Deletes a file",
            {"path": {"file_id": param("integer", True, "The ID of the file")}}
        ),
        endpoint("files-attach", "POST", "/file/{file_id}/attach", "Attach file",
            "Attaches a file to an object",
            {
                "path": {"file_id": param("integer", True, "The ID of the file")},
                "body": {
                    "ref_type": param("string", True, "Object type: item, task, etc."),
                    "ref_id": param("integer", True, "The ID of the object")
                }
            }
        )
    ]
})

# Tasks - Expanded
catalog["groups"].append({
    "id": "tasks",
    "name": "Tasks",
    "description": "Operations for managing tasks",
    "endpoints": [
        endpoint("tasks-get", "GET", "/task/{task_id}", "Get task",
            "Retrieves a task by ID",
            {"path": {"task_id": param("integer", True, "The ID of the task")}},
            response_format="{ task_id, text, status, due_on, created_on, ... }"
        ),
        endpoint("tasks-list", "GET", "/task/", "List tasks",
            "Lists tasks, optionally filtered",
            {
                "query": {
                    "responsible": param("integer", False, "Filter by responsible user ID"),
                    "space_id": param("integer", False, "Filter by space ID"),
                    "completed": param("boolean", False, "Filter by completion status")
                }
            },
            response_format="[{ task_id, text, status, ... }, ...]"
        ),
        endpoint("tasks-create", "POST", "/task/", "Create task",
            "Creates a new task",
            {
                "body": {
                    "text": param("string", True, "Task description"),
                    "due_on": param("string", False, "Due date (YYYY-MM-DD)"),
                    "responsible": param("integer", False, "User ID of responsible person"),
                    "private": param("boolean", False, "Whether task is private"),
                    "ref_type": param("string", False, "Reference type if task is linked to object"),
                    "ref_id": param("integer", False, "Reference ID if task is linked to object")
                }
            },
            response_format="{ task_id, text, status, ... }"
        ),
        endpoint("tasks-update", "PUT", "/task/{task_id}", "Update task",
            "Updates an existing task",
            {
                "path": {"task_id": param("integer", True, "The ID of the task")},
                "body": {
                    "text": param("string", False, "Updated task description"),
                    "status": param("string", False, "Task status: active, completed"),
                    "due_on": param("string", False, "Updated due date")
                }
            }
        ),
        endpoint("tasks-delete", "DELETE", "/task/{task_id}", "Delete task",
            "Deletes a task",
            {"path": {"task_id": param("integer", True, "The ID of the task")}}
        ),
        endpoint("tasks-assign", "POST", "/task/{task_id}/assign", "Assign task",
            "Assigns a task to a user",
            {
                "path": {"task_id": param("integer", True, "The ID of the task")},
                "body": {"user_id": param("integer", True, "User ID to assign task to")}
            }
        ),
        endpoint("tasks-complete", "POST", "/task/{task_id}/complete", "Complete task",
            "Marks a task as completed",
            {"path": {"task_id": param("integer", True, "The ID of the task")}}
        )
    ]
})

# Contacts
catalog["groups"].append({
    "id": "contacts",
    "name": "Contacts",
    "description": "Operations for managing user contacts and profiles",
    "endpoints": [
        endpoint("contacts-get", "GET", "/contact/{contact_id}", "Get contact",
            "Retrieves contact information",
            {"path": {"contact_id": param("integer", True, "The ID of the contact")}},
            response_format="{ contact_id, name, mail, phone, ... }"
        ),
        endpoint("contacts-list", "GET", "/contact/", "List contacts",
            "Lists contacts, optionally filtered",
            {
                "query": {
                    "space_id": param("integer", False, "Filter by space ID"),
                    "org_id": param("integer", False, "Filter by organization ID")
                }
            },
            response_format="[{ contact_id, name, mail, ... }, ...]"
        ),
        endpoint("contacts-search", "GET", "/contact/search/", "Search contacts",
            "Searches for contacts",
            {
                "query": {
                    "query": param("string", True, "Search query"),
                    "limit": param("integer", False, "Maximum results to return")
                }
            }
        )
    ]
})

# Hooks (Webhooks)
catalog["groups"].append({
    "id": "hooks",
    "name": "Hooks",
    "description": "Operations for managing webhooks",
    "endpoints": [
        endpoint("hooks-list", "GET", "/hook/{ref_type}/{ref_id}/", "List hooks",
            "Retrieves all webhooks for an object",
            {
                "path": {
                    "ref_type": param("string", True, "Object type: app, item, etc."),
                    "ref_id": param("integer", True, "The ID of the object")
                }
            },
            response_format="[{ hook_id, url, type, ... }, ...]"
        ),
        endpoint("hooks-create", "POST", "/hook/{ref_type}/{ref_id}/", "Create hook",
            "Creates a webhook for an object",
            {
                "path": {
                    "ref_type": param("string", True, "Object type"),
                    "ref_id": param("integer", True, "The ID of the object")
                },
                "body": {
                    "url": param("string", True, "Webhook URL"),
                    "type": param("string", True, "Event type: item.create, item.update, etc.")
                }
            },
            response_format="{ hook_id, url, type, ... }"
        ),
        endpoint("hooks-delete", "DELETE", "/hook/{hook_id}", "Delete hook",
            "Deletes a webhook",
            {"path": {"hook_id": param("integer", True, "The ID of the hook")}}
        ),
        endpoint("hooks-verify", "POST", "/hook/{hook_id}/verify/verify", "Verify hook",
            "Verifies a webhook",
            {"path": {"hook_id": param("integer", True, "The ID of the hook")}}
        )
    ]
})

# Status
catalog["groups"].append({
    "id": "status",
    "name": "Status",
    "description": "Operations for managing status messages",
    "endpoints": [
        endpoint("status-get", "GET", "/status/{status_id}", "Get status",
            "Retrieves a status message",
            {"path": {"status_id": param("integer", True, "The ID of the status")}},
            response_format="{ status_id, value, created_on, created_by, ... }"
        ),
        endpoint("status-create", "POST", "/status/space/{space_id}/", "Create status",
            "Creates a status message in a space",
            {
                "path": {"space_id": param("integer", True, "The ID of the space")},
                "body": {
                    "value": param("string", True, "Status message text"),
                    "file_ids": param("array", False, "Array of file IDs to attach")
                }
            },
            response_format="{ status_id, value, created_on, ... }"
        ),
        endpoint("status-delete", "DELETE", "/status/{status_id}", "Delete status",
            "Deletes a status message",
            {"path": {"status_id": param("integer", True, "The ID of the status")}}
        )
    ]
})

# Spaces - Expanded
catalog["groups"].append({
    "id": "spaces",
    "name": "Spaces",
    "description": "Operations for managing spaces (workspaces)",
    "endpoints": [
        endpoint("spaces-get", "GET", "/space/{space_id}", "Get space",
            "Retrieves a space by ID",
            {"path": {"space_id": param("integer", True, "The ID of the space")}},
            response_format="{ space_id, name, url, ... }"
        ),
        endpoint("spaces-list", "GET", "/space/", "List spaces",
            "Lists all spaces accessible to the authenticated user",
            {
                "query": {
                    "org_id": param("integer", False, "Filter by organization ID")
                }
            },
            response_format="[{ space_id, name, url, ... }, ...]"
        ),
        endpoint("spaces-create", "POST", "/space/", "Create space",
            "Creates a new space",
            {
                "body": {
                    "name": param("string", True, "Space name"),
                    "org_id": param("integer", True, "Organization ID"),
                    "privacy": param("string", True, "Privacy: open, closed")
                }
            },
            response_format="{ space_id, name, url, ... }"
        ),
        endpoint("spaces-apps", "GET", "/space/{space_id}/app/", "List apps in space",
            "Lists all apps in a space",
            {"path": {"space_id": param("integer", True, "The ID of the space")}},
            response_format="[{ app_id, name, ... }, ...]"
        ),
        endpoint("spaces-members", "GET", "/space/{space_id}/member/", "List space members",
            "Lists all members of a space",
            {"path": {"space_id": param("integer", True, "The ID of the space")}},
            response_format="[{ user_id, role, ... }, ...]"
        )
    ]
})

# Users - Expanded
catalog["groups"].append({
    "id": "users",
    "name": "Users",
    "description": "Operations for managing users",
    "endpoints": [
        endpoint("users-get", "GET", "/user/{user_id}", "Get user",
            "Retrieves user information",
            {"path": {"user_id": param("integer", True, "The ID of the user")}},
            response_format="{ user_id, name, mail, ... }"
        ),
        endpoint("users-me", "GET", "/user/me", "Get current user",
            "Retrieves information about the authenticated user",
            {},
            response_format="{ user_id, name, mail, ... }"
        ),
        endpoint("users-status", "GET", "/user/status", "Get user status",
            "Retrieves the status of the authenticated user",
            {},
            response_format="{ user_id, status, ... }"
        ),
        endpoint("users-profile", "GET", "/user/profile", "Get user profile",
            "Retrieves the profile of the authenticated user",
            {},
            response_format="{ user_id, name, profile: {...}, ... }"
        )
    ]
})

# Organizations - Expanded
catalog["groups"].append({
    "id": "organizations",
    "name": "Organizations",
    "description": "Operations for managing organizations",
    "endpoints": [
        endpoint("orgs-get", "GET", "/org/{org_id}", "Get organization",
            "Retrieves an organization by ID",
            {"path": {"org_id": param("integer", True, "The ID of the organization")}},
            response_format="{ org_id, name, url, ... }"
        ),
        endpoint("orgs-list", "GET", "/org/", "List organizations",
            "Lists all organizations accessible to the authenticated user",
            {},
            response_format="[{ org_id, name, url, ... }, ...]"
        ),
        endpoint("orgs-members", "GET", "/org/{org_id}/member/", "List org members",
            "Lists all members of an organization",
            {"path": {"org_id": param("integer", True, "The ID of the organization")}},
            response_format="[{ user_id, role, ... }, ...]"
        )
    ]
})

# Search
catalog["groups"].append({
    "id": "search",
    "name": "Search",
    "description": "Operations for searching across Podio",
    "endpoints": [
        endpoint("search-query", "GET", "/search/", "Search",
            "Searches across Podio for items, tasks, statuses, etc.",
            {
                "query": {
                    "query": param("string", True, "Search query"),
                    "ref_type": param("string", False, "Filter by object type"),
                    "limit": param("integer", False, "Maximum results to return")
                }
            },
            rate_limit={"limit": 1000, "window": "hour"},
            response_format="{ results: [...], total: number }"
        ),
        endpoint("search-app", "GET", "/search/app/{app_id}/", "Search in app",
            "Searches for items within a specific app",
            {
                "path": {"app_id": param("integer", True, "The ID of the app")},
                "query": {
                    "query": param("string", True, "Search query"),
                    "limit": param("integer", False, "Maximum results to return")
                }
            },
            rate_limit={"limit": 1000, "window": "hour"}
        )
    ]
})

# Authentication
catalog["groups"].append({
    "id": "authentication",
    "name": "Authentication",
    "description": "Authentication and authorization endpoints",
    "endpoints": [
        endpoint("auth-token", "POST", "/oauth/token/v2", "Get access token",
            "Authenticates and retrieves an access token",
            {
                "body": {
                    "grant_type": param("string", True, "Grant type: 'app' or 'password'"),
                    "app_id": param("integer", False, "App ID (required for app grant)"),
                    "app_token": param("string", False, "App token (required for app grant)"),
                    "username": param("string", False, "Username (required for password grant)"),
                    "password": param("string", False, "Password (required for password grant)")
                }
            },
            rate_limit={"limit": 100, "window": "hour"},
            response_format="{ access_token, expires_in, ... }"
        ),
        endpoint("auth-revoke", "POST", "/oauth/token/revoke", "Revoke token",
            "Revokes an access token",
            {
                "body": {
                    "token": param("string", True, "Access token to revoke")
                }
            }
        )
    ]
})

# Additional API Areas

# Notifications
catalog["groups"].append({
    "id": "notifications",
    "name": "Notifications",
    "description": "Operations for managing notifications",
    "endpoints": [
        endpoint("notifications-list", "GET", "/notification/", "List notifications",
            "Retrieves notifications for the authenticated user",
            {
                "query": {
                    "viewed": param("boolean", False, "Filter by viewed status"),
                    "starred": param("boolean", False, "Filter by starred status")
                }
            },
            response_format="[{ notification_id, text, created_on, ... }, ...]"
        ),
        endpoint("notifications-mark-viewed", "POST", "/notification/{notification_id}/viewed", "Mark as viewed",
            "Marks a notification as viewed",
            {"path": {"notification_id": param("integer", True, "The ID of the notification")}}
        ),
        endpoint("notifications-mark-all-viewed", "POST", "/notification/viewed", "Mark all as viewed",
            "Marks all notifications as viewed",
            {}
        )
    ]
})

# Tags
catalog["groups"].append({
    "id": "tags",
    "name": "Tags",
    "description": "Operations for managing tags",
    "endpoints": [
        endpoint("tags-list", "GET", "/tag/{ref_type}/{ref_id}/", "List tags",
            "Retrieves tags for an object",
            {
                "path": {
                    "ref_type": param("string", True, "Object type: item, task, etc."),
                    "ref_id": param("integer", True, "The ID of the object")
                }
            },
            response_format="[{ text, ... }, ...]"
        ),
        endpoint("tags-create", "POST", "/tag/{ref_type}/{ref_id}/", "Add tags",
            "Adds tags to an object",
            {
                "path": {
                    "ref_type": param("string", True, "Object type"),
                    "ref_id": param("integer", True, "The ID of the object")
                },
                "body": {
                    "text": param("array", True, "Array of tag strings")
                }
            }
        ),
        endpoint("tags-delete", "DELETE", "/tag/{ref_type}/{ref_id}/", "Remove tags",
            "Removes tags from an object",
            {
                "path": {
                    "ref_type": param("string", True, "Object type"),
                    "ref_id": param("integer", True, "The ID of the object")
                },
                "body": {
                    "text": param("array", True, "Array of tag strings to remove")
                }
            }
        )
    ]
})

# Views
catalog["groups"].append({
    "id": "views",
    "name": "Views",
    "description": "Operations for managing app views",
    "endpoints": [
        endpoint("views-list", "GET", "/view/app/{app_id}/", "List views",
            "Retrieves all views for an app",
            {"path": {"app_id": param("integer", True, "The ID of the app")}},
            response_format="[{ view_id, name, type, ... }, ...]"
        ),
        endpoint("views-get", "GET", "/view/{view_id}", "Get view",
            "Retrieves a view definition",
            {"path": {"view_id": param("integer", True, "The ID of the view")}},
            response_format="{ view_id, name, type, filters: {...}, ... }"
        ),
        endpoint("views-create", "POST", "/view/app/{app_id}/", "Create view",
            "Creates a new view for an app",
            {
                "path": {"app_id": param("integer", True, "The ID of the app")},
                "body": {
                    "name": param("string", True, "View name"),
                    "type": param("string", True, "View type: table, calendar, etc."),
                    "filters": param("object", False, "View filters")
                }
            }
        )
    ]
})

# Subscriptions
catalog["groups"].append({
    "id": "subscriptions",
    "name": "Subscriptions",
    "description": "Operations for managing subscriptions to objects",
    "endpoints": [
        endpoint("subscriptions-list", "GET", "/subscription/{ref_type}/{ref_id}/", "List subscriptions",
            "Retrieves subscriptions for an object",
            {
                "path": {
                    "ref_type": param("string", True, "Object type"),
                    "ref_id": param("integer", True, "The ID of the object")
                }
            },
            response_format="[{ subscription_id, user_id, ... }, ...]"
        ),
        endpoint("subscriptions-create", "POST", "/subscription/{ref_type}/{ref_id}/", "Subscribe",
            "Subscribes to an object",
            {
                "path": {
                    "ref_type": param("string", True, "Object type"),
                    "ref_id": param("integer", True, "The ID of the object")
                }
            }
        ),
        endpoint("subscriptions-delete", "DELETE", "/subscription/{ref_type}/{ref_id}/", "Unsubscribe",
            "Unsubscribes from an object",
            {
                "path": {
                    "ref_type": param("string", True, "Object type"),
                    "ref_id": param("integer", True, "The ID of the object")
                }
            }
        )
    ]
})

# Stream
catalog["groups"].append({
    "id": "stream",
    "name": "Stream",
    "description": "Operations for accessing activity streams",
    "endpoints": [
        endpoint("stream-global", "GET", "/stream/", "Get global stream",
            "Retrieves the global activity stream",
            {
                "query": {
                    "limit": param("integer", False, "Maximum items to return"),
                    "offset": param("integer", False, "Pagination offset")
                }
            },
            response_format="[{ activity_id, type, created_on, ... }, ...]"
        ),
        endpoint("stream-space", "GET", "/stream/space/{space_id}/", "Get space stream",
            "Retrieves the activity stream for a space",
            {
                "path": {"space_id": param("integer", True, "The ID of the space")},
                "query": {
                    "limit": param("integer", False, "Maximum items to return")
                }
            }
        ),
        endpoint("stream-app", "GET", "/stream/app/{app_id}/", "Get app stream",
            "Retrieves the activity stream for an app",
            {
                "path": {"app_id": param("integer", True, "The ID of the app")},
                "query": {
                    "limit": param("integer", False, "Maximum items to return")
                }
            }
        )
    ]
})

# Forms
catalog["groups"].append({
    "id": "forms",
    "name": "Forms",
    "description": "Operations for managing forms",
    "endpoints": [
        endpoint("forms-get", "GET", "/form/{form_id}", "Get form",
            "Retrieves a form definition",
            {"path": {"form_id": param("integer", True, "The ID of the form")}},
            response_format="{ form_id, name, fields: [...], ... }"
        ),
        endpoint("forms-list", "GET", "/form/app/{app_id}/", "List forms",
            "Retrieves all forms for an app",
            {"path": {"app_id": param("integer", True, "The ID of the app")}},
            response_format="[{ form_id, name, ... }, ...]"
        ),
        endpoint("forms-submit", "POST", "/form/{form_id}/submit", "Submit form",
            "Submits data to a form",
            {
                "path": {"form_id": param("integer", True, "The ID of the form")},
                "body": {
                    "fields": param("object", True, "Field values keyed by external_id")
                }
            },
            response_format="{ item_id, ... }"
        )
    ]
})

# Batch
catalog["groups"].append({
    "id": "batch",
    "name": "Batch",
    "description": "Operations for batch processing",
    "endpoints": [
        endpoint("batch-execute", "POST", "/batch/", "Execute batch",
            "Executes multiple API calls in a single request",
            {
                "body": {
                    "items": param("array", True, "Array of { method, url, body } objects")
                }
            },
            response_format="[{ status, body, ... }, ...]"
        )
    ]
})

# Calendar
catalog["groups"].append({
    "id": "calendar",
    "name": "Calendar",
    "description": "Operations for accessing calendar data",
    "endpoints": [
        endpoint("calendar-get", "GET", "/calendar/", "Get calendar",
            "Retrieves calendar events",
            {
                "query": {
                    "date_from": param("string", False, "Start date (YYYY-MM-DD)"),
                    "date_to": param("string", False, "End date (YYYY-MM-DD)"),
                    "space_id": param("integer", False, "Filter by space ID")
                }
            },
            response_format="[{ event_id, title, start, end, ... }, ...]"
        )
    ]
})

# Continue adding more areas as needed...

print(f"Building comprehensive catalog...")
print(f"Groups created so far: {len(catalog['groups'])}")
print(f"Total endpoints: {sum(len(g['endpoints']) for g in catalog['groups'])}")

# Write to file
output_path = "data/podio_api_catalog.json"
with open(output_path, 'w') as f:
    json.dump(catalog, f, indent=2)

print(f"✅ Catalog written to {output_path}")
print(f"   Version: {catalog['version']}")
print(f"   Last updated: {catalog['lastUpdated']}")

