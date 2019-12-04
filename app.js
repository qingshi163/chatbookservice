const Koa = require('koa2');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');
const sesseon = require('koa-session');
const app = new Koa();
const router = new Router();
const PORT = 3000;
const API_V1 = ''//'/api/v1'
app.keys = ['\xa7%\xb2\x86Y\x02\xbdh\x02\x0fk\xcd\xdbQ\x1b\x0el\xb7g\x07\xe99Pl'];
const passport = require('./auth');

function isAuthenticated(ctx, next) {
    if (ctx.isAuthenticated())
        return next();
    ctx.status = 403;
    //ctx.body = { status: 'error no login'};
}

const login_html =
`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Login</title>
</head>
<body>
<h1>Login</h1>
<form action="${API_V1}/auth/login" method="post">
    <p><label>Username: <input type="text" name="username"/></label></p>
    <p><label>Password: <input type="password" name="password"/></label></p>
    <p><input type="submit"/></p>
</form>
</body>
</html>`

router
    .get(API_V1+'/auth/login', (ctx, next) => {
        ctx.body = login_html;
    })
    .get(API_V1+'/auth/status', isAuthenticated, (ctx, next) => {
        if (ctx.isAuthenticated())
            ctx.body = 'success login';
        else
            ctx.body = 'no login';
    })
    .post(API_V1+'/auth/login', (ctx, next) => {
        return passport.authenticate('local', (err, user, info, status) => {
            if (user) {
                ctx.login(user);
                ctx.redirect(API_V1+'/auth/status');
            } else {
                ctx.status = 400;
            }
        })(ctx);
    })

app
    .use(bodyParser())
    .use(sesseon(app))
    .use(passport.initialize())
    .use(passport.session())
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(PORT, () => {
        console.log('Server is listening on port: ' + PORT);
    });

module.exports = app;