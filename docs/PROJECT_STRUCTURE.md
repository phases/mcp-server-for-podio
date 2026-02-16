# Project Structure

This document describes the organization of the Podio MCP Server project.

## Directory Structure

```
podio_mcp_server/
├── docs/                                    # All project documentation
│   ├── PRD.md                              # Product Requirements Document
│   ├── PRD_IMPROVEMENTS.md                 # Suggestions for PRD enhancements
│   ├── TASKS_BREAKDOWN.md                  # Detailed task breakdown by sprint
│   ├── PROJECT_SUMMARY.md                  # Project overview and summary
│   └── PROJECT_STRUCTURE.md                # This file
│
├── .taskmaster/                            # TaskMaster configuration and tasks
│   ├── config.json                         # TaskMaster configuration
│   ├── state.json                          # TaskMaster state
│   ├── docs/
│   │   └── prd.txt                         # PRD for TaskMaster parsing
│   └── tasks/
│       ├── tasks.json                      # Main TaskMaster tasks file (for MCP)
│       └── individual/                     # Individual task files for tracking
│           ├── README.md                   # Task files documentation
│           ├── task-1.json                 # Task 1: Initialize Node.js + TypeScript
│           ├── task-2.json                 # Task 2: Create Basic MCP Server
│           ├── ...                         # Tasks 3-23
│           └── task-23.json                # Task 23: Final Testing & Validation
│
└── (project source code will go here)      # Source code directory structure
```

## Documentation Location

All project documentation is located in the `docs/` folder:

- **PRD.md**: Original Product Requirements Document with all specifications
- **PRD_IMPROVEMENTS.md**: Comprehensive suggestions for enhancing the PRD
- **TASKS_BREAKDOWN.md**: Detailed breakdown of all 23 tasks organized by sprint
- **PROJECT_SUMMARY.md**: High-level project overview and sprint summary
- **PROJECT_STRUCTURE.md**: This file - explains the project organization

## Task Management

### TaskMaster Integration

The project uses TaskMaster for task management. The main tasks file is:
- `.taskmaster/tasks/tasks.json` - Used by TaskMaster MCP server

### Individual Task Files

For easier tracking and reference, each task has its own JSON file:
- Location: `.taskmaster/tasks/individual/`
- Format: `task-{id}.json` where `{id}` is 1-23
- Purpose: Easy tracking, version control, and reference

### Task Organization

Tasks are organized into 5 sprints:
- **Sprint 0**: Project Setup (3 tasks)
- **Sprint 1**: API Catalog Tools (5 tasks)
- **Sprint 2**: Podio Authentication (3 tasks)
- **Sprint 3**: App Fetching + TS Config Generation (4 tasks)
- **Sprint 4**: Error Handling & Developer Experience (4 tasks)
- **Sprint 5**: Integration & Polish (4 tasks)

**Total: 23 tasks**

## Benefits of This Structure

1. **Clear Separation**: Documentation is separate from code and tasks
2. **Easy Tracking**: Individual task files make it easy to track progress
3. **Version Control**: Each task file can be tracked independently
4. **TaskMaster Integration**: Main tasks.json works with TaskMaster MCP
5. **Reference**: Individual files are easy to reference and update

## Next Steps

1. Review documentation in `docs/` folder
2. Check individual task files in `.taskmaster/tasks/individual/`
3. Use TaskMaster MCP tools to manage tasks
4. Start development with Task #1 (Initialize Node.js + TypeScript Project)

