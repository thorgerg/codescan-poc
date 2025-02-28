document.addEventListener('DOMContentLoaded', () => {
    const cameraSelect = document.getElementById('cameraSelect');

    const videoElement = document.getElementById('webcam');
    const canvasElement = document.createElement('canvas');
    const context = canvasElement.getContext('2d');
    const startScanButton = document.getElementById('scanBarcode');

    context.willReadFrequently = true;

    navigator.mediaDevices.enumerateDevices()
        .then(devices => {
            const videoDevices = devices.filter(device => device.kind === 'videoinput');

            videoDevices.forEach((device, i) => {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.text = device.label || `Camera ${i + 1}`;
                cameraSelect.appendChild(option);
            });
        })
        .catch(err => {
            console.error(err);
        });

    videoElement.addEventListener('play', () => {
        if(videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
            canvasElement.width = videoElement.videoWidth;
            canvasElement.height = videoElement.videoHeight;
            startScanning(videoElement, canvasElement, context);    
        } else {
            console.log('Video dimensions not available');
        }
    });

    startScanButton.addEventListener('click', () => {
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
                .then(stream => {
                    videoElement.srcObject = stream;
                    videoElement.play();
                })
                .catch(err => {
                    alert(`Something went wrong: ${err}`);
                });
        }
        else {
            alert('getUserMedia not supported');
        }
    });

    cameraSelect.addEventListener('change', () => {
        updateCameraStream(cameraSelect.value);
    });


    accessButton.addEventListener('click', () => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(() => navigator.mediaDevices.enumerateDevices())
            .then(devices => {
                const videoDevices = devices.filter(device => device.kind === 'videoinput');
                cameraSelect.innerHTML = '';  // Clear existing options

                videoDevices.forEach((device, index) => {
                    const option = document.createElement('option');
                    option.value = device.deviceId;
                    option.text = device.label || `Camera ${index + 1}`;
                    cameraSelect.appendChild(option);
                });

                document.body.removeChild(accessButton);  // Remove the access button after use
            })
            .catch(error => {
                console.error('Error initializing cameras.', error);
            });
    });

    
});


function startScanning(videoElement, canvasElement, context) {
    if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
    } else {
        console.log('Video dimensions not available');
        return;
    }

        setInterval(() => {
            context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
            // enhanceImage(canvasElement, context);

            Quagga.decodeSingle({
                src: canvasElement.toDataURL('image/png'),
                inputStream: {
                    size: canvasElement.width
                },
                decoder: {
                    readers: ['ean_reader']
                },
                locate: true,
                locator: {
                    halfSample: true,
                    patchSize: 'x-small'
                }
            }, (result) => {
                if (result) {
                    alert(result.codeResult.code);
                    Quagga.stop();
                    stopWebcam(videoElement);
                }
            });
        }, 100);

        alert('Scanning started');
}

function enhanceImage(canvasElement, context) {
    let imageData = context.getImageData(0, 0, canvasElement.width, canvasElement.height);
    let data = imageData.data;

    // Convert to grayscale
    // for (let i = 0; i < data.length; i += 4) {
    //     let brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
    //     data[i] = brightness; // Red
    //     data[i + 1] = brightness; // Green
    //     data[i + 2] = brightness; // Blue
    // }

    // Apply simple contrast adjustment
    const contrast = 1.2; // Contrast adjustment factor; >1 increases, <1 decreases
    const intercept = 128 * (1 - contrast);
    for (let i = 0; i < data.length; i += 4) {
        data[i] = data[i] * contrast + intercept; // Red
        data[i + 1] = data[i + 1] * contrast + intercept; // Green
        data[i + 2] = data[i + 2] * contrast + intercept; // Blue
    }

    context.putImageData(imageData, 0, 0);
}

function stopWebcam(videoElement) {
    const stream = videoElement.srcObject;
    const tracks = stream.getTracks();

    tracks.forEach(track => {
        track.stop();
    });

    videoElement.srcObject = null;
}

function updateCameraStream(deviceId) {
    const videoElement = document.getElementById('webcam');
    const constraints = {
        video: { deviceId: { exact: deviceId } }
    };

    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                videoElement.srcObject = stream;
            })
            .catch(err => {
                console.error('Error accessing the webcam.', err);
            });
    } else {
        alert('getUserMedia not supported');
    }
}