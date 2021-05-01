async function addB64(array) {
	const toDataURL = url => fetch(url)
		.then(response => response.blob())
		.then(blob => new Promise(resolve => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result);
			reader.readAsDataURL(blob);
		}))
		.catch(error => { console.log(error) });

	// populate base64 fields
	let i = 1;
	for (let obj of array) {
		console.log(`[${i++}/${array.length}] downloading ${obj.url} as '${obj.name}.woff'`);
		await toDataURL(obj.url).then(encoding => {
			obj.base64 = encoding.split(',')[1];
		});
	}

	return array;
}


// respond to message from zip() in content.js
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		addB64(request.array).then(updatedArray => sendResponse(updatedArray));
		return true;
	}
);