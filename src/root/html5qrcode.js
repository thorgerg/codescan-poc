const html5QrCode = new Html5Qrcode("reader");
const qrCodeSuccessCallback = (decodedText, decodedResult) => {
    onScanSuccess(decodedText, decodedResult);
};
const config = { fps: 10, qrbox: { width: 400, height: 400 } };

// back camera
html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback);

function onScanSuccess(decodedText, decodedResult) {
    alert(`Scan result: ${decodedText}`, decodedResult);
    html5QrCode.stop();
}

function onScanFailure(error) {
    console.log(`Scan error: ${error}`);
}

// let html5QrcodeScanner = new Html5QrcodeScanner(
//     "reader",
//     { fps: 10, qrbox: {width: 400, height: 400} },
//     /* verbose= */ false);
// html5QrcodeScanner.render(onScanSuccess, onScanFailure);