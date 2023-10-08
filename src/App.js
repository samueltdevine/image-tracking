import { ARAnchor, ARView } from "react-three-mind";
import cover from "./cover.mind";
import multiTargets from "./multiTargets7.mind";
// import multiTargets2 from "./multiTargets_lastHalf.mind";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Compiler } from "mind-ar/src/image-target/compiler";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  useSpring,
  animated,
  config,
  useTrail,
  useSpringRef,
} from "@react-spring/three";
import { PlaneGeometry, Text3D } from "@react-three/drei";
import { NumberKeyframeTrack, ColorKeyframeTrack, AnimationClip } from "three";

function degToRad(degrees) {
  var pi = Math.PI;
  return degrees * (pi / 180);
}

function useTimeout(callback, delay) {
  const savedCallback = useRef(callback);

  // Remember the latest callback if it changes.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the timeout.
  useEffect(() => {
    // Don't schedule if no delay is specified.
    if (delay === null) {
      return;
    }

    const id = setTimeout(() => savedCallback.current(), delay);

    return () => clearTimeout(id);
  }, [delay]);
}

function StartUi() {
  const [start, setStart] = useState(false);

  return (
    <>
      <div
        className={"flex"}
        id={"header"}
        style={{ display: start ? "none" : "flex" }}
      >
        <div className={"header-box"}></div>
        <div>
          <button onClick={setStart} className={"button"} id={"startButton"}>
            Start
          </button>
        </div>
        <div></div>
      </div>
    </>
  );
}

let soundPlayed = false;
const rotBack = degToRad(33);

const videoLibrary = [];

const handleVideoLibrary = (targetIndex) => {
  const targetIndexInt = targetIndex.targetIndex;
  const empty = [];
  videoLibrary.push(empty);

  return { targetIndexInt };
};

const idToVideoMat = (id, depthTest, targetIndexInt) => {
  const video = document.getElementById(id);
  console.log("targetIndexInt", targetIndexInt);
  if (videoLibrary[targetIndexInt] === undefined) {
    videoLibrary[targetIndexInt] = [];
  }
  videoLibrary[targetIndexInt].push(video);
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
    toneMapped: false,
  });
  return materialVideo;
};

const fontPath = "/Nunito_Medium_Regular.json";

const Group = (props) => {
  return <group {...props}>{props.children}</group>;
};

const AnimatedGroup = animated(Group);

const AnimatedText3D = animated(Text3D);

const SampleSpacerGroup = (props) => {
  const { setLengths, lengths, position } = props;
  const groupRef = useRef();

  useEffect(() => {
    const tmpLengths = [];
    const wordArray = groupRef.current.children;
    const multiplier = 50.0;

    wordArray.forEach((word, index) => {
      const boundingBox = new THREE.Box3().setFromObject(word);
      const length = boundingBox.max.x - boundingBox.min.x;
      const spacing = 1;

      const lengthNormalized = length * multiplier + spacing;
      tmpLengths.push(lengthNormalized);
    });

    setLengths(tmpLengths);
  }, []);

  // const sum = lengths.reduce((partialSum, a) => partialSum + a, 0);
  // const negSum = sum * -1.0;
  return (
    <group ref={groupRef} scale={props.scale}>
      {props.children}
    </group>
  );
};

const SpacerGroup = (props) => {
  const { lengths, position, delayMS } = props;
  const groupRef = useRef();
  useEffect(() => {
    // async function renderDelayedText (){
    //   await sleep(delayMS)
    // setTimeout(()=>{
    const wordArray = groupRef.current.children;
    wordArray.forEach((word, index) => {
      const lengthsAccum = lengths.map((elem, index) =>
        lengths.slice(0, index + 1).reduce((a, b) => a + b)
      );
      const currentLength = lengths[index];
      const halfCurrentLength = currentLength * -0.5;
      const currentSpacing = lengthsAccum[index] + halfCurrentLength;
      // const currentLength = lengthsAccum[index] - lengths[index];
      const child = word.children[0];
      const childInner = child.children[0];
      childInner.position.set(halfCurrentLength, 0, 0);
      child.position.set(currentSpacing, 0, 0);
      // child.position.set(halfCurrentLength, 0, 0);
      console.log("word", word.position, child.position);
      // box.getCenter(word.position);
    });
    // setIsDelaying(false)
    // },delayMS)
    // console.log("isDelaying", isDelaying)

    // }
  }, []);
  // useEffect(()=>{

  //   setTimeout(()=>{
  //     setIsDelaying(false)
  //   },delayMS)
  //   },[])

  return (
    <group ref={groupRef} position={position} scale={props.scale}>
      {props.children}
    </group>
  );
  // useTimeout()
  // console.log("yo else")
};

