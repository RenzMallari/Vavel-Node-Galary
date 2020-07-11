// load những thứ chúng ta cần
var LocalStrategy = require('passport-local').Strategy;
// load  user model
var User = require('../models/usersmodel');
module.exports = function (passport) {
    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session
    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });
    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
            // mặc định local strategy sử dụng username và password,
            // chúng ta cần cấu hình lại
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // cho phép chúng ta gửi reqest lại hàm callback
        },
        function (req, email, password, done) {
            // asynchronous
            // Hàm callback của nextTick chỉ được thực hiện khi hàm trên nó trong stack (LIFO) được thực hiện
            // User.findOne sẽ không được gọi cho tới khi dữ liệu được gửi lại
            process.nextTick(function () {
                // Tìm một user theo email
                // chúng ta kiểm tra xem user đã tồn tại hay không
                User.findOne({'local.email': email}, function (err, user) {
                    if (err)
                        return done(err);
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {
                        // Nếu chưa user nào sử dụng email này
                        // tạo mới user
                        var newUser = new User();
                        // lưu thông tin cho tài khoản local
                        newUser.local.email = email;
                        newUser.local.password = newUser.generateHash(password);
                        // lưu user
                        newUser.save(function (err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });
            });
        }));
};