let video = document.getElementById("video");
let canvas = document.body.appendChild(document.createElement("canvas"));
let ctx = canvas.getContext("2d");
let displaySize;

let width = 1280;
let height = 720;

const startSteam = () => {
    console.log("----- START STEAM ------");
    navigator.mediaDevices.getUserMedia({
        video: {width, height},
        audio : false
    }).then((steam) => {video.srcObject = steam});
}

console.log(faceapi.nets);

console.log("----- START LOAD MODEL ------");
Promise.all([
    faceapi.nets.ageGenderNet.loadFromUri('models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('models'),
    faceapi.nets.tinyFaceDetector.loadFromUri('models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('models'),
    faceapi.nets.faceExpressionNet.loadFromUri('models')
]).then(startSteam);


async function detect() {
    const detections = await faceapi.detectAllFaces(video)
                                .withFaceLandmarks()
                                .withFaceExpressions()
                                .withAgeAndGender();
    //console.log(detections);
    
    ctx.clearRect(0,0, width, height);
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

    console.log(resizedDetections);
    resizedDetections.forEach(result => {
        const {age, gender, genderProbability} = result;
        new faceapi.draw.DrawTextField ([
            `${Math.round(age,0)} Tahun`,
            `${gender} ${Math.round(genderProbability)}`
        ],
        result.detection.box.bottomRight
        ).draw(canvas);
    });
}

video.addEventListener('play', ()=> {
    displaySize = {width, height};
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(detect, 100);
})