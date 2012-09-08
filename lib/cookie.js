
/*!
 * Connect - session - Cookie
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var utils = require('./util'),parseURL = require('url').parse;

/**
 * Initialize a new `Cookie` with the given `options`.
 *
 * @param {IncomingMessage} req
 * @param {Object} options
 * @api private
 */

var Cookie = module.exports = function Cookie(options, path) {
	this._key = options.key;
	this._val = options.val;
	this.path = path||"/";
	this.httpOnly = false;
	this.expire = "";
    this.secure = "";
};

/**
 * Prototype.
 */

Cookie.prototype = {
		set key(key){
			this._key = key;
		},
		
		get key(){
			return this._key;
		},
		
		set val(val){
			this._val = val;
		},
		
		get val(){
			return this._val;
		},

      /**
       * Get expires `date`.
       *
       * @return {Date}
       * @api public
       */

      get expires() {
        return this._expires;
      },

      /**
       * Return cookie data object.
       *
       * @return {Object}
       * @api private
       */

      get data() {
        return {
          expires: this._expires
          , secure: this.secure
          , httpOnly: this.httpOnly
          , domain: this.domain
          , path: this.path
        }
      },

      /**
       * Return a serialized cookie string.
       *
       * @return {String}
       * @api public
       */

      serialize: function(){
        //this.val = utils.sign(this.val, this.req.secret);
        return utils.serializeCookie(this.key, this.val, this.data);
      },

      /**
       * Return JSON representation of this cookie.
       *
       * @return {Object}
       * @api private
       */

      toJSON: function(){
        return this.data;
      }
};
