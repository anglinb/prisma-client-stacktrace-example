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
