import { useRef, useEffect, useState } from 'react'
import * as faceapi from "face-api.js";
// import * as canvas from 'canvas';
import './App.css'

function App() {

  const videoRef = useRef();
  const canvasRef= useRef();

  const [output, setOutput] = useState({angry:0, happy:0, fearful:0, disgusted: 0, sad: 0, neutral: 0, surprised:0});

  console.log(output);

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
    .then(() => {
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
        width: '900px',
        height : '640px'
      })

      try {
          if(detections[0])
            setOutput(detections[0]['expressions']);
      }
      catch (err) {
        console.log(err.message)
      }

      const resized = faceapi.resizeResults(detections, {
        width:'900px',
        height:'640px'
      })

      faceapi.draw.drawDetections(canvasRef.current, resized)
      faceapi.draw.drawFaceLandmarks(canvasRef.current, resized)
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
      <div className="ExpressionShowCont">
        <p className='ExpressionShowEach'>Neutral   : {parseInt(output?.neutral * 100)}%</p>
        <p className='ExpressionShowEach'>Happy     : {parseInt(output?.happy * 100)}%</p>
        <p className='ExpressionShowEach'>Angry     : {parseInt(output?.angry * 100)}%</p>
        <p className='ExpressionShowEach'>Surprised : {parseInt(output?.surprised * 100)}%</p>
        <p className='ExpressionShowEach'>Sad       : {parseInt(output?.sad * 100)}%</p>
        <p className='ExpressionShowEach'>Fearful   : {parseInt(output?.fearful * 100)}%</p>
        <p className='ExpressionShowEach'>Disgusted : {parseInt(output?.disgusted * 100)}%</p>
      </div>
    </div>
  )
}

export default App
