# Verification Strategy & Testing Checkpoints

This document outlines all verification checkpoints throughout the development process to ensure the MCP server works correctly at each stage.

## First Testable Checkpoint: Task 3 - Ping Tool

**Task 3 (Implement Ping Tool) is the FIRST milestone where we can test the MCP server connection with Cursor.**

After completing Task 3, you should be able to:
1. Configure the MCP server in Cursor
2. Verify connection status
3. Test the ping tool
4. Confirm the server is working

## Verification Checkpoints by Sprint

### Sprint 0: Project Setup

#### ✅ Checkpoint 1: Task 3 - Ping Tool (FIRST TESTABLE CHECKPOINT)

**When to Test:** After completing Task 3

**Verification Checklist:**
- [ ] MCP server added to Cursor settings (stdio transport)
- [ ] Server shows "Connected" status in Cursor MCP panel
- [ ] Ping tool callable from Cursor chat
- [ ] Response returns exactly "pong"
- [ ] No errors in server console logs
- [ ] Stdio communication working correctly
- [ ] Server restart and auto-reconnect works
- [ ] All connection issues documented

**How to Test:**
1. Configure MCP server in Cursor:
   ```json
   {
     "mcpServers": {
       "podio-mcp": {
         "command": "node",
         "args": ["dist/index.js"],
         "env": {}
       }
     }
   }
   ```
2. Open Cursor MCP panel and verify "Connected" status
3. In Cursor chat, type: "Call the ping tool from the MCP server"
4. Verify response is "pong"
5. Check server logs for any errors

**Success Criteria:**
- ✅ Ping tool returns "pong"
- ✅ Server remains connected
- ✅ No errors in logs

---

### Sprint 1: API Catalog Tools

#### ✅ Checkpoint 2: Task 5 - listApiGroups Tool

**Verification Checklist:**
- [ ] Call listApiGroups from Cursor
- [ ] Returns non-empty array
- [ ] Array contains expected groups (items, apps, users, tasks, etc.)
- [ ] Handles missing catalog file gracefully
- [ ] MCP response format is correct
- [ ] Error messages are user-friendly

**Test Command:** "Call listApiGroups from the MCP server"

#### ✅ Checkpoint 3: Task 6 - listApisByGroup Tool

**Verification Checklist:**
- [ ] Call with valid group (e.g., "items")
- [ ] Returns array of endpoints
- [ ] Handles invalid group name gracefully
- [ ] Returns empty array for non-existent groups
- [ ] Response format matches MCP spec
- [ ] Error handling works correctly

**Test Command:** "Call listApisByGroup with group 'items'"

#### ✅ Checkpoint 4: Task 7 - getApiDetails Tool

**Verification Checklist:**
- [ ] Call with valid API id
- [ ] Returns all required fields (method, path, params, rate limits, summary)
- [ ] Handles invalid API id with clear error message
- [ ] Response structure is correct
- [ ] All metadata is present

**Test Command:** "Call getApiDetails for API id 'get_app'"

#### ✅ Checkpoint 5: Task 8 - searchApis Tool

**Verification Checklist:**
- [ ] Search with keyword that exists
- [ ] Case-insensitive search works
- [ ] Returns empty array for non-existent keywords
- [ ] Searches across id, path, and summary fields
- [ ] Handles special characters correctly
- [ ] Response format is correct

**Test Command:** "Call searchApis with keyword 'webhook'"

---

### Sprint 2: Podio Authentication

#### ✅ Checkpoint 6: Task 9 - Podio Authentication

**Verification Checklist:**
- [ ] Test with valid credentials (get access token)
- [ ] Token format is correct
- [ ] Invalid app_id/app_token returns clear error
- [ ] Missing env variables handled gracefully
- [ ] Network error handling works
- [ ] No sensitive data in error messages
- [ ] Token caching works correctly

**Test Command:** "Test Podio authentication with valid credentials"

**Note:** Requires PODIO_CLIENT_ID and PODIO_CLIENT_SECRET environment variables

---

### Sprint 3: App Fetching + TS Config Generation

#### ✅ Checkpoint 7: Task 12 - App Fetching

**Verification Checklist:**
- [ ] Fetch app with valid app_id and token
- [ ] Response parsing is correct
- [ ] Invalid app_id returns 404 error
- [ ] No permissions returns 403 error
- [ ] App definition structure is correct
- [ ] All fields present in response

