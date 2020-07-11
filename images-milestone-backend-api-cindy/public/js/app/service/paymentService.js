angular.module('photographer').factory('paymentService', function($http, constSetting) {
  function baseUrl() {
    return '/api/braintree/';
  }

  return {
    init() {
      const ctx = this;
      $http({
        method: 'GET',
        url: `${baseUrl()}client_token`
      }).success(function(token) {
        braintree.dropin.create({
          authorization: token,
          container: '#bt-dropin',
          paypal: {
            flow: 'vault'
          }
        }, function(createErr, instance) {
          console.log(createErr, instance);
          ctx.instance = instance;
        });
      });
    },
    createTransaction(amount, customerId, localId, meta) {
      const ctx = this;
      const data = meta || {};
      // const type = data.type

      return new Promise((resolve, reject) => {
        if (!data.soldout) ctx.instance.requestPaymentMethod(function(err, res) {
          ctx.paymentMethod = res;
          if (err) {
            reject(err);
            return;
          }
          $http({
            method: 'POST',
            url: `${baseUrl()}checkouts`,
            data: {
              amount,
              payment_method_nonce: res.nonce,
              local_id: localId,
              user_id: customerId,
              type: data.type,
              albumid: data.albumid
            }
          }).success(function(res) {
            resolve(res);
          })
            .error(function(err) {
              reject(err);
            });
        });

        else reject({
          type: 'error',
          msg: 'Sold out'
        });

      });
    },
    destroy() {
    }
  };
});
