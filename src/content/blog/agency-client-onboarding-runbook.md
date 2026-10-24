---
title: The client onboarding runbook a small agency uses for every workspace
description: Naming rules, a role matrix, one key per site and environment, and the offboarding checklist a six-person studio follows for its nine clients.
pubDate: 2026-10-16
tag: Agency
scenario: Faro Digital · 6-person web studio · 9 active clients
stack: 5 WordPress sites, 3 Next.js sites, 1 Astro site
example:
  heading: Workspaces
  status: 9 active
  rows:
    - { label: hotel-mirador, value: WordPress · 2 editors }
    - { label: clinica-sonrisa, value: Next.js · 1 editor · 1 viewer }
    - { label: cafe-norte, value: Astro · 1 editor }
---

Faro Digital builds and maintains websites for local businesses: a hotel, a dental clinic, a café, a law firm and five more. Before they moved client content to Flexa, logins were shared over email and nobody was quite sure who still had access to what.

Below is the runbook they now follow for every client, lightly edited. It's short on purpose, because nobody reads a long one.

## Naming

| Thing | Pattern | Example |
| --- | --- | --- |
| Workspace | `client-name` | `hotel-mirador` |
| API key | `client-site-environment` | `mirador-web-production` |
| Temporary key | `client-task-yyyymmdd` | `mirador-import-20260312` |

Keys named this way are easy to find and safe to revoke, because the name says exactly where the key is used.

## Onboarding checklist

1. Create the workspace from the closest template (marketing site, blog, product catalog or blank).
2. Adapt the models to the client's real content. Delete the sample fields they won't use.
3. Import existing content with a temporary write key, then revoke it the same day.
4. Connect the site:
   - WordPress: install the Flexa plugin and use its blocks and shortcodes in the existing theme.
   - Next.js or Astro: use the official SDK.
5. Create one read key per environment (production and staging), limited to the models the site displays, with an expiry date that matches the contract.
6. Invite the client's people with the roles below.
7. Walk the client's editor through one real change, and let them publish it themselves.

## Role matrix

| Person | Role | Why |
| --- | --- | --- |
| Studio lead | Owner | Billing, keys and models |
| Studio developers | Admin | Models and integrations |
| Client's content person | Editor | Writes and publishes day to day |
| Client's manager | Viewer | Reviews drafts without changing them |

The rule is the smallest role that does the job. Most managers only want to look, and a viewer can't publish something by accident.

## Every quarter

- Check each workspace's keys and revoke any that nobody can explain.
- Remove members who left the client's company.
- Renew expiring keys for active contracts. An expiry date catches the keys everyone forgot about.

## When something goes wrong

In the spring, the hotel's editor replaced the homepage hero with a draft for a summer campaign two months early. The studio opened the entry's revision history, restored the previous version and showed the editor how to keep a draft unpublished. Nothing else was affected, because only that entry had changed.

## Offboarding

When the law firm moved its website to an in-house team:

1. Revoke every key in the workspace, production first.
2. Remove the studio's members who no longer need access.
3. Invite the firm's new team as owners, so they keep their content.
4. Remove the workspace from the studio's internal client list.

The other eight clients noticed nothing. They never shared keys, members or content with that workspace.
