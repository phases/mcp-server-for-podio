# **PRD – Podio MCP Server for Automated Integrations**

**Version:** 1.0
**Owner:** @devteam2

---

## **1. Overview**

This project delivers a **Model Context Protocol (MCP) server** written in **Node + TypeScript** to streamline Podio integration development.
The server:

- Exposes tools to inspect Podio APIs
- Authenticates with Podio using _app_id + app_token + client credentials_
- Fetches Podio App metadata (fields, types, labels)
- Generates **type-safe TypeScript configuration files** used in integrations
- Provides automatic **Cursor-driven checkpoints** to verify each development stage
- Integrates directly with **Cursor** as the development assistant and test runner

This MCP server acts as both:

1. **A Podio developer toolkit**
2. **A Cursor-accessible integration interface**
3. **A code generator** for repeatable integration scaffolding

---

## **2. Objectives**

### **Primary Goals**

1. Eliminate manual lookup of Podio field IDs, external IDs, and types.
2. Provide a repeatable and automated way to fetch all Podio App metadata.
3. Ensure development is correct at each stage through **Cursor-operated checkpoints**.
4. Allow Cursor to reason about Podio’s APIs, fields, and rate limits during development.
5. Produce stable TypeScript config files that power integration code.

### **Secondary Goals**

- Provide an API catalog (manual JSON) for reference during integration work.
- Offer a safer developer workflow that prevents rate-limit issues.
- Make the MCP server modular so additional Podio tools can be added later.

---

## **3. Architecture**

### **3.1 Components**

1. **MCP Server (Node + TypeScript)**

   - Uses `@modelcontextprotocol/sdk`
   - Runs via stdio for Cursor compatibility
   - Loads API catalog from `podio_api_catalog.json`
   - Executes Podio HTTP requests using authenticated `access_token`

2. **Podio Authentication Layer**

   - Gets app-level token using:

     ```
     /oauth/token/v2
     grant_type: app
     app_id + app_token + PODIO_CLIENT_ID + PODIO_CLIENT_SECRET
     ```

   - Stores credentials only in environment variables

3. **Podio App Fetching Layer**

   - Uses `/app/{app_id}`
   - Parses fields to produce a structured map

4. **TypeScript Code Generator**

   - Emits files like:

     ```
     src/config/podio/app.<appId>.fields.ts
     ```

   - Exports fully typed dictionaries of field metadata

5. **Cursor Integration Layer**

   - Tools called directly from Cursor’s MCP interface
   - Cursor is responsible for checkpoint execution, tool testing, and development guidance

---

## **4. Features & Requirements**

### **4.1 Core MCP Tools**

#### **4.1.1 ping**

Basic health check used by Cursor at all stages.

#### **4.1.2 listApiGroups**

Returns groups like `items`, `apps`, `users`, `tasks`, etc.

#### **4.1.3 listApisByGroup(group: string)**

Returns all operations in the chosen group from `podio_api_catalog.json`.

#### **4.1.4 getApiDetails(id: string)**

Returns endpoint specs: method, path, params, rate limits.

#### **4.1.5 searchApis(keyword: string)**

Keyword search over id/path/summary fields.

---

### **4.2 Live Podio Tools**

#### **4.2.1 generatePodioFieldConfig**

**Inputs:**

- `appId: number`
- `appToken: string`
- `outputPath?: string`

**Behavior:**

1. Performs authentication
2. Fetches app definition
3. Extracts all fields
4. Generates a TS file with:

   - `fieldId`
   - `externalId`
   - `type`
   - `label`

**Outputs:**

- Path to generated file
- Number of fields
- Exported constant name

**Acceptance criteria:**

- Must never output sensitive tokens
- Must fail gracefully with human-readable error messages
- Must create directories recursively

---

## **5. Development Workflow (Cursor-Driven)**

Cursor acts as the **validation agent**.
At each checkpoint, Cursor must execute a tool call and confirm expected output.

---

## **6. Sprint Plan & Checkpoints**

### **Sprint 0 – Project Setup**

**Deliverables**

- Node + TS project
- Basic MCP server
- `ping` tool

**Cursor Checkpoints**

