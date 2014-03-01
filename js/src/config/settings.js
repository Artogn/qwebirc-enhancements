/**
 * user settings
 * @depends [config, cookies]
 * @provides [config/Settings]
 */
var encode  = window.btoa || _.identity,
    decode = window.atob || _.identity;
config.Settings = new Class({
    Extends: Epitome.Model.Storage,
    options: {
        defaults: {
            "channels": [],
            "nickname": "",
            "username": "",
            "password": "",
            "auth": false,
            "newb": true //first visit
        },
        key: cookies.settings,
        minimize: false,

        onReady: function() {
            this.loaded = true;
        }
    },
    properties: {
        username: {
            get: function() {
                return decode(this._attributes.username);
            },
            set: function(user) {
                return encode(user);
            }
        },
        password: {
            get: function() {
                return decode(this._attributes.password);
            },
            set: function(password) {
                return encode(password);
            }
        }
    },

    set: function(key, data) {
        this.parent(key, data);
        if(this.loaded) {//set is called when initing if we save we will lose state
            this.save();
        }
        return this;
    },

    unset: function(key) {
        this.parent(key);
        return this.save();
    }
});
