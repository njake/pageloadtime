var total, acc = 0;

function set_row(id, start, length, noacc) {
	var x = Math.round(start / total * 300);

	if ( !noacc) {
		acc += length;
	}
	document.getElementById(id + 'When').innerHTML = start;
	document.getElementById(id).innerHTML = length;
	document.getElementById(id + 'Total').innerHTML = noacc ? '-' : acc;
	document.getElementById('r-' + id).style.cssText = 'background-size:' + Math.round(length / total * 300) + 'px 100%;' + 'background-position-x:' + (x >= 300 ? 299 : x) + 'px;';
}

function set_timings(t) {
	start = t.redirectStart == 0 ? t.fetchStart : t.redirectStart;
	total = t.loadEventEnd - start;

	// http://w3c.github.io/navigation-timing/
	set_row('redirect', 0, t.redirectEnd - t.redirectStart);
	set_row('dns', t.domainLookupStart - start, t.domainLookupEnd - t.domainLookupStart);
	set_row('connect', t.connectStart - start, t.connectEnd - t.connectStart);
	set_row('request', t.requestStart - start, t.responseStart - t.requestStart);
	set_row('response', t.responseStart - start, t.responseEnd - t.responseStart);
	set_row('dom', t.domLoading - start, t.domComplete - t.domLoading);
	set_row('domInteractive', t.domInteractive - start, 0, true);
	set_row('contentLoaded', t.domContentLoadedEventStart - start, t.domContentLoadedEventEnd - t.domContentLoadedEventStart, true);
	set_row('load', t.loadEventStart - start, t.loadEventEnd - t.loadEventStart);
}

// Toolbar popup
if (chrome && chrome.tabs) {
	chrome.tabs.getSelected(null, function(tab) {

		// Get timings from cache
		chrome.storage.local.get('cache', function(data) {

			set_timings(data.cache['tab' + tab.id]['top']);

		});

	});
}

// IFrame Popup
if (chrome && chrome.runtime) {
	// FrameId
	var frameId = window.location.hash.substr(1);

	// Get timings from background.js cache
	chrome.runtime.sendMessage({
		action : 'get',
		id : frameId
	}, function(t) {

		set_timings(t);

	});

}