function BouncyText(props) {
  const { scale, position, delayMS, onClick } = props;
  // onClick()
  const [isDelaying, setIsDelaying] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setIsDelaying(false);
    }, delayMS);
  }, []);
  const startingText = props.children;
  const regex = /\S+\s*/g;
  const textArray = startingText.match(regex);
  const wordCount = textArray.length;

  const spring = useSpring({
    from: { scale: [0, 0, 0], position: [0, -1.0, 0] },
    to: { scale: [1, 1, 1], position: [0, 0, 0] },
    config: {
      friction: 10,
    },
    delay: 2000,
  });

  const trails = useTrail(wordCount, {
    from: { scale: [0, 0, 0], position: [0, -3.0, 0] },
    to: { scale: [1, 1, 1], position: [0, 0, 0] },
    config: {
      friction: 10,
    },
    delay: 500,
    pause: isDelaying,
  });

  const [lengths, setLengths] = useState([]);

  if (lengths.length == 0) {
    return (
      <SampleSpacerGroup
        scale={scale}
        lengths={lengths}
        setLengths={setLengths}
      >
        {textArray.map((text, index) => (
          <AnimatedText3D font={fontPath} scale={1.0}>
            {text}
          </AnimatedText3D>
        ))}
      </SampleSpacerGroup>
    );
  } else {
    return (
      <SpacerGroup
        scale={scale}
        lengths={lengths}
        position={position}
        delayMS={delayMS}
      >
        {textArray.map((text, index) => (
          <AnimatedGroup scale={1} position={trails[index].position}>
            <AnimatedGroup
              // scale={1}
              scale={isDelaying ? 0.0 : trails[index].scale}
            >
              <AnimatedText3D
                font={fontPath}
                // scale={1}
                // position={trails[index].position}
              >
                {text}
              </AnimatedText3D>
            </AnimatedGroup>
          </AnimatedGroup>
        ))}
      </SpacerGroup>
    );
  }
}

const PageToggle = (props) => {
  const { soundAndScale, active, setActive } = props;
  const [isPlaying, setIsPlaying] = useState(false);
  console.log("children", props.children);
  return (
    <group {...props}>
      {active ? (
        props.children
      ) : (
        <group
          onClick={() => {
            soundAndScale();
            setIsPlaying(true);
          }}
        >
          <group scale={1}>
            <BouncyText delayMS={0} position={[0.25, 0.0, 0.0]} scale={0.02}>
              {"Play"}
            </BouncyText>
          </group>
        </group>
      )}
    </group>
  );
};

function CoverTarget(targetIndex) {
  const { gl, scene, camera } = useThree();

  const { targetIndexInt } = handleVideoLibrary(targetIndex);

  const coverGroup = new THREE.Group();

  const geoYellow = new THREE.PlaneGeometry(7.0, 6.72);
  const yellowMat = idToVideoMat("videoYellow", false, targetIndexInt);
  const planeYellow = new THREE.Mesh(geoYellow, yellowMat);

  const geoPink = new THREE.PlaneGeometry(7.0, 6.72);
  const pinkMat = idToVideoMat("videoPink", true, targetIndexInt);
  const planePink = new THREE.Mesh(geoPink, pinkMat);

  const geoOrange = new THREE.PlaneGeometry(7.0, 6.72);
  const orangeMat = idToVideoMat("videoOrange", false, targetIndexInt);
  const planeOrange = new THREE.Mesh(geoOrange, orangeMat);

  const geoGreen = new THREE.PlaneGeometry(7.0, 6.72);
  const greenMat = idToVideoMat("videoGreen", false, targetIndexInt);
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
    () => ({ scale: 0, config: config.wobbly }),
    []
  );

  const handleCover = (prop) => {
    api.start({ scale: prop.scale });
  };
  return (
    <>
      <ARAnchor
        target={targetIndexInt}
        onAnchorFound={() => {
          gl.setClearColor(0x272727, 0.95);
          videoLibrary[targetIndexInt].forEach((video) => video.play());
          let prop = { scale: 0.0 };
          handleCover(prop);
          prop.scale = 0.7;
          handleCover(prop);
          if (soundPlayed === false) {
            soundPlayed = true;
            console.log(soundPlayed, true);
            sound.play();
          }
        }}
        onAnchorLost={() => {
          gl.setClearColor(0x272727, 0.0);
          let prop = { scale: 0.0 };
          handleCover(prop);
        }}
      >
        <AnimatedGroup scale={0.7} position={[0.0, -0.05, 0]}>
          <animated.mesh
            position={[-0.35, 0, -0.1]}
            material={pinkMat}
            scale={trails[3].scale}
          >
            <planeGeometry args={[1, 1, 1]} />
          </animated.mesh>
          <animated.mesh
            position={[0, -0.1, 0]}
            material={greenMat}
            scale={trails[0].scale}
          >
            <planeGeometry args={[1, 1, 1]} />
          </animated.mesh>
          <animated.mesh
            position={[-0.3, 0, 0]}
            material={yellowMat}
            scale={trails[1].scale}
          >
            <planeGeometry args={[1, 1, 1]} />
          </animated.mesh>
          <animated.mesh
            position={[0.3, 0, -0.2]}
            material={orangeMat}
            scale={trails[2].scale}
          >
            <planeGeometry args={[1, 1, 1]} />
          </animated.mesh>
        </AnimatedGroup>
      </ARAnchor>
    </>
  );
}

