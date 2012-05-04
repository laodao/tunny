(function($){
	$.fn.waterfall = function(options){
		$this = this;
		this.options = options || $.fn.waterfall.defaults;
		this.selector = options.selector;
		this.padding = options.padding||this.defaults.padding;
		this.minHeight = this.padding;
		this.minWidth = this.padding;
		this.find(this.selector).each(function(i){
			this.css('top', $this.minHeight+'px');
			this.css('left', $this.minWidth+'px');
			$this.minHeight += this.height;
			$this.minWidth += this.width;
		});
	};
	$.fn.waterfall.defaults = {
			padding : '20px';
			animate : {},
			shadow  : false,
			selector: '.box'
	};
})(jQuery);