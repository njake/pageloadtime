// Timings to html table
var page_load_time_popop = {
	total : 0,
	acc : 0,
	set_timings : function(t) {
		start = t.redirectStart == 0 ? t.fetchStart : t.redirectStart;
		this.total = t.loadEventEnd - start;
		// http://w3c.github.io/navigation-timing/
		this.set_row('redirect', 0, t.redirectEnd - t.redirectStart);
		this.set_row('dns', t.domainLookupStart - start, t.domainLookupEnd - t.domainLookupStart);
		this.set_row('connect', t.connectStart - start, t.connectEnd - t.connectStart);
		this.set_row('request', t.requestStart - start, t.responseStart - t.requestStart);
		this.set_row('response', t.responseStart - start, t.responseEnd - t.responseStart);
		this.set_row('dom', t.domLoading - start, t.domComplete - t.domLoading);
		this.set_row('domInteractive', t.domInteractive - start, 0, true);
		this.set_row('contentLoaded', t.domContentLoadedEventStart - start, t.domContentLoadedEventEnd - t.domContentLoadedEventStart, true);
		this.set_row('load', t.loadEventStart - start, t.loadEventEnd - t.loadEventStart);
	},
	set_row : function(id, start, length, noacc) {
		var x = Math.round(start / this.total * 300);

		if ( !noacc) {
			this.acc += length;
		}
		document.getElementById(id + 'When').innerHTML = start;
		document.getElementById(id).innerHTML = length;
		document.getElementById(id + 'Total').innerHTML = noacc ? '-' : this.acc;
		document.getElementById('r-' + id).style.cssText = 'background-size:' + Math.round(length / this.total * 300) + 'px 100%;' + 'background-position-x:' + (x >= 300 ? 299 : x) + 'px;';
	}
}

// Toolbar Extension Popup
if (chrome && chrome.tabs) {
	chrome.tabs.query({
		currentWindow : true,
		active : true
	}, function(tabs) {
		// Get timings from cache
		chrome.storage.local.get('cache', function(data) {
			page_load_time_popop.set_timings(data.cache['tab' + tabs[0].id]['top']);
		});
	});
}

// Web Page Content Popup
else if (chrome && chrome.runtime) {
	// Get timings from background.js cache
	chrome.runtime.sendMessage({
		action : 'get',
		id : window.location.hash.substr(1)
	}, function(t) {
		page_load_time_popop.set_timings(t);
	});
}