function SpreadOne(targetIndex) {
  const { gl, scene, camera } = useThree();

  const { targetIndexInt } = handleVideoLibrary(targetIndex);
  const coverGroup = new THREE.Group();

  // const geoCouch = new THREE.PlaneGeometry(7.0, 6.72);
  // const couchMat = idToVideoMat("videoCouch", true, targetIndexInt);
  // const planeCouch = new THREE.Mesh(geoCouch, couchMat);

  // const geoRocket = new THREE.PlaneGeometry(7.0, 6.72);
  // const rocketMat = idToVideoMat("videoRocket", true, targetIndexInt);
  // const planeRocket = new THREE.Mesh(geoRocket, rocketMat);

  // const geoCouchText = new THREE.PlaneGeometry(26.51, 10.8);
  // const couchTextMat = idToVideoMat("videoCouchText", true, targetIndexInt);
  // const planeCouchText = new THREE.Mesh(geoCouchText, couchTextMat);

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
    () => ({ videoScale: 0, config: config.wobbly }),
    []
  );
  const handleCover = (prop) => {
    api.start({ videoScale: prop.scale });
  };
  return (
    <>
      <ARAnchor
        target={targetIndexInt}
        onAnchorFound={() => {
          gl.setClearColor(0x272727, 0.95);
          // fadeOnAction.play()
          videoLibrary[targetIndexInt].forEach((video) => video.play());
          let prop = { scale: 0.0 };
          handleCover(prop);
          prop.scale = 0.5;
          handleCover(prop);
          // if (soundPlayed === false) {
          //   soundPlayed = true;
          //   console.log(soundPlayed, true);
          sound.play();
          // }
        }}
        onAnchorLost={() => {
          gl.setClearColor(0x272727, 0.0);
          let prop = { scale: 0.0 };
          handleCover(prop);
        }}
      >
        {/* <animated.mesh
          position={[-0.2, 0, 0]}
          material={couchMat}
          scale={trails[3].videoScale}
        >
          <planeGeometry args={[1, 1, 1]} />
        </animated.mesh>
        <animated.mesh
          position={[0.2, 0, 0.01]}
          material={rocketMat}
          scale={trails[0].videoScale}
        >
          <planeGeometry args={[1, 1, 1]} />
        </animated.mesh> */}
        {/* <BouncyText delayMS={1000} position={[-0.3, 0.2, 0.1]} scale={0.02}>
          Welcome to Creative Little Monsters
        </BouncyText> */}

        {/* <animated.mesh
          position={[0, 0, 0.1]}
          material={couchTextMat}
          scale={0.5}
        >
          <planeGeometry args={[2, 1, 1]} />
        </animated.mesh> */}
      </ARAnchor>
    </>
  );
}

function SpreadTwo(targetIndex) {
  const { gl, scene, camera } = useThree();

  const { targetIndexInt } = handleVideoLibrary(targetIndex);
  const coverGroup = new THREE.Group();

  // const geoCouch = new THREE.PlaneGeometry(7.0, 6.72);
  // const couchMat = idToVideoMat("videoCouch", true, targetIndexInt);
  // const planeCouch = new THREE.Mesh(geoCouch, couchMat);

  // const geoRocket = new THREE.PlaneGeometry(7.0, 6.72);
  // const rocketMat = idToVideoMat("videoRocket", true, targetIndexInt);
  // const planeRocket = new THREE.Mesh(geoRocket, rocketMat);

  // const geoCouchText = new THREE.PlaneGeometry(26.51, 10.8);
  // const couchTextMat = idToVideoMat("videoCouchText", true, targetIndexInt);
  // const planeCouchText = new THREE.Mesh(geoCouchText, couchTextMat);

  const listener = new THREE.AudioListener();

  camera.add(listener);

  const sound = new THREE.Audio(listener);

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("/Read_01.mp3", function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(0.2);
  });

  const [trails, api] = useTrail(
    4,
    () => ({ videoScale: 0, config: config.wobbly }),
    []
  );
  const handleCover = (prop) => {
    api.start({ videoScale: prop.scale });
  };
  return (
    <>
      <ARAnchor
        target={targetIndexInt}
        onAnchorFound={() => {
          gl.setClearColor(0x272727, 0.95);
          // fadeOnAction.play()
          videoLibrary[targetIndexInt].forEach((video) => video.play());
          let prop = { scale: 0.0 };
          handleCover(prop);
          prop.scale = 0.5;
          handleCover(prop);
          // if (soundPlayed === false) {
          //   soundPlayed = true;
          //   console.log(soundPlayed, true);
          sound.play();
          // }
        }}
        onAnchorLost={() => {
          gl.setClearColor(0x272727, 0.0);
          let prop = { scale: 0.0 };
          handleCover(prop);
        }}
      >
        {/* <animated.mesh
          position={[-0.2, 0, 0]}
          material={couchMat}
          scale={trails[3].videoScale}
        >
          <planeGeometry args={[1, 1, 1]} />
        </animated.mesh>
        <animated.mesh
          position={[0.2, 0, 0.01]}
          material={rocketMat}
          scale={trails[0].videoScale}
        >
          <planeGeometry args={[1, 1, 1]} />
        </animated.mesh> */}
        {/* <BouncyText delayMS={1000} position={[-0.3, 0.2, 0.1]} scale={0.02}>
          Creative little monsters are very curious.
        </BouncyText>
        <BouncyText delayMS={3000} position={[-0.3, -0.2, 0.1]} scale={0.02}>
          Rarely do they take things too serious.
        </BouncyText> */}

        {/* <animated.mesh
          position={[0, 0, 0.1]}
          material={couchTextMat}
          scale={0.5}
        >
          <planeGeometry args={[2, 1, 1]} />
        </animated.mesh> */}
      </ARAnchor>
    </>
  );
}