1. Run:

   > “Call `ping` from the MCP server.”
   > Must return `"pong"`.

2. Cursor must show the MCP server as **Connected** in its MCP settings.

---

### **Sprint 1 – API Catalog Tools**

**Deliverables**

- `podio_api_catalog.json`
- Tools:

  - `listApiGroups`
  - `listApisByGroup`
  - `getApiDetails`
  - `searchApis`

**Cursor Checkpoints**

1.

> “Call `listApiGroups`.”
> Must return non-empty list.

2. > “Call `listApisByGroup` with `items`.”
   > Must return item endpoints.

3. > “Call `getApiDetails` for `get_app`.”
   > Must show method, path, params.

4. > “Call `searchApis` with `webhook`.”
   > Must return correct endpoints.

---

### **Sprint 2 – Podio Authentication**

**Deliverables**

- `getPodioAccessToken(appId, appToken)` implemented
- Handles success + all expected error cases

**Cursor Checkpoints**

1.

> “Test Podio authentication with valid credentials.”
> Must receive an access token.

2. > “Test Podio authentication with invalid token.”
   > Must return readable error (no crash).

3. > “Verify that the MCP server remains operational by calling `ping` again.”
   > Must return `"pong"`.

---

### **Sprint 3 – App Fetching + TS Config Generation**

**Deliverables**

- `generatePodioFieldConfig` tool
- TS file generator

**Cursor Checkpoints**

1.

> “Call `generatePodioFieldConfig` with invalid credentials.”
> Should return error and not create file.

2. > “Call `generatePodioFieldConfig` with valid app id/token.”
   > Should generate TS config file.

3. > “Open the generated file and validate that fields exist.”
   > Cursor should inspect file and confirm:

   ```ts
   export const podio<Something>Fields = {
     field1: { fieldId: ..., externalId: ..., type: ..., label: ... },
     ...
   }
   ```

4. > “Run TypeScript type check using the generated file.”
   > Must pass.

---

### **Sprint 4 – Error Handling & Developer Experience**

**Deliverables**

- Graceful error handling logic
- Clear and helpful MCP messages
- Validation for missing env variables
- Protection against rate limit misunderstandings

**Cursor Checkpoints**

1.

> “Simulate missing env variables and call `generatePodioFieldConfig`.”
> Should return:
> `"PODIO_CLIENT_ID and PODIO_CLIENT_SECRET must be set..."`

2. > “Simulate app with no fields.”
   > Should still generate a valid TS file with zero fields.

3. > “Run all MCP tools in sequence.”
   > All should work without interruption.

---

### **Sprint 5 – Integration into Podio Development Workflow**

**Deliverables**

- Ability to regenerate configs anytime
- Stable API catalog
- Cursor-friendly prompts

**Cursor Checkpoints**

1.

> “Generate field config for app A.”
> Should succeed.

2. > “Generate field config for app B.”
   > Should succeed independently.

3. > “Use both configs to produce typed payloads.”
   > Cursor should use config metadata to assist with integration code.

---

## **7. Non-Functional Requirements**

- **Security**

  - Never print Podio tokens or secrets
  - Never store tokens on disk

- **Stability**

  - Tools must fail safely without crashing server
  - MCP server must continue responding after any failure

- **Compatibility**

  - Node 18+
  - Cursor MCP stdio transport
  - VS Code MCP (optional secondary environment)

- **Performance**

  - Field config generation must complete < 2 seconds for typical Podio apps

---

## **8. Future Features (Not in v1.0)**

### **1. generatePodioItemTypes**

Generate TS types for item creation payloads.

### **2. validatePayloadAgainstFields**

Validate integration payloads automatically.

### **3. syncPodioAppFields**

Track changes in Podio to regenerate config files on demand.

### **4. generatePodioWebhookHandlers**

Auto-generate webhook handler templates with field typing.

### **5. Podio → local database schema generator**

Create tables/collections from Podio field structure.

---

## **9. Acceptance Criteria Summary**

### **v1.0 is complete when:**

- MCP server loads
- `ping` works
- API catalog tools work
- Podio authentication works
- App fields can be fetched
- Config file generation works
- Cursor can execute all checkpoints successfully
- Error handling behaves predictably
