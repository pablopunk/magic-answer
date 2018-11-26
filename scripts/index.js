/* global Tesseract */

// Classes

const ui = new UI()
function UI () {
  this.canvas = document.getElementById('canvas')
  this.progressText = document.getElementById('progress-text')
  this.progressBar = document.getElementById('progress-bar')
  this.video = document.getElementById('player')
  this.canvas = document.getElementById('canvas')
  this.context = this.canvas.getContext('2d')
  this.width = '100vh'
  this.handleVideoStream = stream => {
    this.video.srcObject = stream
    this.video.play()
  }
  this.progress = ({ status, progress }) => {
    if (progress) {
      this.progressBar.value = progress * 100
    }
    this.progressText.innerText = status
  }
  this.results = results => {
    document.getElementById('results').innerText = results.replace('\n', '')
  }
  this.takePictureClicked = _ => {
    const cropFactor = { width: 1, height: 2 }
    this.context.filter = 'grayscale(100%)'
    const sx = 0
    const sy = 0
    const sw = this.canvas.width / cropFactor.width
    const sh = this.canvas.height / cropFactor.height
    const dx = sx
    const dy = sy
    const dw = sw
    const dh = sh

    console.log(this.canvas.width, this.canvas.height)
    console.log(
      sx, sy, sw, sh, dx, dy, dw, dh
    )

    this.context.drawImage(
      this.video,
      sx, sy, sw, sh, dx, dy, dw, dh
    )
    this.progress({ status: 'Processing...', progress: 0 })
    imageToText
      .getText()
      .then(({ text }) => {
        this.results(text)
        this.progress({ status: 'Done!', progress: 1 })
      })
      .progress(this.progress)
      .catch(err => {
        this.progress({ status: err.message })
      })
  }
}

const imageToText = new ImageToText(ui.canvas)
function ImageToText (canvas) {
  this.canvas = canvas
  this.getText = _ => Tesseract.recognize(this.canvas, { lang: 'spa' })
}

const camera = new Camera()
function Camera () {
  this.devices = []
  this.selected = 0
  this.getCamera = (n = 0) => {
    navigator.mediaDevices.enumerateDevices().then(_devices => {
      this.devices = _devices.filter(_ => _.kind === 'videoinput')
      navigator.mediaDevices
        .getUserMedia({
          width: 1080,
          height: 1920,
          video: {
            deviceId: {
              exact: this.devices[n].deviceId
            }
          }
        })
        .then(ui.handleVideoStream)
    })
  }
  this.next = _ => {
    this.selected++
    if (this.selected >= this.devices.length) {
      this.selected = 0
    }
    this.getCamera(this.selected)
  }
}

// Listeners
document
  .getElementById('takepicture')
  .addEventListener('click', ui.takePictureClicked)
document
  .getElementById('nextcamera')
  .addEventListener('click', _ => camera.next())
ui.video.addEventListener('canplay', _ => {
  const height = ui.video.videoHeight / (ui.video.videoWidth / ui.width)
  ui.video.setAttribute('width', ui.width)
  ui.video.setAttribute('height', height)
  ui.canvas.setAttribute('width', ui.width)
  ui.canvas.setAttribute('height', height)
})

camera.getCamera(0)
