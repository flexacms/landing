---
title: Letting Claude clean up old content over MCP
description: How to connect an AI client to Flexa with an API key that can read and edit content but cannot delete it, and how to undo its changes.
pubDate: 2026-10-20
tag: AI and MCP
---

Old blogs collect drafts, outdated announcements and entries that were never published. Cleaning them up is tedious, and it's exactly the kind of task an AI client can help with. The risk is letting it delete something you wanted to keep.

Flexa's MCP server lets an AI client read and manage content, and the API key decides what it can do. You can give it enough access to be useful and no access to be dangerous.

## 1. Create a key without the delete ability

Create an API key for the blog model with the **read** and **write** abilities. Leave out **delete**. The assistant can review, edit and unpublish entries, but it can't remove them.

## 2. Connect the AI client

Connect Claude with one command:

```bash
claude mcp add --transport http flexa \
  https://flexacms.com/mcp \
  --header "Authorization: Bearer flx_..."
```

Cursor and VS Code are also supported MCP clients, so you can use the same URL and key there.

## 3. Ask for a review first

Start with a read-only question:

> List draft posts older than two years. Don't change anything yet.

Read the list yourself. The assistant only sees what the key allows, so the answer is limited to the blog model.

## 4. Apply the changes you approved

Next, ask it to unpublish the posts you chose, or to update a specific field. Each change is saved in the revision history.

## 5. Undo anything you didn't mean

If a post was unpublished by mistake, open its history and restore the previous version.

Keep the key short-lived for this kind of task. Set an expiry date, and revoke the key when the cleanup is finished.
