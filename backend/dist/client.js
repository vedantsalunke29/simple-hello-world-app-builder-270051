import { Prisma, PrismaClient } from './generated/prisma/index.js';
// add prisma to the NodeJS global type
// interface CustomNodeJsGlobal extends Global {
//   prisma: PrismaClient;
// }
// Prevent multiple instances of Prisma Client in development
// declare const global: CustomNodeJsGlobal;
var PrismaOperation;
(function (PrismaOperation) {
    PrismaOperation["findUnique"] = "findUnique";
    PrismaOperation["findUniqueOrThrow"] = "findUniqueOrThrow";
    PrismaOperation["findMany"] = "findMany";
    PrismaOperation["findFirst"] = "findFirst";
    PrismaOperation["findFirstOrThrow"] = "findFirstOrThrow";
    PrismaOperation["create"] = "create";
    PrismaOperation["createMany"] = "createMany";
    PrismaOperation["createManyAndReturn"] = "createManyAndReturn";
    PrismaOperation["update"] = "update";
    PrismaOperation["updateMany"] = "updateMany";
    PrismaOperation["updateManyAndReturn"] = "updateManyAndReturn";
    PrismaOperation["upsert"] = "upsert";
    PrismaOperation["delete"] = "delete";
    PrismaOperation["deleteMany"] = "deleteMany";
    PrismaOperation["executeRaw"] = "executeRaw";
    PrismaOperation["queryRaw"] = "queryRaw";
    PrismaOperation["aggregate"] = "aggregate";
    PrismaOperation["count"] = "count";
    PrismaOperation["runCommandRaw"] = "runCommandRaw";
    PrismaOperation["findRaw"] = "findRaw";
    PrismaOperation["groupBy"] = "groupBy";
})(PrismaOperation || (PrismaOperation = {}));
const getGlobalFiltersExtension = () => {
    return Prisma.defineExtension({
        name: 'globalFilters',
        query: {
            $allModels: {
                async $allOperations({ operation, args, query }) {
                    const globalData = { isDeleted: false };
                    switch (operation) {
                        case PrismaOperation.findUnique:
                        case PrismaOperation.findUniqueOrThrow:
                        case PrismaOperation.findMany:
                        case PrismaOperation.findFirst:
                        case PrismaOperation.findFirstOrThrow:
                        case PrismaOperation.count:
                        case PrismaOperation.groupBy:
                        case PrismaOperation.aggregate:
                        case PrismaOperation.update:
                        case PrismaOperation.updateMany:
                        case PrismaOperation.updateManyAndReturn:
                        case PrismaOperation.delete:
                        case PrismaOperation.deleteMany:
                            args.where = {
                                ...globalData,
                                ...args.where
                            };
                            break;
                        case PrismaOperation.create:
                            if (args.data && typeof args.data === 'object')
                                args.data = {
                                    ...globalData,
                                    ...args.data
                                };
                            break;
                        case PrismaOperation.createMany:
                        case PrismaOperation.createManyAndReturn:
                            if (args.data && Array.isArray(args.data))
                                for (let i = 0; i < args.data.length; i++) {
                                    const item = args.data[i];
                                    if (typeof item === 'object')
                                        args.data[i] = {
                                            ...globalData,
                                            ...item
                                        };
                                }
                            break;
                        case PrismaOperation.upsert:
                            args.where = {
                                ...globalData,
                                ...args.where
                            };
                            if (args.create && typeof args.create === 'object')
                                args.create = {
                                    ...globalData,
                                    ...args.create
                                };
                            break;
                        default:
                            break;
                    }
                    return await query(args);
                }
            }
        }
    });
};
const prisma = new PrismaClient().$extends(getGlobalFiltersExtension());
export default prisma;
