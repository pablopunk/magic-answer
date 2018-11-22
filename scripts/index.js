/* global Tesseract, OCRAD */

// Elements
const progressText = document.getElementById('progress-text')
const progressBar = document.getElementById('progress-bar')
const video = document.getElementById('player')
const canvas = document.getElementById('canvas')
const context = canvas.getContext('2d')

const width = 360 // to scale height

// Functions
const handleSuccess = stream => {
  video.srcObject = stream
  video.play()
}
// const getResultsFromCanvas = _ => Tesseract.recognize(canvas, { lang: 'spa' })
const getResultsFromCanvas = _ => new Promise((resolve, reject) => OCRAD(canvas, resolve))
const takePictureClicked = _ => {
  context.drawImage(video, 0, 0, canvas.width, canvas.height)
  progressBar.value = 0
  progressText.innerText = 'Processing...'
  getResultsFromCanvas()
    .then((text) => {
      document.getElementById('results').innerText = text
      progressText.innerText = 'Done!'
    })
    // .progress(({ status, progress }) => {
    //   if (progress) {
    //     progressBar.value = progress * 100
    //   }
    //   progressText.innerText = status
    // })
    .catch(err => { progressText.innerText = err.message })
}

let devices = []
const getCamera = (n = 0) => {
  navigator.mediaDevices.enumerateDevices().then(_devices => {
    devices = _devices.filter(_ => _.kind === 'videoinput')
    navigator.mediaDevices
      .getUserMedia({
        width: 1080,
        height: 1920,
        video: {
          deviceId: {
            exact: devices[n].deviceId
          }
        }
      })
      .then(handleSuccess)
  })
}

let cameraN = 0
const nextCameraClicked = _ => {
  cameraN++
  if (cameraN >= devices.length) {
    cameraN = 0
  }

  getCamera(cameraN)
}

// Listeners
document
  .getElementById('takepicture')
  .addEventListener('click', takePictureClicked)
document
  .getElementById('nextcamera')
  .addEventListener('click', nextCameraClicked)
video
  .addEventListener('canplay', _ => {
    const height = video.videoHeight / (video.videoWidth / width)
    video.setAttribute('width', width)
    video.setAttribute('height', height)
    canvas.setAttribute('width', width)
    canvas.setAttribute('height', height)
  })

getCamera(0)
