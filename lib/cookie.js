
/*!
 * Connect - session - Cookie
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var utils = require('./util');

/**
 * Initialize a new `Cookie` with the given `options`.
 *
 * @param {IncomingMessage} req
 * @param {Object} options
 * @api private
 */

var Cookie = module.exports = function Cookie(req, options) {
	this._key = options.key;
	this._val = options.val;
  this.path = '/';
  this.httpOnly = true;
  this.maxAge = null;
  if (options) utils.merge(this, options);
  Object.defineProperty(this, 'req', { value: req });
  this.originalMaxAge = null;
  //this.originalMaxAge = undefined == this.originalMaxAge ? this.maxAge : this.originalMaxAge;
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
   * Set expires `date`.
   *
   * @param {Date} date
   * @api public
   */
  
  set expires(date) {
    this._expires = date;
    this.originalMaxAge = this.maxAge;
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
   * Set expires via max-age in `ms`.
   *
   * @param {Number} ms
   * @api public
   */
  
  set maxAge(ms) {
    this.expires = 'number' == typeof ms
      ? new Date(Date.now() + ms)
      : ms;
  },

  /**
   * Get expires max-age in `ms`.
   *
   * @return {Number}
   * @api public
   */

  get maxAge() {
    return this.expires instanceof Date
      ? this.expires.valueOf() - Date.now()
      : this.expires;
  },

  /**
   * Return cookie data object.
   *
   * @return {Object}
   * @api private
   */

  get data() {
    return {
        originalMaxAge: this.originalMaxAge
      , expires: this._expires
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
