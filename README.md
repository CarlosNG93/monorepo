# monorepo

The monorepo is organized into several packages under the packages folder, each dedicated to a specific aspect of the system:

## API: Contains all code related to the Fastify server, including endpoints and business logic.
## Services: Houses the core business logic and service layer that interacts with the database and other APIs.
## Utilities: Provides common tools and functions that can be used by other packages.

## Getting Started
To get the project up and running, follow these steps:

### Install Dependencies:
From the root of the monorepo, run:

yarn install

### Build the Packages:
To build all packages, run:

yarn build
This will compile the TypeScript code to JavaScript in each package.

### Start the API Server:
From the api package directory, run:

yarn run dev
This will start the Fastify server on port 3000 and it will be ready to accept requests.

### Testing:
From the api package directory, run:

npm test

# Architecture
This project is a monorepo that uses a package-based architecture to improve scalability and maintainability. It follows the principles of Hexagonal Architecture (also known as Ports and Adapters) to ensure a clean separation of concerns and allow for independent development and code reuse.

Fastify provides a robust framework for the HTTP server, optimized for performance and low overhead, ideal for building fast API services.
TypeScript offers compile-time type safety, enhancing code quality and reducing runtime errors.
Prisma is used to interact with the PostgreSQL database, enabling efficient and secure CRUD operations through a modern and scalable ORM.
Turbo (TurboRepo) manages building, testing, and running scripts across the monorepo, ensuring dependencies are up to date and tasks are run efficiently.
Maintenance and Expansion

To maintain and expand this project, consider adhering to best software development practices, including:

- Unit Testing: Each package should include unit tests to ensure components function as expected.
- Documentation: Keep documentation up to date with changes in the code and new functionalities.
- Code Review: Implement a code review process to enhance code quality and share knowledge among the team.


# Conclusion
This monorepo is designed to be a solid foundation for complex and scalable applications, facilitating the management of multiple packages and collaboration in large teams.

