import { useRef, useEffect } from 'react'
import * as faceapi from "face-api.js";
// import * as canvas from 'canvas';
import './App.css'

function App() {

  const videoRef = useRef();
  const canvasRef= useRef();

  useEffect(() => {
    startVideo();

    videoRef && loadModals()

  })

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({video: true})
    .then((currentStream) => {
      videoRef.current.srcObject = currentStream;
    })
    .catch(err => {
      console.log(err.message);
    })
  }

  const loadModals = () => {
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceExpressionNet.loadFromUri("/models")
    ])
    .then((resp) => {
        console.log("RESP: ", resp);
      faceMyDetect();
    })
    .catch (err => {
      console.log("Error: ",err.message);
    })
  }

  const faceMyDetect = async () => {
    console.log("CALLED FaceMyDetect")
    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(videoRef.current,
        new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()

      canvasRef.current.innerHtml = faceapi.createCanvasFromMedia(videoRef.current)

      faceapi.matchDimensions(canvasRef.current, {
        width: '900',
        height : '640'
      })

      console.log("detections: ", detections);

      const resized = faceapi.resizeResults(detections, {
        width:'900',
        height:'640'
      })

      faceapi.draw.drawDetections(canvasRef.current, resized)
      // faceapi.draw.drawFaceLandmarks(canvasRef.current, resized)
      faceapi.draw.drawFaceExpressions(canvasRef.current, resized)

    }, 1000)
  }

  return (
    <div className='ExpressionDetectionWholeCont' >
      {/* <h1 className='ExpressionDetectionTitle'>Expression detection</h1> */}
      <div className="ExpressionDetectionVideoCont">
        <video className='ExpressionDetectionVideo' crossOrigin='anonymous' ref={videoRef} autoPlay />
      <canvas ref={canvasRef} width='900' height='640' className='ExpressionDetectionCanvasCont' />
      </div>
    </div>
  )
}

export default App
