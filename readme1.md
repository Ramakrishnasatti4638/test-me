# test-me

A lightweight sandbox repository used for validating Git and GitHub workflows — branch creation, commits, pull requests, and CI tooling.

## Overview

This repository is intentionally minimal. It exists so that changes can be made on short-lived feature branches and reviewed through pull requests before being merged into `main`.

| Property | Value |
| --- | --- |
| Default branch | `main` |
| Repository | `ramakrishnasatti4638/test-me` |
| Purpose | Workflow validation and scratch work |

## Contents

- `readme1.md` — this document, describing the repository's purpose and conventions.

## Conventions

- **Branches** are named `<type>/<short-description>` (for example, `feat/example`).
- **Commits** follow the [Conventional Commits](https://www.conventionalcommits.org/) style:
  `<type>(<scope>): <subject>`, where `type` is one of `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, or `build`.
- **Pull requests** target `main` and include a short summary of the change along with testing notes.

### Commit types

| Type | Use when |
| --- | --- |
| `feat` | Adding new functionality |
| `fix` | Correcting a bug |
| `docs` | Updating documentation only |
| `chore` | Maintenance tasks with no functional impact |
| `refactor` | Restructuring code without changing behaviour |
| `test` | Adding or modifying tests |
| `build` | Changing build tooling or dependencies |

## Getting started

Clone the repository and create a branch for your work:

```bash
git clone https://github.com/ramakrishnasatti4638/test-me.git
cd test-me
git checkout -b feat/my-change
```

Commit your changes and open a pull request against `main`.

## License

Released under the MIT License. See the repository for full details.
