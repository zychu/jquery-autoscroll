/*
 * jQuery autoscroll plugin
 *
 * Copyright 2008 Wilker Lucio <wilkerlucio@gmail.com>
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
 */

AUTOSCROLL_X = 1;
AUTOSCROLL_Y = 2;
AUTOSCROLL_BOTH = 3;

(function($) {
	$.autoscroll = {};
	
	$.autoscroll.Easemove = function() {
		this.current_point = 0;
		this.end_point = 0;
		this.running = false;
		this.speed = .07;
		
		this.onmove = function() {};
	};
	
	$.autoscroll.Easemove.prototype = {
		set_end_point: function(point) {
			this.end_point = point;
			
			if (this.running) {
				return;
			};
			
			this.running = true;
			this.move();
		},
		
		move: function() {
			var distance = this.end_point - this.current_point;
			var move = distance * this.speed;
			
			this.current_point += move;
			
			this.onmove(this.current_point);
			
			if (Math.round(this.current_point) != this.end_point) {
				var t = this;
				
				setTimeout(function() {
					t.move();
				}, 20);
			} else {
				this.running = false;
			}
		}
	};
	
	$.autoscroll.zip = function() {
		var items = $.makeArray(arguments);
		var callback = items.shift();
		var results = [];
		
		for (var i = 0; i < items[0].length; i++) {
			var line = [];
			
			for (var x = 0; x < items.length; x++) {
				line.push(items[x][i]);
			};
			
			results.push(callback.apply(this, line));
		};
		
		return results;
	};
	
	$.fn.autoscroll = function(mode, degree_window, speed) {
		mode = mode || AUTOSCROLL_BOTH;
		degree_window = degree_window || [20, 20];
		speed = speed || .07;
		
		var directions = ['left', 'top'];
		
		return this.each(function() {
			var container = $(this);
			var inner_container = container.children(':first');
			
			var ava_size = [container.width(), container.height()];
			
			//workaround to make possible to determine real size of content
			var position = inner_container.css('position');
			
			inner_container.css('position', 'absolute');
			
			var real_size = [inner_container.width(), inner_container.height()];
			
			//back to previous state
			inner_container.css('position', position);
			
			var offset = container.offset();
			offset = [offset.left, offset.top];
			
			var easemove = [];
			
			jQuery.each(directions, function(i, v) {
				var obj = new jQuery.autoscroll.Easemove();
				obj.speed = speed;
				
				obj.onmove = function(position) {
					inner_container.css('margin-' + v, -position);
				};
				
				easemove.push(obj);
			});
			
			container.mousemove(function(event) {
				var mouse = [event.pageX, event.pageY];
				
				jQuery.autoscroll.zip(function(m, o, a, r, e, w, t) {
					if (!(t & mode)) return;
					
					var d = m - o;
					d = Math.min(Math.max(d - w, 0), a - w * 2);
					
					var f = d / (a - w * 2);
					var real = f * (r - a);
					
					e.set_end_point(real);
				}, mouse, offset, ava_size, real_size, easemove, degree_window, [AUTOSCROLL_X, AUTOSCROLL_Y]);
			});
		});
	};
})(jQuery);