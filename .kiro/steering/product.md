# Taskosaur Product Overview

Taskosaur is an open source project management platform with **Conversational AI Task Execution**. The core differentiator is that AI doesn't just provide suggestions - it executes tasks directly within the application through browser automation.

## Key Features

- **Conversational AI Task Execution**: AI performs actions directly in the app through natural conversation
- **In-App Browser Automation**: AI navigates the interface and clicks buttons in real-time
- **Self-Hosted**: Your data stays on your infrastructure
- **Bring Your Own LLM**: Use OpenAI, Anthropic, OpenRouter, or local models
- **Full Project Management**: Kanban boards, sprints, task dependencies, time tracking
- **Email Integration**: Project inbox with email-to-task conversion

## Architecture

- **Multi-tenant**: Organizations → Workspaces → Projects → Tasks hierarchy
- **Role-based Access Control**: SUPER_ADMIN, OWNER, MANAGER, MEMBER, VIEWER
- **Real-time Updates**: WebSocket connections for live collaboration
- **Audit Trail**: Comprehensive activity logging for all changes

## Target Users

- Development teams needing project management with AI assistance
- Organizations wanting self-hosted solutions with conversational interfaces
- Teams looking to automate repetitive project management tasks through natural language

## Business Model

- Open source under Business Source License (BSL)
- Self-hosted deployment model
- Users bring their own LLM API keys