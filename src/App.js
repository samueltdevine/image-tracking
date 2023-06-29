import { ARAnchor, ARView } from "react-three-mind";
import cover from './cover.mind'
import multiTargets from './multiTargets.mind'
import { useThree, } from "@react-three/fiber";
import * as THREE from "three";
import {useState} from 'react'
import { useSpring, animated, config, useTrail, useSpringRef } from '@react-spring/three'
import { PlaneGeometry } from '@react-three/drei'
import {NumberKeyframeTrack, ColorKeyframeTrack, AnimationClip} from 'three'

function degToRad(degrees) {
  var pi = Math.PI;
  return degrees * (pi / 180);
}

function StartUi(){
  const [ start, setStart] = useState(false)

  return(<>
  <div className={"flex"} id={"header"} style={{ display: start ? "none" : "flex"}}>
			<div className={"header-box"}></div>
			<div> 
     			 <button onClick={setStart} className={"button"} id={"startButton"}>Start</button>
			</div>
			<div></div>
	  	</div>
  </>)
}

let soundPlayed = false;
const rotBack = degToRad(33);


function CoverTarget(){
  const {gl, scene, camera} = useThree()

  const videos = [];

const idToVideoMat = (id, depthTest) => {
  const video = document.getElementById(id);
  videos.push(video);
  const texture = new THREE.VideoTexture(video);
  texture.format = THREE.RGBAFormat;
  const materialVideo = new THREE.MeshBasicMaterial({
    map: texture,
    alphaMap: texture,
    transparent: true,
    opacity: 100,
    side: THREE.DoubleSide,
    depthWrite: true,
    depthTest: depthTest,
  });
  return materialVideo;
};




const coverGroup = new THREE.Group();



const geoYellow = new THREE.PlaneGeometry(7.0, 6.72);
const yellowMat = idToVideoMat("videoYellow", false);
const planeYellow = new THREE.Mesh(geoYellow, yellowMat);


const geoPink = new THREE.PlaneGeometry(7.0, 6.72);
const pinkMat = idToVideoMat("videoPink", true);
const planePink = new THREE.Mesh(geoPink, pinkMat);


const geoOrange = new THREE.PlaneGeometry(7.0, 6.72);
const orangeMat = idToVideoMat("videoOrange", false);
const planeOrange = new THREE.Mesh(geoOrange, orangeMat);


const geoGreen = new THREE.PlaneGeometry(7.0, 6.72);
const greenMat = idToVideoMat("videoGreen", false);
const planeGreen = new THREE.Mesh(geoGreen, greenMat);


  const start = async () => {

  const header = document.getElementById("header");
  

  header.style.display = "none";
  const container = document.querySelector("#container");
  container.style.display = "block";

};
const listener = new THREE.AudioListener();

camera.add(listener);


const sound = new THREE.Audio(listener);


const audioLoader = new THREE.AudioLoader();
audioLoader.load("/CLM.mp3", function (buffer) {
  sound.setBuffer(buffer);
  sound.setLoop(false);
  sound.setVolume(0.2);
});

const [trails, api] = useTrail(
  4,
    () => ({ scale: 0,
    config: config.wobbly
  }),
  []
)


const handleCover = (prop) => {
    api.start({scale: prop.scale})
  }
  return(
    <>
  <ambientLight />
  <pointLight position={[10, 10, 10]} />
  <ARAnchor
  target={1}
  
  onAnchorFound={() => {
    gl.setClearColor(0x272727, 0.95)
  // fadeOnAction.play()
  videos.forEach((video) => video.play()); 
  let prop = {scale: 0.0}
  handleCover(prop)
  prop.scale = 0.7
  handleCover(prop)
  if (soundPlayed === false){
  soundPlayed = true
  console.log(soundPlayed, true)
  sound.play()
  }
}}
  onAnchorLost={() => {
    gl.setClearColor(0x272727, 0.0)
    let prop = {scale: 0.0}
    handleCover(prop)
    }}>
    <animated.mesh position={[-.35,0,-.10]} material={pinkMat} scale={trails[3].scale}>
      <planeGeometry  args={[1, 1, 1]}/>
    </animated.mesh>
    <animated.mesh position={[0,-.10,0]} material={greenMat} scale={trails[0].scale}>
      <planeGeometry  args={[1, 1, 1]}/>
    </animated.mesh>
    <animated.mesh position={[-.3,0,0]} material={yellowMat} scale={trails[1].scale}>
      <planeGeometry  args={[1, 1, 1]}/>
    </animated.mesh>
    <animated.mesh position={[.3,0, -.2]} material={orangeMat} scale={trails[2].scale}>
      <planeGeometry  args={[1, 1, 1]}/>
    </animated.mesh>
  </ARAnchor>
    </>
  )
}

const color = new THREE.Color(0x272727)
const alpha = 0.95



function App() {
  return (
    <>
    <StartUi/>
    <ARView
      imageTargets={multiTargets}
      filterMinCF={.00005}
      filterBeta={.001}
      missTolerance={10}
      warmupTolerance={0}
      >
   <CoverTarget/>
    </ARView>
      </>
  );
}

export default App;
