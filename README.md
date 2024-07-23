
# Monorepo

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Install Dependencies](#install-dependencies)
  - [Build the Packages](#build-the-packages)
  - [Start the API Server](#start-the-api-server)
  - [Testing](#testing)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Maintenance and Expansion](#maintenance-and-expansion)
- [Conclusion](#conclusion)

## Overview

The monorepo is organized into several packages under the packages folder, each dedicated to a specific aspect of the system:

### API:
Contains all code related to the Fastify server, including endpoints and business logic.

### Services:
Houses the core business logic and service layer that interacts with the database and other APIs.

### Utilities:
Provides common tools and functions that can be used by other packages.

## Getting Started

To get the project up and running, follow these steps:

### Install Dependencies:

From the root of the monorepo, run:

   
    yarn install

### Build the packages:

From the root of the monorepo, run:

    yarn build
    
### Start the API Server

From the root of the monorepo, run:

    yarn workspace api run dev
  
  This will start the Fastify server on port 3000 and it will be ready to accept requests.

### Testing

From the api package directory, run:

    npm test
## Project Structure

    monorepo/
│
├── .github/
├── packages/
│   ├── api/
│   │   ├── fixtures/
│   │   ├── node_modules/
│   │   ├── prisma/
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── __tests__
│   │   │   ├── adapters
│   │   │   │   ├── controllers
│   │   │   │   ├── routes
│   │   │   ├── persistence
│   │   │   │   ├── interface
│   │   │   ├── app
│   │   │   │   ├── services
│   │   │   ├── domain
│   │   │   │   ├── models
│   │   │   ├── infrastructure
│   │   │   │   ├── middleware
│   │   │   │   ├── index.ts
│   │   │   ├── tests
│   │   │   ├── types
│   │   ├── .env
│   │   ├── .gitignore
│   │   ├── jest.config.js
│   │   ├── nodemon.json
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── services/
│   │   ├── node_modules/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── utilities/
│   │   ├── src/
│   │   │   ├── common
│   │   ├── package.json
│   │   └── tsconfig.json
│
├── .env
├── package.json
├── tsconfig.json
├── turbo.json

## Architecture
This project is a monorepo that uses a package-based architecture to improve scalability and maintainability. It follows the principles of Hexagonal Architecture (also known as Ports and Adapters) to ensure a clean separation of concerns and allow for independent development and code reuse.

Fastify provides a robust framework for the HTTP server, optimized for performance and low overhead, ideal for building fast API services.

TypeScript offers compile-time type safety, enhancing code quality and reducing runtime errors.

Prisma is used to interact with the PostgreSQL database, enabling efficient and secure CRUD operations through a modern and scalable ORM.

Turbo (TurboRepo) manages building, testing, and running scripts across the monorepo, ensuring dependencies are up to date and tasks are run efficiently.

## Maintenance and Expansion
To maintain and expand this project, consider adhering to best software development practices, including:

-   Unit Testing: Each controller includes unit tests to ensure components function as expected.
-   Documentation: Keep documentation up to date with changes in the code and new functionalities.
-   Code Review: Implement a code review process to enhance code quality and share knowledge among the team.
## Conclusion
This monorepo is designed to be a solid foundation for complex and scalable applications, facilitating the management of multiple packages and collaboration in large teams.

Feel free to make any additional adjustments or customizations to fit your specific project needs.
