let running = false;
let status;
let fontZip;


// create download button
const downloadButton = document.createElement('a');
downloadButton.classList = 'o-button o-button--primary-big o-button-buy-flow';
downloadButton.style.marginRight = '.14286em';
setStatus('Download');
const buyButton = document.getElementsByClassName('o-button o-button--primary-big o-button-buy-flow js-button')[0];
// insert download button after buy button
buyButton.parentNode.insertBefore(downloadButton, buyButton.nextSibling);
downloadButton.addEventListener('click', function() {
	if (running) {
		alert('There is a download already in progress!');
	} else {
		running = true;
		fontZip = new JSZip();
		main();
	}
});


function main() {
	setStatus('Downloading...', '#FF6447');

	let fontObjects = [];

	const re_url = /url\(\"\/\/(.*?)\"\)/;
	const re_name = /Buy (.*?) fonts/;
	const re_meta = /Designed by (.*?) in (.*?)\./;

	let fonts = document.getElementsByClassName('font-loader-injection');
	let fontTitle = document.getElementsByClassName('m-cover__title')[0].innerText;
	let fontMeta = document.getElementsByClassName('m-cover__meta')[0].innerText.match(re_meta);
	let fontAuthor = fontMeta[1], fontYear = fontMeta[2];
	let zipName = `${fontTitle} by ${fontAuthor} (${fontYear})`;

	for (let i = 0; i < fonts.length; i++) {
		let rules = fonts[i].sheet.cssRules;
		for (let j = 0; j < rules.length; j++) {
			let style = rules[j].style;
			let fontId = style.fontFamily.replaceAll('\"', '');
			let fontUrl = style.src.match(re_url);
			if (fontUrl && !fontId.includes('FSFallback')) {
				fontObjects.push({ name: '', id: fontId, url: 'https://' + fontUrl[1], base64: '' });
			}
		}
	}

	// populate font name fields
	for (obj of fontObjects) {
		let fontElement = document.querySelector(`span[data-fontfamily="${obj.id}"]`);
		let fontName = fontElement.title.match(re_name)[1];
		obj.name = fontName;
	}

	chrome.runtime.sendMessage(
		{ array: fontObjects },
		array => {
			// add all fonts to ZIP
			array.forEach(obj => fontZip.file(
				obj.name + '.woff',
				obj.base64,
				{ base64: true }
			));
			// serve ZIP to user
			download(fontZip, zipName);
		}
	);
}


function download(zip, name) {
	zip.generateAsync({ type:'blob' }).then(blob => {
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.style.display = 'none';
		a.href = url;
		a.download = name + '.zip';
		document.body.appendChild(a);
		a.click();
		window.URL.revokeObjectURL(url);
		setStatus('Downloaded!', '#71E690');
		running = false;
	});
}


// helper function to update download button text
function setStatus(text, color = null) {
	downloadButton.style.backgroundColor = downloadButton.style.borderColor = color;
	downloadButton.innerText = text;
}