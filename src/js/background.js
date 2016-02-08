// background.js
//console.log('background.js');
var frameCount = 0;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

	// console.log('background.js ' + request);

	switch (request.action) {

		case 'save':
			chrome.storage.local.get('cache', function(data) {
				frameCount++;
				if ( !data.cache) {
					data.cache = {};
				}
				if ( !data.cache['tab' + sender.tab.id]) {
					data.cache['tab' + sender.tab.id] = {};
				}
				data.cache['tab' + sender.tab.id]['frame' + frameCount] = request.timing;
				chrome.storage.local.set(data);
				sendResponse({
					id : frameCount
				});
			});
		break;

		case 'get':
			chrome.storage.local.get('cache', function(data) {
				var t = data.cache['tab' + sender.tab.id]['frame' + request.id];
				sendResponse(t);
			});
		break;

		case 'delete':
			chrome.storage.local.get('cache', function(data) {
				if (data.cache && data.cache['tab' + sender.tab.id]['frame' + request.id]) {
					delete data.cache['tab' + sender.tab.id]['frame' + request.id];
					chrome.storage.local.set(data);
				}
			});
		break;

		case 'badge':

			chrome.storage.local.get('cache', function(data) {
				if ( !data.cache) {
					data.cache = {};
				}
				if ( !data.cache['tab' + sender.tab.id]) {
					data.cache['tab' + sender.tab.id] = {};
				}
				data.cache['tab' + sender.tab.id]['top'] = request.timing;
				chrome.storage.local.set(data);
			});

			chrome.browserAction.setBadgeText({
				text : request.time,
				tabId : sender.tab.id
			});

			chrome.browserAction.setBadgeBackgroundColor({
				color : request.timing['color'],
				tabId : sender.tab.id
			});

		break;
	}

	return true;
});

// cache eviction
chrome.tabs.onRemoved.addListener(function(tabId) {
	chrome.storage.local.get('cache', function(data) {
		if (data.cache) {
			delete data.cache['tab' + tabId];
		}
		chrome.storage.local.set(data);
	});
});
