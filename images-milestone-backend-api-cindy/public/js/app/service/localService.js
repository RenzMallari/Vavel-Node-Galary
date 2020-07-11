angular.module("photographer").factory('localService', function() {
	return {
		localUser: null,
		uuidv4: function() {
		  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		    return v.toString(16);
		  });
		},
		createLocalUser: function() {
			this.localUser = this.localUser || JSON.parse(localStorage.getItem('localUser')) || {
				_id: this.uuidv4()
			};
			localStorage.setItem('localUser', JSON.stringify(this.localUser));
			return this.localUser;
		},
		destroy() {
			localStorage.removeItem('localUser');
		}
	};
});