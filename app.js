const Koa = require('koa2');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');
const session = require('koa-session');
const logger = require('koa-logger');
const app = new Koa();
const SESSION_CONFIG = {
    key: 'chatbook',
    maxAge: 86400000,
}
const PORT = 3000;
const API_V1 = ''//'/api/v1'
const router_v1 = new Router({ prefix: API_V1 });
app.keys = ['\xa7%\xb2\x86Y\x02\xbdh\x02\x0fk\xcd\xdbQ\x1b\x0el\xb7g\x07\xe99Pl'];
const passport = require('./auth');

function isAuthenticated(ctx, next) {
    if (ctx.isAuthenticated())
        return next();
    ctx.status = 403;
    //ctx.body = { status: 'error no login'};
}

const login_html = `
<!DOCTYPE html>
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

router_v1
    .get('/', (ctx, next) => {
        ctx.body = {API: API_V1};
    })
    .get('/auth/login', (ctx, next) => {
        ctx.body = login_html;
    })
    .get('/auth/status', isAuthenticated, (ctx, next) => {
        ctx.body = {
            status: 'success',
            uid: ctx.state.user.uid,
            username: ctx.state.user.username,
            created: ctx.state.user.created,
            changed: ctx.state.user.changed,
        }
    })
    .post('/auth/login', (ctx, next) => {
        return passport.authenticate('local', (err, user, info, status) => {
            if (user) {
                ctx.login(user);
                ctx.body = { status: 'success' };
                console.log('LOGIN: Success: ' + user.username);
            } else {
                ctx.status = 400;
            }
        })(ctx);
    })
    .get('/auth/logout', (ctx, next) => {
        if (ctx.isAuthenticated()) {
            console.log('LOGOUT: ' + ctx.state.user.username);
            ctx.logout();
        }
        ctx.body = { status: 'success' };
    })
    .get('/group/list/:gid', isAuthenticated, (ctx, next) => {
        console.log(ctx.params.gid);
        ctx.body = { status: 'success' };
    });

app
    .use(logger())
    .use(bodyParser())
    .use(session(SESSION_CONFIG, app))
    .use(passport.initialize())
    .use(passport.session())
    .use(router_v1.routes())
    .use(router_v1.allowedMethods())
    .listen(PORT, () => {
        console.log('Server is listening on port: ' + PORT);
    });

module.exports = app;