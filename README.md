
This repository is to document some quarks of working with prisma that may have been unexpected when coming from a traditional ORM. Prisma does some [magic](https://media.tenor.com/images/1fb93e098589d31f5023b7d32418f013/tenor.gif) when you actually make a query. [It leverages `process.nextTick` to optimize all the queries issued in one JS "tick"](https://www.prisma.io/docs/guides/performance-and-optimization/query-optimization-performance). (I didn't know that was even a thing until recently)

**Why this is important:** Most observability tools and expception monitors make assumptions about how to propogate tracing so that you can tie an exception or database query back to the code which produced it.

---

Try it for yourself!

`npm install` then: 
- `npm run exception`
- `npm run query`

### Execption

- [exception.ts](./exception.ts)

When Prisma thorws an exception, the exception is not tied to the code which actually generated it. 

There is no first-party code in the stack trace so in a sufficiently complex application it's hard to figure 
out where the actual call happened. 

```
> ts-node ./script.ts


/Users/brian/staffbar/learning/starter/node_modules/@prisma/client/runtime/index.js:32626
    const error = new PrismaClientValidationError(renderErrorStr(validationCallsite));
                  ^
Error:
Invalid `prisma.user.findFirst()` invocation:

{
  where: {
    abc: 'def'
    ~~~
  }
}

Unknown arg `abc` in where.abc for type UserWhereInput. Did you mean `AND`? Available args:
type UserWhereInput {
  AND?: UserWhereInput | List<UserWhereInput>
  OR?: List<UserWhereInput>
  NOT?: UserWhereInput | List<UserWhereInput>
  id?: IntFilter | Int
  email?: StringFilter | String
  name?: StringNullableFilter | String | Null
  posts?: PostListRelationFilter
}


    at Document.validate (/Users/brian/staffbar/learning/starter/node_modules/@prisma/client/runtime/index.js:32626:19)
    at NewPrismaClient._executeRequest (/Users/brian/staffbar/learning/starter/node_modules/@prisma/client/runtime/index.js:34733:17)
    at consumer (/Users/brian/staffbar/learning/starter/node_modules/@prisma/client/runtime/index.js:34678:23)
    at /Users/brian/staffbar/learning/starter/node_modules/@prisma/client/runtime/index.js:34680:47
    at AsyncResource.runInAsyncScope (node:async_hooks:199:9)
    at NewPrismaClient._request (/Users/brian/staffbar/learning/starter/node_modules/@prisma/client/runtime/index.js:34680:25)
    at Object.then (/Users/brian/staffbar/learning/starter/node_modules/@prisma/client/runtime/index.js:34788:39)

```
### Query 

- [query.ts](./query.ts)

Query logging has a similar behavior where the `prisma.on` middleware is detached from the stack trace which produced the actual query. 

This disconnect makes it difficult to inspect the SQL that Primsa is actually in running in relation to the actual code which triggered the query. This is especially difficult when trying to figure out if you've setup your code to get the automatic query optimization. `findFirst` vs `findUnique` seems like a relatively small detail but could be the difference between 1000 queries ~5 in a GraphQL query that is a few layers deep. 
 

 ```
 > query                                                                                                                                                                                                                                                              [90/1739]
> DEBUG="*" ts-node ./query.ts

  prisma:tryLoadEnv Environment variables loaded from /Users/brian/staffbar/learning/starter/.env +0ms
[dotenv][DEBUG] did not match key and value when parsing line 2:
  prisma:tryLoadEnv Environment variables loaded from /Users/brian/staffbar/learning/starter/.env +4ms
[dotenv][DEBUG] did not match key and value when parsing line 2:
[dotenv][DEBUG] "DATABASE_URL" is already defined in `process.env` and will not be overwritten
  prisma:client clientVersion: 2.26.0 +0ms
  prisma:client Prisma Client call: +14ms
  prisma:client prisma.user.findUnique({
  prisma:client   where: {
  prisma:client     id: 1
  prisma:client   }
  prisma:client }) +0ms
  prisma:client Generated request: +0ms
  prisma:client query {
  prisma:client   findUniqueUser(where: {
  prisma:client     id: 1
  prisma:client   }) {
  prisma:client     id
  prisma:client     email
  prisma:client     name
  prisma:client   }
  prisma:client }
  prisma:client  +1ms
  prisma:client Prisma Client call: +0ms
  prisma:client prisma.user.findUnique({
  prisma:client   where: {
  prisma:client     id: 2
  prisma:client   }
  prisma:client }) +0ms
  prisma:client Generated request: +0ms
  prisma:client query {
  prisma:client   findUniqueUser(where: {
  prisma:client     id: 2
  prisma:client   }) {
  prisma:client     id
  prisma:client     email
  prisma:client     name
  prisma:client   }
  prisma:client }
  prisma:client  +0ms
  prisma:engine Search for Query Engine in /Users/brian/staffbar/learning/starter/node_modules/.prisma/client +0ms
  prisma:engine { cwd: '/Users/brian/staffbar/learning/starter/prisma' } +1ms
  prisma:engine Search for Query Engine in /Users/brian/staffbar/learning/starter/node_modules/.prisma/client +2ms
  plusX Execution permissions of /Users/brian/staffbar/learning/starter/node_modules/.prisma/client/query-engine-darwin are fine +0ms
  plusX Execution permissions of /Users/brian/staffbar/learning/starter/node_modules/.prisma/client/query-engine-darwin are fine +15ms
  prisma:engine { flags: [ '--enable-raw-queries', '--port', '51119' ] } +17ms
  prisma:engine stdout Starting a sqlite pool with 13 connections. +19ms
prisma:info Starting a sqlite pool with 13 connections.
  prisma:engine stdout Fetched a connection from the pool +6ms
  prisma:engine stdout Started http server on http://127.0.0.1:51119 +0ms
prisma:info Started http server on http://127.0.0.1:51119
  prisma:engine Search for Query Engine in /Users/brian/staffbar/learning/starter/node_modules/.prisma/client +8ms
  plusX Execution permissions of /Users/brian/staffbar/learning/starter/node_modules/.prisma/client/query-engine-darwin are fine +35ms
  prisma:engine stdout Fetched a connection from the pool +10ms
  prisma:engine stdout Unknown error +1ms
Query: SELECT `main`.`User`.`id`, `main`.`User`.`email`, `main`.`User`.`name` FROM `main`.`User` WHERE `main`.`User`.`id` IN (?,?) LIMIT ? OFFSET ?
Duration: 0ms
Duration: 0ms
stack Error:
    at /Users/brian/staffbar/learning/starter/query.ts:28:11
    at EventEmitter.<anonymous> (/Users/brian/staffbar/learning/starter/node_modules/@prisma/client/runtime/index.js:34338:20)
    at EventEmitter.emit (node:events:365:28)
    at EventEmitter.emit (node:domain:470:12)
    at LineStream.<anonymous> (/Users/brian/staffbar/learning/starter/node_modules/@prisma/client/runtime/index.js:27745:35)
    at LineStream.emit (node:events:365:28)
    at LineStream.emit (node:domain:470:12)
    at addChunk (node:internal/streams/readable:314:12)
    at readableAddChunk (node:internal/streams/readable:289:9)
    at LineStream.Readable.push (node:internal/streams/readable:228:10)
[
  { id: 1, email: 'sarah@prisma.io', name: 'Sarah' },
  { id: 2, email: 'maria@prisma.io', name: 'Maria' }
]
  prisma:client Prisma Client call: +72ms
  prisma:client prisma.user.findFirst({
  prisma:client   where: {
  prisma:client     id: 1
  prisma:client   }
  prisma:client }) +0ms
  prisma:client Generated request: +0ms
  prisma:client query {
  prisma:client   findFirstUser(where: {
  prisma:client     id: 1
  prisma:client   }) {
  prisma:client     id
  prisma:client     email
  prisma:client     name
  prisma:client   }
  prisma:client }
  prisma:client  +0ms
  prisma:client Prisma Client call: +0ms
  prisma:client prisma.user.findFirst({
  prisma:client   where: {
  prisma:client     id: 2
  prisma:client   }
  prisma:client }) +0ms
  prisma:client Generated request: +0ms
  prisma:client query {
  prisma:client   findFirstUser(where: {
  prisma:client     id: 2
  prisma:client   }) {
  prisma:client     id
  prisma:client     email
  prisma:client     name
  prisma:client   }
  prisma:client }
  prisma:client  +0ms
  prisma:engine Client Version: 2.26.0 +9ms
  prisma:engine Engine Version: query-engine 9b816b3aa13cc270074f172f30d6eda8a8ce867d +0ms
  prisma:engine Active provider: sqlite +0ms
  prisma:engine stdout Fetched a connection from the pool +0ms
  prisma:engine stdout Unknown error +0ms
Query: SELECT `main`.`User`.`id`, `main`.`User`.`email`, `main`.`User`.`name` FROM `main`.`User` WHERE `main`.`User`.`id` = ? LIMIT ? OFFSET ?
Duration: 0ms
stack Error:
    at /Users/brian/staffbar/learning/starter/query.ts:28:11
    at EventEmitter.<anonymous> (/Users/brian/staffbar/learning/starter/node_modules/@prisma/client/runtime/index.js:34338:20)
    at EventEmitter.emit (node:events:365:28)
    at EventEmitter.emit (node:domain:470:12)
    at LineStream.<anonymous> (/Users/brian/staffbar/learning/starter/node_modules/@prisma/client/runtime/index.js:27745:35)
    at LineStream.emit (node:events:365:28)
    at LineStream.emit (node:domain:470:12)
    at addChunk (node:internal/streams/readable:314:12)
    at readableAddChunk (node:internal/streams/readable:289:9)
    at LineStream.Readable.push (node:internal/streams/readable:228:10)
  prisma:engine stdout Fetched a connection from the pool +1ms
  prisma:engine stdout Unknown error +1ms
Query: SELECT `main`.`User`.`id`, `main`.`User`.`email`, `main`.`User`.`name` FROM `main`.`User` WHERE `main`.`User`.`id` = ? LIMIT ? OFFSET ?
Duration: 0ms
stack Error:
    at /Users/brian/staffbar/learning/starter/query.ts:28:11
    at EventEmitter.<anonymous> (/Users/brian/staffbar/learning/starter/node_modules/@prisma/client/runtime/index.js:34338:20)
    at EventEmitter.emit (node:events:365:28)
    at EventEmitter.emit (node:domain:470:12)
    at LineStream.<anonymous> (/Users/brian/staffbar/learning/starter/node_modules/@prisma/client/runtime/index.js:27745:35)
    at LineStream.emit (node:events:365:28)
    at LineStream.emit (node:domain:470:12)
    at addChunk (node:internal/streams/readable:314:12)
    at readableAddChunk (node:internal/streams/readable:289:9)
    at LineStream.Readable.push (node:internal/streams/readable:228:10)
[
  { id: 1, email: 'sarah@prisma.io', name: 'Sarah' },
  { id: 2, email: 'maria@prisma.io', name: 'Maria' }
]
  prisma:engine Stopping Prisma engine4 +1ms
  prisma:engine Waiting for start promise +0ms
  prisma:engine Done waiting for start promise +0ms
  ```