function SpreadThree(targetIndex) {
  const { gl, scene, camera } = useThree();
  const { targetIndexInt } = handleVideoLibrary(targetIndex);
  const coverGroup = new THREE.Group();

  // const geoCouch = new THREE.PlaneGeometry(7.0, 6.72);
  // const couchMat = idToVideoMat("videoCouch", true, targetIndexInt);
  // const planeCouch = new THREE.Mesh(geoCouch, couchMat);

  // const geoRocket = new THREE.PlaneGeometry(7.0, 6.72);
  // const rocketMat = idToVideoMat("videoRocket", true, targetIndexInt);
  // const planeRocket = new THREE.Mesh(geoRocket, rocketMat);

  // const geoCouchText = new THREE.PlaneGeometry(26.51, 10.8);
  // const couchTextMat = idToVideoMat("videoCouchText", true, targetIndexInt);
  // const planeCouchText = new THREE.Mesh(geoCouchText, couchTextMat);

  const listener = new THREE.AudioListener();

  camera.add(listener);

  const sound = new THREE.Audio(listener);

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("/Read_02.mp3", function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(0.2);
  });

  const [trails, api] = useTrail(
    4,
    () => ({ videoScale: 0, config: config.wobbly }),
    []
  );
  const handleCover = (prop) => {
    api.start({ videoScale: prop.scale });
  };
  return (
    <>
      <ARAnchor
        target={targetIndexInt}
        onAnchorFound={() => {
          gl.setClearColor(0x272727, 0.95);
          // fadeOnAction.play()
          videoLibrary[targetIndexInt].forEach((video) => video.play());
          let prop = { scale: 0.0 };
          handleCover(prop);
          prop.scale = 0.5;
          handleCover(prop);
          // if (soundPlayed === false) {
          //   soundPlayed = true;
          //   console.log(soundPlayed, true);
          sound.play();
          // }
        }}
        onAnchorLost={() => {
          gl.setClearColor(0x272727, 0.0);
          let prop = { scale: 0.0 };
          handleCover(prop);
        }}
      >
        {/* <animated.mesh
          position={[-0.2, 0, 0]}
          material={couchMat}
          scale={trails[3].videoScale}
        >
          <planeGeometry args={[1, 1, 1]} />
        </animated.mesh>
        <animated.mesh
          position={[0.2, 0, 0.01]}
          material={rocketMat}
          scale={trails[0].videoScale}
        >
          <planeGeometry args={[1, 1, 1]} />
        </animated.mesh> */}
        {/* <BouncyText delayMS={1000} position={[-0.3, 0.2, 0.1]} scale={0.02}>
          They play with things that aren't normal toys.
        </BouncyText>
        <BouncyText delayMS={3000} position={[-0.3, 0.15, 0.1]} scale={0.02}>
          They make things that are filled with noise.
        </BouncyText>
        <BouncyText delayMS={9000} position={[-0.3, -0.15, 0.1]} scale={0.02}>
          Creative little monsters stir a delicious stew.
        </BouncyText>
        <BouncyText delayMS={12000} position={[-0.3, -0.2, 0.1]} scale={0.02}>
          Who needs a cookbook - when you're serving glue.
        </BouncyText> */}

        {/* <animated.mesh
          position={[0, 0, 0.1]}
          material={couchTextMat}
          scale={0.5}
        >
          <planeGeometry args={[2, 1, 1]} />
        </animated.mesh> */}
      </ARAnchor>
    </>
  );
}

function SpreadFour(targetIndex) {
  const { gl, scene, camera } = useThree();

  const { targetIndexInt } = handleVideoLibrary(targetIndex);
  const coverGroup = new THREE.Group();

  // const geoCouch = new THREE.PlaneGeometry(7.0, 6.72);
  // const couchMat = idToVideoMat("videoCouch", true, targetIndexInt);
  // const planeCouch = new THREE.Mesh(geoCouch, couchMat);

  // const geoRocket = new THREE.PlaneGeometry(7.0, 6.72);
  // const rocketMat = idToVideoMat("videoRocket", true, targetIndexInt);
  // const planeRocket = new THREE.Mesh(geoRocket, rocketMat);

  // const geoCouchText = new THREE.PlaneGeometry(26.51, 10.8);
  // const couchTextMat = idToVideoMat("videoCouchText", true, targetIndexInt);
  // const planeCouchText = new THREE.Mesh(geoCouchText, couchTextMat);

  const listener = new THREE.AudioListener();

  camera.add(listener);

  const sound = new THREE.Audio(listener);

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("/Read_04.mp3", function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(0.2);
  });

  const [trails, api] = useTrail(
    4,
    () => ({ videoScale: 0, config: config.wobbly }),
    []
  );
  const handleCover = (prop) => {
    api.start({ videoScale: prop.scale });
  };
  return (
    <>
      <ARAnchor
        target={targetIndexInt}
        onAnchorFound={() => {
          gl.setClearColor(0x272727, 0.95);
          // fadeOnAction.play()
          videoLibrary[targetIndexInt].forEach((video) => video.play());
          let prop = { scale: 0.0 };
          handleCover(prop);
          prop.scale = 0.5;
          handleCover(prop);
          // if (soundPlayed === false) {
          //   soundPlayed = true;
          //   console.log(soundPlayed, true);
          sound.play();
          // }
        }}
        onAnchorLost={() => {
          gl.setClearColor(0x272727, 0.0);
          let prop = { scale: 0.0 };
          handleCover(prop);
        }}
      >
        {/* <animated.mesh
          position={[-0.2, 0, 0]}
          material={couchMat}
          scale={trails[3].videoScale}
        >
          <planeGeometry args={[1, 1, 1]} />
        </animated.mesh>
        <animated.mesh
          position={[0.2, 0, 0.01]}
          material={rocketMat}
          scale={trails[0].videoScale}
        >
          <planeGeometry args={[1, 1, 1]} />
        </animated.mesh> */}
        {/* <BouncyText delayMS={1000} position={[-0.3, 0.2, 0.1]} scale={0.02}>
          They put objects together
        </BouncyText>
        <BouncyText delayMS={1500} position={[-0.3, 0.15, 0.1]} scale={0.02}>
          That don't belong.
        </BouncyText>
        <BouncyText delayMS={3000} position={[-0.3, -0.15, 0.1]} scale={0.02}>
          The best part of being creative is that nothing is wrong.
        </BouncyText> */}
        {/* <BouncyText delayMS={3000} position={[-0.3, -0.2, 0.1]} scale={0.02}>
          Who needs a cookbook - when you're serving glue.
        </BouncyText> */}

        {/* <animated.mesh
          position={[0, 0, 0.1]}
          material={couchTextMat}
          scale={0.5}
        >
          <planeGeometry args={[2, 1, 1]} />
        </animated.mesh> */}
      </ARAnchor>
    </>
  );
}

