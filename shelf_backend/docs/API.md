# API.md
## The API Contract - using REST API

## Resources:
- /auth : /login, /signup, /logout, /logout-all
- /users: 
- /docs & /docs/:[id]
- /health

---
## Auth

### POST - /auth/signup

Create a new account using email, name and password. 

Body: {email(string,unique), password(string), name(string)}  
201: ACCOUNT_CREATED  
401: INVALID_EMAIL_OR_PASSWORD  
422: VALIDATION_FAILED

---

### POST - /auth/login

Log in to the existing account.

Body: {email (string), password(string)}

200:  
LOGIN_SUCCESSFUL  
SET_COOKIE - shelf_access<JWT>: {httpOnly: true, secure: true, sameSite: "lax", maxAge: 900, path: "/"}  
SET_COOKIE - shelf_refresh<JWT>: {httpOnly: true, secure: true, sameSite: "strict", maxAge: 900, path: "/auth/"}

401: INVALID_EMAIL_OR_PASSWORD  
If expired access token used, clear all cookies + issue new tokens with a new hashFamily.

422: VALIDATION_FAILED

---

### POST - /auth/logout
Log out of current device. Clear all active sessions by userAgent.  

Body: None  
200: LOGOUT_SUCCESSFUL  
401: UNAUTHENTICATED

---

### POST - /auth/logout-all
Log out of all active devices. Clear all sessions by userId.

Body: None  
200: LOGOUT_ALL_SUCCESSFUL  
401: UNAUTHENTICATED

---

### POST - /auth/refresh
Check if access token is about to expire. Then, rotate the tokens.

Body: None  
200: SUCCESS  
401: UNAUTHENTICATED

---
## Users

### GET - /users
Get the user dashboard.

Body: None  
200: SUCCESS  
401: UNAUTHENTICATED  
404: NOT_FOUND  

---
### PATCH - /users
Edit the username.

Body: {username: string}  
201: SUCCESS  
401: UNAUTHENTICATED  
404: NOT_FOUND  
422: VALIDATION_FAILED

---
### DELETE - /users
Delete the user account permanently.

Body: None  
200: SUCCESS  
401: UNAUTHENTICATED  
404: NOT_FOUND

---
## Docs

### GET - /docs
Get all the user docs.

Body: None  

Query:  
q?: string,  
filter?: last 7 days, last 3 months, last 24 hours,  
sort? : Date asc (default) | Date desc,  
page? : number (default = 1),  
limit? : number (default 10)

200:
{
    success: true,
    docs: [{
        title: string,
        desc: string | null,
        tags: string[] | null,
        updatedAt: Date
    }]
}

401: UNAUTHENTICATED  
404: NOT_FOUND
422: VALIDATION_FAILED

---
### POST - /docs
Add a doc.

Body: {
    title: string,
    desc: string | null,
    tags: string[] | null,
}

201: {
    success: true,
    message: "Doc created successfully"
}  
401: UNAUTHENTICATED  
409: DUPLICATE_TITLE  
422: VALIDATION_FAILED

---
### DELETE - /docs
Delete all docs.

Body: None  
200: {
    success: true,
    message: "Doc deleted successfully"
}  
401: UNAUTHENTICATED 
404: NOT_FOUND

---
### GET - /docs/:[id]
Get a doc.

Body: None  
Query:   
id: string

200: {
    success: true,
    doc: {
        title: string, 
        desc: string | null,
        tags: string[] | null
    }
}  
401: UNAUTHENTICATED  
404: NOT_FOUND

---
### PATCH - /docs/:[id]
Get a doc.

Body:   
{
    title: string, 
    desc: string | null,
    tags: string[] | null
}  
Query:   
id: string

200: {
    success: true,
    message: "Doc updated successfully"
}  
401: UNAUTHENTICATED  
404: NOT_FOUND
422: VALIDATION_FAILED

---
### DELETE - /docs/:[id]

Body: None  
200: {success: true, message: "Doc deleted successfully"}  
401: UNAUTHENTICATED  
404: NOT_FOUND

---
## Health

### GET - /health

Body: None
201 - {success: true, data:{
    dbHealth: boolean,
    redisHealth: boolean,
    ec2Health: boolean
}}  
400 - BAD_REQUEST

---