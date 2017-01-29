(function() {
	if (document.readyState == 'complete') {
		measure();
	}
	else {
		window.addEventListener('load', measure);
	}

	function measure() {
		setTimeout(function() {
			var t = performance.timing;
			var start = t.redirectStart == 0 ? t.fetchStart : t.redirectStart;
			if (t.loadEventEnd > 0) {
				var frameId = null;

				var time = String(((t.loadEventEnd - start) / 1000).toPrecision(3)).substring(0, 4);

				var timing = {};
				for ( var p in t) {
					if ( typeof (t[p]) !== 'function') {
						timing[p] = t[p];
					}
				}

				var newDiv = document.createElement('div');
				newDiv.id = "ext_page_load_time";

				// label colors
				if (t.loadEventEnd - start > 1000) {
					if (t.loadEventEnd - start > 3000) {
						// TODO options console.error(time + ' | ' + window.location.href);
						if (t.loadEventEnd - start > 5000) {
							newDiv.className = 'ext_page_load_time ext_page_load_time_error ext_page_load_time_bold';
						}
						else {
							newDiv.className = 'ext_page_load_time ext_page_load_time_error';
						}
						timing['color'] = [120, 0, 0, 100];
					}
					else {
						// TODO options console.warn(time + ' | ' + window.location.href);
						newDiv.className = 'ext_page_load_time ext_page_load_time_warn';
						timing['color'] = [210, 210, 80, 90];
					}
				}
				else {
					// TODO options console.log(time + ' | ' + window.location.href);
					newDiv.className = 'ext_page_load_time';
					timing['color'] = [80, 80, 80, 70];
				}

				// Show timing details iframe
				newDiv.onclick = function() {
					// Double click handling
					if (newDiv.timerID) {
						clearTimeout(newDiv.timerID);
						newDiv.timerID = null;
					}
					else {
						newDiv.timerID = setTimeout(function() {
							newDiv.timerID = null;

							if (frameId) {
								var iframe = document.getElementById('ext_page_load_time_popup' + frameId);
								if (iframe) {
									iframe.parentNode.removeChild(iframe);
								}
								chrome.runtime.sendMessage({
									action : 'delete',
									id : frameId
								});
								frameId = null;
							}
							else {
								// Send timings to background and get frameId for timings
								chrome.runtime.sendMessage({
									action : 'save',
									time : time,
									timing : timing
								}, function(response) {
									frameId = response.id;
									iframe = document.createElement('iframe');
									iframe.id = 'ext_page_load_time_popup' + frameId;
									iframe.className = 'ext_page_load_time_popup';
									iframe.frameBorder = 0;
									iframe.src = chrome.extension.getURL('html/popup.html') + '#' + frameId;
									// Show iframe
									document.body.appendChild(iframe);
								});
							}
						}, 250);
					}
				};

				// Remove iframe and handle
				newDiv.ondblclick = function() {
					var iframe = document.getElementById('ext_page_load_time_popup' + frameId);
					if (iframe) {
						iframe.parentNode.removeChild(iframe);
					}
					if (frameId) {
						chrome.runtime.sendMessage({
							action : 'delete',
							id : frameId
						});
						frameId = null;
					}
					var handle = document.getElementById('ext_page_load_time');
					handle.parentNode.removeChild(handle);
				};

				// TODO options
				newDiv.appendChild(document.createTextNode(time));
				document.body.appendChild(newDiv);

				// Show Tab load time on toolbar
				if (window == top.window) {
					chrome.runtime.sendMessage({
						action : "badge",
						time : time,
						timing : timing
					});
				}
			}
		}, 0);
	}
})();
