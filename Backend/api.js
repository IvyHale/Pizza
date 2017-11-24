/**
 * Created by chaika on 09.02.16.
 */
var Pizza_List = require('./data/Pizza_List');

exports.getPizzaList = function (req, res) {
    res.send(Pizza_List);
};

exports.createOrder = function (req, res) {
    // var order_info = req;

    // var data = base64(JSON.stringify(order));
    // var signature = sha1(LIQPAY_PRIVATE_KEY + data + LIQPAY_PRIVATE_KEY);

    res.send({
        // success: true,
        data: data,
        signature: signature
    });
};

// var crypto = require('crypto');
//
// function sha1(string) {
//     var sha1 = crypto.createHash('sha1');
//     sha1.update(string);
//     return sha1.digest('base64');
// }
//
// function base64(str) {
//     return new Buffer(str).toString('base64');
// }