function SpreadFive(targetIndex) {
  const { gl, scene, camera } = useThree();

  const { targetIndexInt } = handleVideoLibrary(targetIndex);
  const coverGroup = new THREE.Group();

  // const geoCouch = new THREE.PlaneGeometry(7.0, 6.72);
  // const couchMat = idToVideoMat("videoCouch", true, targetIndexInt);
  // const planeCouch = new THREE.Mesh(geoCouch, couchMat);

  // const geoRocket = new THREE.PlaneGeometry(7.0, 6.72);
  // const rocketMat = idToVideoMat("videoRocket", true, targetIndexInt);
  // const planeRocket = new THREE.Mesh(geoRocket, rocketMat);

  // const geoCouchText = new THREE.PlaneGeometry(26.51, 10.8);
  // const couchTextMat = idToVideoMat("videoCouchText", true, targetIndexInt);
  // const planeCouchText = new THREE.Mesh(geoCouchText, couchTextMat);

  const listener = new THREE.AudioListener();

  camera.add(listener);

  const sound = new THREE.Audio(listener);

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("/Read_05.mp3", function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(0.2);
  });

  const [trails, api] = useTrail(
    4,
    () => ({ videoScale: 0, config: config.wobbly }),
    []
  );
  const handleCover = (prop) => {
    api.start({ videoScale: prop.scale });
  };
  return (
    <>
      <ARAnchor
        target={targetIndexInt}
        onAnchorFound={() => {
          gl.setClearColor(0x272727, 0.95);
          // fadeOnAction.play()
          videoLibrary[targetIndexInt].forEach((video) => video.play());
          let prop = { scale: 0.0 };
          handleCover(prop);
          prop.scale = 0.5;
          handleCover(prop);
          // if (soundPlayed === false) {
          //   soundPlayed = true;
          //   console.log(soundPlayed, true);
          sound.play();
          // }
        }}
        onAnchorLost={() => {
          gl.setClearColor(0x272727, 0.0);
          let prop = { scale: 0.0 };
          handleCover(prop);
        }}
      >
        {/* <animated.mesh
          position={[-0.2, 0, 0]}
          material={couchMat}
          scale={trails[3].videoScale}
        >
          <planeGeometry args={[1, 1, 1]} />
        </animated.mesh>
        <animated.mesh
          position={[0.2, 0, 0.01]}
          material={rocketMat}
          scale={trails[0].videoScale}
        >
          <planeGeometry args={[1, 1, 1]} />
        </animated.mesh> */}
        {/* <BouncyText delayMS={1000} position={[-0.3, 0.2, 0.1]} scale={0.02}>
          Creative little monsters find something that's broke.
        </BouncyText>
        <BouncyText delayMS={3000} position={[-0.3, 0.15, 0.1]} scale={0.02}>
          They try to fix it with something else -
        </BouncyText>
        <BouncyText delayMS={6000} position={[-0.3, 0.1, 0.1]} scale={0.02}>
          "Hey, how about that artichoke!"
        </BouncyText>
        <BouncyText delayMS={9000} position={[-0.3, -0.15, 0.1]} scale={0.02}>
          Sometimes their inventions are stranger than fiction.
        </BouncyText>
        <BouncyText delayMS={11000} position={[-0.3, -0.2, 0.1]} scale={0.02}>
          When others laugh, it's fine, they just smile with conviction.
        </BouncyText> */}
        {/* <BouncyText delayMS={3000} position={[-0.3, -0.2, 0.1]} scale={0.02}>
          Who needs a cookbook - when you're serving glue.
        </BouncyText> */}

        {/* <animated.mesh
          position={[0, 0, 0.1]}
          material={couchTextMat}
          scale={0.5}
        >
          <planeGeometry args={[2, 1, 1]} />
        </animated.mesh> */}
      </ARAnchor>
    </>
  );
}

