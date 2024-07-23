#!/bin/sh
npx prisma generate --schema=./packages/api/prisma/schema.prisma
yarn workspace api run dev
