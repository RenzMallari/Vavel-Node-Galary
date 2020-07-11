angular.module('photographer').factory('recaptchaService', function (vcRecaptchaService) {
  // reCAPTCHA SITE KEY
  const recaptchaPublicKey = '6LftBMQUAAAAABbAFRZShICAfW2tbGDLvFxH5Y7f';

  return {
    getPublicKey() {
      return recaptchaPublicKey;
    },
    getResponse() {
      return vcRecaptchaService.getResponse();
    },
    reload() {
      return vcRecaptchaService.reload();
    }
  };
});