function SpreadSix(targetIndex) {
  const { gl, scene, camera } = useThree();

  const { targetIndexInt } = handleVideoLibrary(targetIndex);
  const coverGroup = new THREE.Group();

  // const geoCouch = new THREE.PlaneGeometry(7.0, 6.72);
  // const couchMat = idToVideoMat("videoCouch", true, targetIndexInt);
  // const planeCouch = new THREE.Mesh(geoCouch, couchMat);

  // const geoRocket = new THREE.PlaneGeometry(7.0, 6.72);
  // const rocketMat = idToVideoMat("videoRocket", true, targetIndexInt);
  // const planeRocket = new THREE.Mesh(geoRocket, rocketMat);

  // const geoCouchText = new THREE.PlaneGeometry(26.51, 10.8);
  // const couchTextMat = idToVideoMat("videoCouchText", true, targetIndexInt);
  // const planeCouchText = new THREE.Mesh(geoCouchText, couchTextMat);

  const listener = new THREE.AudioListener();

  camera.add(listener);

  const sound = new THREE.Audio(listener);

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("/Read_06.mp3", function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(0.2);
  });

  const [trails, api] = useTrail(
    4,
    () => ({ videoScale: 0, config: config.wobbly }),
    []
  );
  const handleCover = (prop) => {
    api.start({ videoScale: prop.scale });
  };
  return (
    <>
      <ARAnchor
        target={targetIndexInt}
        onAnchorFound={() => {
          gl.setClearColor(0x272727, 0.95);
          // fadeOnAction.play()
          videoLibrary[targetIndexInt].forEach((video) => video.play());
          let prop = { scale: 0.0 };
          handleCover(prop);
          prop.scale = 0.5;
          handleCover(prop);
          // if (soundPlayed === false) {
          //   soundPlayed = true;
          //   console.log(soundPlayed, true);
          sound.play();
          // }
        }}
        onAnchorLost={() => {
          gl.setClearColor(0x272727, 0.0);
          let prop = { scale: 0.0 };
          handleCover(prop);
        }}
      >
        {/* <animated.mesh
          position={[-0.2, 0, 0]}
          material={couchMat}
          scale={trails[3].videoScale}
        >
          <planeGeometry args={[1, 1, 1]} />
        </animated.mesh>
        <animated.mesh
          position={[0.2, 0, 0.01]}
          material={rocketMat}
          scale={trails[0].videoScale}
        >
          <planeGeometry args={[1, 1, 1]} />
        </animated.mesh> */}
        {/* <BouncyText delayMS={1000} position={[-0.3, 0.2, 0.1]} scale={0.02}>
          Creative little mosnters are
        </BouncyText>
        <BouncyText delayMS={1500} position={[-0.3, 0.15, 0.1]} scale={0.02}>
          known to make a mess.
        </BouncyText>
        <BouncyText delayMS={3000} position={[-0.3, -0.15, 0.1]} scale={0.02}>
          Calm down, parents, it's a work in progress!
        </BouncyText> */}
        {/* <BouncyText delayMS={3000} position={[-0.3, -0.2, 0.1]} scale={0.02}>
          Who needs a cookbook - when you're serving glue.
        </BouncyText> */}

        {/* <animated.mesh
          position={[0, 0, 0.1]}
          material={couchTextMat}
          scale={0.5}
        >
          <planeGeometry args={[2, 1, 1]} />
        </animated.mesh> */}
      </ARAnchor>
    </>
  );
}

function SpreadSeven(targetIndex) {
  const { gl, scene, camera } = useThree();

  const { targetIndexInt } = handleVideoLibrary(targetIndex);
  console.log("multiTargets", multiTargets);
  console.log("compiler", Compiler);
  const coverGroup = new THREE.Group();

  const geoCouch = new THREE.PlaneGeometry(7.0, 6.72);
  const couchMat = idToVideoMat("videoCouch", true, targetIndexInt);
  const planeCouch = new THREE.Mesh(geoCouch, couchMat);

  const geoRocket = new THREE.PlaneGeometry(7.0, 6.72);
  const rocketMat = idToVideoMat("videoRocket", true, targetIndexInt);
  const planeRocket = new THREE.Mesh(geoRocket, rocketMat);

  const geoCouchText = new THREE.PlaneGeometry(26.51, 10.8);
  const couchTextMat = idToVideoMat("videoCouchText", true, targetIndexInt);
  const planeCouchText = new THREE.Mesh(geoCouchText, couchTextMat);

  const listener = new THREE.AudioListener();

  camera.add(listener);

  const sound = new THREE.Audio(listener);

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("/Read_07.mp3", function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(0.2);
  });

  const [trails, api] = useTrail(
    4,
    () => ({ videoScale: 0, config: config.wobbly }),
    []
  );
  const handleCover = (prop) => {
    api.start({ videoScale: prop.scale });
  };
  return (
    <>
      <ARAnchor
        target={targetIndexInt}
        onAnchorFound={() => {
          gl.setClearColor(0x272727, 0.9);
          // fadeOnAction.play()
          videoLibrary[targetIndexInt].forEach((video) => video.play());
          let prop = { scale: 0.0 };
          handleCover(prop);
          prop.scale = 0.5;
          handleCover(prop);
          // if (soundPlayed === false) {
          //   soundPlayed = true;
          //   console.log(soundPlayed, true);
          sound.play();
          // }
        }}
        onAnchorLost={() => {
          gl.setClearColor(0x272727, 0.0);
          let prop = { scale: 0.0 };
          handleCover(prop);
        }}
      >
        <animated.mesh
          position={[-0.2, 0, 0]}
          material={couchMat}
          scale={trails[3].videoScale}
        >
          <planeGeometry args={[1, 1, 1]} />
        </animated.mesh>
        <animated.mesh
          position={[0.2, 0, 0.01]}
          material={rocketMat}
          scale={trails[0].videoScale}
        >
          <planeGeometry args={[1, 1, 1]} />
        </animated.mesh>
        {/* <BouncyText delayMS={1000} position={[-0.3, 0.2, 0.1]} scale={0.02}>
          When creative little monsters are lonely or bored,
        </BouncyText>
        <BouncyText delayMS={3000} position={[-0.3, -0.2, 0.1]} scale={0.02}>
          They explore new worlds that money can't afford.
        </BouncyText> */}

        {/* <animated.mesh position={[0,0, 0.1]} material={couchTextMat} 
scale={0.5}
    >
      <planeGeometry  args={[2 , 1, 1]}/>
    </animated.mesh> */}
      </ARAnchor>
    </>
  );
}