**Test Command:** "Fetch Podio app with app_id 12345"

#### ✅ Checkpoint 8: Task 15 - generatePodioFieldConfig Tool (MAJOR CHECKPOINT)

**Verification Checklist:**
- [ ] Call tool with valid appId/appToken
- [ ] TypeScript file is generated
- [ ] File location is correct
- [ ] File compiles without errors
- [ ] Constant name format is correct
- [ ] All fields are included
- [ ] Invalid credentials fail gracefully
- [ ] Invalid app_id handled correctly
- [ ] No tokens in response
- [ ] Optional outputPath works
- [ ] Response includes file path, field count, constant name

**Test Command:** "Call generatePodioFieldConfig with appId 12345 and appToken 'abc123'"

**Success Criteria:**
- ✅ TypeScript file generated and compiles
- ✅ All field metadata included
- ✅ No sensitive data exposed

---

### Sprint 4: Error Handling & Developer Experience

#### ✅ Checkpoint 9: Task 16 - Error Handling

**Verification Checklist:**
- [ ] All tools handle invalid inputs gracefully
- [ ] Error messages are human-readable
- [ ] Server doesn't crash on errors
- [ ] Error context is preserved
- [ ] Error categorization works
- [ ] Error logging functions correctly

**Test:** Test each tool with various invalid inputs

#### ✅ Checkpoint 10: Task 18 - Rate Limit Protection

**Verification Checklist:**
- [ ] Rate limit headers parsed correctly
- [ ] Exponential backoff triggers
- [ ] Rate limit warnings appear
- [ ] Request queuing works
- [ ] Error messages clear when rate limited
- [ ] Unnecessary calls prevented

**Test:** Make multiple rapid API calls to trigger rate limiting

---

### Sprint 5: Integration & Polish

#### ✅ Checkpoint 11: Task 23 - Final Verification (COMPREHENSIVE)

**Verification Checklist:**
- [ ] All tools tested with valid inputs
- [ ] All tools tested with invalid inputs
- [ ] All Cursor checkpoints pass
- [ ] Integration tests pass
- [ ] Error handling verified across all tools
- [ ] Documentation is complete
- [ ] Examples work correctly
- [ ] Server stability under load
- [ ] No memory leaks
- [ ] All acceptance criteria met

**Test:** Run full test suite and verify all PRD checkpoints

---

## Testing Workflow

### For Each Checkpoint:

1. **Complete the Task**: Finish all subtasks for the task
2. **Run Verification Checklist**: Go through all checklist items
3. **Document Results**: Record what works and what doesn't
4. **Fix Issues**: Address any failures before proceeding
5. **Mark Complete**: Update task status when all checks pass

### Continuous Testing:

- Test after each major task completion
- Test error scenarios for each tool
- Test edge cases and boundary conditions
- Test server stability and performance
- Test Cursor integration at each checkpoint

## Cursor Integration Testing

### Setup Instructions:

1. **Configure MCP Server in Cursor:**
   - Open Cursor Settings
   - Navigate to MCP Servers
   - Add server configuration
   - Set command and arguments
   - Configure environment variables

2. **Verify Connection:**
   - Check MCP panel shows "Connected"
   - Test ping tool first
   - Verify no connection errors

3. **Test Tools:**
   - Use Cursor chat to call tools
   - Verify responses are correct
   - Check for any errors

## Documentation Requirements

For each checkpoint, document:
- ✅ What was tested
- ✅ Results (pass/fail)
- ✅ Any issues encountered
- ✅ How issues were resolved
- ✅ Screenshots/logs if needed

## Success Criteria Summary

The project is complete when:
- ✅ All 11 checkpoints pass
- ✅ All Cursor checkpoints from PRD pass
- ✅ All tools work correctly
- ✅ Error handling is comprehensive
- ✅ Documentation is complete
- ✅ Examples work
- ✅ Server is stable and performant

---

## Quick Reference: First Test

**Task 3 is your first testable checkpoint!**

After completing Tasks 1 and 2, you can test Task 3:
1. Configure MCP server in Cursor
2. Verify connection
3. Test ping tool
4. Confirm everything works

This validates your MCP server setup before building more complex features.