function SpreadEightA(targetIndex) {
  const { gl, scene, camera } = useThree();
  gl.toneMapping = THREE.NoToneMapping;
  const { targetIndexInt } = handleVideoLibrary(targetIndex);
  const coverGroup = new THREE.Group();

  const fgMat = idToVideoMat("videoEightAfg", false, targetIndexInt);
  const mgMat = idToVideoMat("videoEightAmg", false, targetIndexInt);
  const bgMat = idToVideoMat("videoEightAbg", false, targetIndexInt);

  const listener = new THREE.AudioListener();

  camera.add(listener);

  const sound = new THREE.Audio(listener);

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("/Read_08a.mp3", function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(0.2);
  });

  const [trails, api] = useTrail(
    4,
    () => ({ videoScale: 0, config: config.wobbly }),
    []
  );

  const [active, setActive] = useState(false);
  const springs = useSpring({ scale: active ? 0.0 : 0.5 });
  const { scale } = useSpring({
    scale: active ? 0.5 : 0,
    config: config.wobbly,
  });

  const handleCover = (prop) => {
    api.start({ videoScale: prop.scale });
  };
  return (
    <>
      <ARAnchor
        target={targetIndexInt}
        onAnchorFound={() => {
          gl.setClearColor(0xf5f0e4, 0.9);
          // gl.toneMapping(THREE.NoToneMapping);
          // fadeOnAction.play()
          videoLibrary[targetIndexInt].forEach((video) => video.play());
          let prop = { scale: 0.0 };
          handleCover(prop);
          prop.scale = 0.5;
          handleCover(prop);
          // if (soundPlayed === false) {
          //   soundPlayed = true;
          // console.log(soundPlayed, true);
          sound.play();
          // }
        }}
        onAnchorLost={() => {
          gl.setClearColor(0xf5f0e4, 0.0);
          // let prop = { scale: 0.0 };
          // handleCover(prop);
        }}
      >
        <AnimatedGroup scale={0.7} position={[0.0, -0.05, 0]}>
          <animated.mesh
            position={[0.0, 0, 0.3]}
            material={fgMat}
            scale={trails[0].scale}
          >
            <planeGeometry args={[1, 1, 1]} />
          </animated.mesh>
          <animated.mesh
            position={[0.0, 0.0, 0.2]}
            material={mgMat}
            scale={trails[0].scale}
          >
            <planeGeometry args={[1, 1, 1]} />
          </animated.mesh>
          <animated.mesh
            position={[0.0, 0.0, 0.0]}
            material={bgMat}
            scale={trails[0].scale}
          >
            <planeGeometry args={[1, 1, 1]} />
          </animated.mesh>
        </AnimatedGroup>
      </ARAnchor>
    </>
  );
}

function SpreadEightB(targetIndex) {
  const { gl, scene, camera } = useThree();
  gl.toneMapping = THREE.NoToneMapping;
  const { targetIndexInt } = handleVideoLibrary(targetIndex);
  const coverGroup = new THREE.Group();

  const fg1Mat = idToVideoMat("videoEightOne", false, targetIndexInt);
  const fg2Mat = idToVideoMat("videoEightTwo", false, targetIndexInt);
  const mgMat = idToVideoMat("videoEightThree", false, targetIndexInt);
  const bgMat = idToVideoMat("videoEightFour", false, targetIndexInt);

  const listener = new THREE.AudioListener();

  camera.add(listener);

  const sound = new THREE.Audio(listener);

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("/Read_08b.mp3", function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(0.2);
  });

  const [trails, api] = useTrail(
    4,
    () => ({ videoScale: 0, config: config.wobbly }),
    []
  );

  const [active, setActive] = useState(false);
  const springs = useSpring({ scale: active ? 0.0 : 0.5 });
  const { scale } = useSpring({
    scale: active ? 0.5 : 0,
    config: config.wobbly,
  });

  const handleCover = (prop) => {
    api.start({ videoScale: prop.scale });
  };
  return (
    <>
      <ARAnchor
        target={targetIndexInt}
        onAnchorFound={() => {
          gl.setClearColor(0x4d4d4d, 0.9);
          // gl.toneMapping(THREE.NoToneMapping);
          // fadeOnAction.play()
          videoLibrary[targetIndexInt].forEach((video) => video.play());
          let prop = { scale: 0.0 };
          handleCover(prop);
          prop.scale = 0.5;
          handleCover(prop);
          // if (soundPlayed === false) {
          //   soundPlayed = true;
          // console.log(soundPlayed, true);
          sound.play();
          // }
        }}
        onAnchorLost={() => {
          gl.setClearColor(0x4d4d4d, 0.0);
          // let prop = { scale: 0.0 };
          // handleCover(prop);
        }}
      >
        <AnimatedGroup scale={0.7} position={[0.0, -0.05, 0]}>
          <animated.mesh
            position={[0.0, 0, 0.4]}
            material={fg1Mat}
            scale={trails[0].scale}
          >
            <planeGeometry args={[1, 1, 1]} />
          </animated.mesh>
          <animated.mesh
            position={[0.0, 0, 0.3]}
            material={fg2Mat}
            scale={trails[0].scale}
          >
            <planeGeometry args={[1, 1, 1]} />
          </animated.mesh>
          <animated.mesh
            position={[0.0, 0.0, 0.2]}
            material={mgMat}
            scale={trails[0].scale}
          >
            <planeGeometry args={[1, 1, 1]} />
          </animated.mesh>
          <animated.mesh
            position={[0.0, 0.0, 0.0]}
            material={bgMat}
            scale={trails[0].scale}
          >
            <planeGeometry args={[1, 1, 1]} />
          </animated.mesh>
        </AnimatedGroup>
      </ARAnchor>
    </>
  );
}

// function SpreadEightB(targetIndex) {
//   const { gl, scene, camera } = useThree();
//   gl.toneMapping = THREE.NoToneMapping;
//   const { targetIndexInt } = handleVideoLibrary(targetIndex);
//   const coverGroup = new THREE.Group();

//   const fg1Mat = idToVideoMat("videoEightOne", false, targetIndexInt);
//   const fg2Mat = idToVideoMat("videoEightTwo", false, targetIndexInt);
//   const mgMat = idToVideoMat("videoEightThree", false, targetIndexInt);
//   const bgMat = idToVideoMat("videoEightFour", false, targetIndexInt);

//   const listener = new THREE.AudioListener();

//   camera.add(listener);

//   const sound = new THREE.Audio(listener);

//   const audioLoader = new THREE.AudioLoader();
//   audioLoader.load("/Read_08b.mp3", function (buffer) {
//     sound.setBuffer(buffer);
//     sound.setLoop(false);
//     sound.setVolume(0.2);
//   });

//   const [trails, api] = useTrail(
//     4,
//     () => ({ videoScale: 0, config: config.wobbly }),
//     []
//   );

//   const [active, setActive] = useState(false);
//   const springs = useSpring({ scale: active ? 0.0 : 0.5 });
//   const { scale } = useSpring({
//     scale: active ? 0.5 : 0,
//     config: config.wobbly,
//   });

//   const handleCover = (prop) => {
//     api.start({ videoScale: prop.scale });
//   };
//   return (
//     <>
//       <ARAnchor
//         target={targetIndexInt}
//         onAnchorFound={() => {
//           gl.setClearColor(0x4d4d4d, 1.0);
//           // gl.toneMapping(THREE.NoToneMapping);
//           // fadeOnAction.play()
//           videoLibrary[targetIndexInt].forEach((video) => video.play());
//           let prop = { scale: 0.0 };
//           handleCover(prop);
//           prop.scale = 0.5;
//           handleCover(prop);
//           // if (soundPlayed === false) {
//           //   soundPlayed = true;
//           // console.log(soundPlayed, true);
//           sound.play();
//           // }
//         }}
//         onAnchorLost={() => {
//           gl.setClearColor(0x4d4d4d, 0.0);
//           // let prop = { scale: 0.0 };
//           // handleCover(prop);
//         }}
//       >
//         <AnimatedGroup scale={0.7} position={[0.0, -0.05, 0]}>
//           <animated.mesh
//             position={[0.4, 0.0, 0.3]}
//             material={fg1Mat}
//             scale={trails[0].scale}
//           >
//             <planeGeometry args={[1, 1, 1]} />
//           </animated.mesh>
//           <animated.mesh
//             position={[0.0, 0.0, 0.15]}
//             material={fg2Mat}
//             scale={trails[0].scale}
//           >
//             <planeGeometry args={[1, 1, 1]} />
//           </animated.mesh>
//           <animated.mesh
//             position={[0.2, 0.0, -0.1]}
//             material={mgMat}
//             scale={trails[0].scale}
//           >
//             <planeGeometry args={[1, 1, 1]} />
//           </animated.mesh>
//           <animated.mesh
//             position={[0.2, 0.0, -0.8]}
//             material={bgMat}
//             scale={trails[0].scale}
//           >
//             <planeGeometry args={[1, 1, 1]} />
//           </animated.mesh>
//         </AnimatedGroup>
//       </ARAnchor>
//     </>
//   );
// }

const color = new THREE.Color(0x272727);
const alpha = 0.95;

const compiler = new Compiler();
const content = await fetch(multiTargets);
const buffer = await content.arrayBuffer();
const dataList = compiler.importData(buffer);
console.log("dataList", dataList);

function App() {
  return (
    <>
      <StartUi />
      <ARView
        imageTargets={multiTargets}
        filterMinCF={0.00005}
        filterBeta={0.001}
        missTolerance={10}
        warmupTolerance={0}
        gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
        linear
      >
        <CoverTarget targetIndex={0} />
        {/* <SpreadOne targetIndex={1} /> */}
        {/* <SpreadTwo targetIndex={2} /> */}
        {/* <SpreadThree targetIndex={3} /> */}
        {/* <SpreadFour targetIndex={4} /> */}
        {/* <SpreadFive targetIndex={5} /> */}
        {/* <SpreadSix targetIndex={6} /> */}
        {/* <SpreadSeven targetIndex={7} /> */}
        <SpreadEightB targetIndex={15} />
        <SpreadEightA targetIndex={14} />
      </ARView>
      {/* <ARView
        imageTargets={multiTargets2}
        filterMinCF={0.00005}
        filterBeta={0.001}
        missTolerance={10}
        warmupTolerance={0}
      >
        <SpredEight targetIndex={2} />
      </ARView> */}
    </>
  );
}

export default App;
