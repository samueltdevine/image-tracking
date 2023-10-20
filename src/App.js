import { ARAnchor, ARView } from "react-three-mind";
import cover from "./cover.mind";
import multiTargets from "./multiTargets7.mind";
// import multiTargets2 from "./multiTargets_lastHalf.mind";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Compiler } from "mind-ar/src/image-target/compiler";
import { useState, Suspense, useRef, useEffect, useCallback } from "react";
import {
  useSpring,
  animated,
  config,
  useTrail,
  useSpringRef,
} from "@react-spring/three";
import { useVideoTexture, Text3D } from "@react-three/drei";

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

const videoLibrary = {};

const handleVideoLibrary = (targetIndex) => {
  const targetIndexInt = targetIndex.targetIndex;

  return { targetIndexInt };
};

function VideoMaterial({ url }) {
  const texture = useVideoTexture(url);
  texture.format = THREE.RGBAFormat;

  return (
    <meshBasicMaterial
      map={texture}
      // alphaMap={texture}
      transparent={true}
      toneMapped={false}
    />
  );
}

function FallbackMaterial() {
  return <meshBasicMaterial transparent={true} opacity={0} />;
}

const idToVideoMat = (id, depthTest, targetIndexInt, alphaId) => {
  const video = document.getElementById(id);
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

function CoverTarget(targetIndex) {
  const { gl, scene, camera } = useThree();

  const { targetIndexInt } = handleVideoLibrary(targetIndex);

  const logoTex = "MXT_CLM_Comp_LogoAnimation_SD_01-1.mov";

  const yellowTex = "MXT_CLM_Comp_LogoAnimtion_YellowMonster_CV_h265.mp4";

  const pinkTex = "MXT_CLM_Comp_LogoAnimtion_PinkMonster_CV_.mp4";

  const orangeTex = "MXT_CLM_Comp_LogoAnimtion_OrangeMonster_CV_.mp4";

  const greenTex = "MXT_CLM_Comp_LogoAnimtion_GreenMonster_CV_.mp4";

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
          console.log("cover found");
          gl.setClearColor(0x272727, 0.6);
          // videoLibrary[targetIndexInt].forEach((video) => video.play());
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
          sound.pause();
          console.log("lost cover");
          gl.setClearColor(0x272727, 0.0);
          let prop = { scale: 0.0 };
          handleCover(prop);
          videoLibrary[targetIndexInt].forEach((video) => video.pause());
        }}
      >
        <AnimatedGroup scale={0.7} position={[0.0, -0.05, 0]}>
          <animated.mesh
            position={[0.0, 0.5, -0.3]}
            // material={logoMat}
            scale={trails[3].scale}
          >
            <Suspense fallback={<FallbackMaterial />}>
              <VideoMaterial url={logoTex} />
            </Suspense>
            <planeGeometry args={[1.92, 1.08, 1]} />
          </animated.mesh>
          <animated.mesh
            position={[-0.35, 0, -0.1]}
            // material={pinkMat}
            scale={trails[3].scale}
          >
            <Suspense fallback={<FallbackMaterial />}>
              <VideoMaterial url={pinkTex} />
            </Suspense>
            <planeGeometry args={[1, 1, 1]} />
          </animated.mesh>
          <animated.mesh
            position={[0, -0.1, 0]}
            // material={greenMat}
            scale={trails[0].scale}
          >
            <Suspense fallback={<FallbackMaterial />}>
              <VideoMaterial url={greenTex} />
            </Suspense>
            <planeGeometry args={[1, 1, 1]} />
          </animated.mesh>
          <animated.mesh
            position={[-0.3, 0, 0]}
            // material={yellowMat}
            scale={trails[1].scale}
          >
            <Suspense fallback={<FallbackMaterial />}>
              <VideoMaterial url={yellowTex} />
            </Suspense>
            <planeGeometry args={[1, 1, 1]} />
          </animated.mesh>
          <animated.mesh
            position={[0.3, 0, -0.2]}
            // material={orangeMat}
            scale={trails[2].scale}
          >
            <Suspense fallback={<FallbackMaterial />}>
              <VideoMaterial url={orangeTex} />
            </Suspense>
            <planeGeometry args={[1, 1, 1]} />
          </animated.mesh>
        </AnimatedGroup>
      </ARAnchor>
    </>
  );
}

function SpreadOneA(targetIndex) {
  const { gl, scene, camera } = useThree();
  gl.toneMapping = THREE.NoToneMapping;
  const { targetIndexInt } = handleVideoLibrary(targetIndex);

  const fg1Mat = idToVideoMat("videoEightOne", false, targetIndexInt);
  const fg2Mat = idToVideoMat("videoEightTwo", false, targetIndexInt);
  const mgMat = idToVideoMat("videoEightThree", false, targetIndexInt);
  const bgMat = idToVideoMat("videoEightFour", false, targetIndexInt);

  const listener = new THREE.AudioListener();

  camera.add(listener);

  const sound = new THREE.Audio(listener);

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("/Read_01a.mp3", function (buffer) {
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
          gl.setClearColor(0x4d4d4d, 0.6);

          // videoLibrary[targetIndexInt].forEach((video) => video.play());
          let prop = { scale: 0.0 };
          handleCover(prop);
          prop.scale = 0.5;
          handleCover(prop);
          sound.play();
        }}
        onAnchorLost={() => {
          sound.pause();
          gl.setClearColor(0x4d4d4d, 0.0);
          // videoLibrary[targetIndexInt].forEach((video) => video.pause());

          // let prop = { scale: 0.0 };
          // handleCover(prop);
        }}
      >
        <AnimatedGroup scale={0.7} position={[0.0, -0.05, 0]}>
          {/* <animated.mesh
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
          </animated.mesh> */}
        </AnimatedGroup>
      </ARAnchor>
    </>
  );
}
function SpreadOneB(targetIndex) {
  const { gl, scene, camera } = useThree();
  gl.toneMapping = THREE.NoToneMapping;
  const { targetIndexInt } = handleVideoLibrary(targetIndex);

  const fg1Mat = idToVideoMat("videoEightOne", false, targetIndexInt);
  const fg2Mat = idToVideoMat("videoEightTwo", false, targetIndexInt);
  const mgMat = idToVideoMat("videoEightThree", false, targetIndexInt);
  const bgMat = idToVideoMat("videoEightFour", false, targetIndexInt);

  const listener = new THREE.AudioListener();

  camera.add(listener);

  const sound = new THREE.Audio(listener);

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("/Read_01b.mp3", function (buffer) {
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
          gl.setClearColor(0x4d4d4d, 0.6);

          // videoLibrary[targetIndexInt].forEach((video) => video.play());
          let prop = { scale: 0.0 };
          handleCover(prop);
          prop.scale = 0.5;
          handleCover(prop);
          sound.play();
        }}
        onAnchorLost={() => {
          sound.pause();
          // videoLibrary[targetIndexInt].forEach((video) => video.pause());

          gl.setClearColor(0x4d4d4d, 0.0);
          // let prop = { scale: 0.0 };
          // handleCover(prop);
        }}
      >
        <AnimatedGroup scale={0.7} position={[0.0, -0.05, 0]}>
          {/* <animated.mesh
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
          </animated.mesh> */}
        </AnimatedGroup>
      </ARAnchor>
    </>
  );
}

function SpreadTwoA(targetIndex) {
  const { gl, scene, camera } = useThree();
  gl.toneMapping = THREE.NoToneMapping;
  const { targetIndexInt } = handleVideoLibrary(targetIndex);

  const texTwoAFG = "MXT_CLM_030_Comp_Music_SD_01-1.mov";
  const texTwoAMG = "MXT_CLM_030_Comp_Green_SD_01-1.mov";

  const listener = new THREE.AudioListener();

  camera.add(listener);

  const sound = new THREE.Audio(listener);

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("/Read_02a.mp3", function (buffer) {
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
          gl.setClearColor(0xc5df95, 0.6);

          // videoLibrary[targetIndexInt].forEach((video) => video.play());
          let prop = { scale: 0.0 };
          handleCover(prop);
          prop.scale = 0.5;
          handleCover(prop);
          sound.play();
        }}
        onAnchorLost={() => {
          sound.pause();
          // videoLibrary[targetIndexInt].forEach((video) => video.pause());

          gl.setClearColor(0x4d4d4d, 0.0);
          // let prop = { scale: 0.0 };
          // handleCover(prop);
        }}
      >
        <AnimatedGroup scale={0.7} position={[0.0, -0.05, 0]}>
          <animated.mesh
            position={[0.0, 0, 0.4]}
            // material={matTwoAFG}
            scale={trails[0].scale}
          >
            <Suspense fallback={<FallbackMaterial />}>
              <VideoMaterial url={texTwoAFG} />
            </Suspense>
            <planeGeometry args={[1.24, 1, 1]} />
          </animated.mesh>
          <animated.mesh
            position={[0.0, 0, 0.3]}
            // material={matTwoAMG}
            scale={trails[0].scale}
          >
            <Suspense fallback={<FallbackMaterial />}>
              <VideoMaterial url={texTwoAMG} />
            </Suspense>
            <planeGeometry args={[1.24, 1, 1]} />
          </animated.mesh>
        </AnimatedGroup>
      </ARAnchor>
    </>
  );
}
function SpreadTwoB(targetIndex) {
  const { gl, scene, camera } = useThree();
  gl.toneMapping = THREE.NoToneMapping;
  const { targetIndexInt } = handleVideoLibrary(targetIndex);

  const fg1Mat = idToVideoMat("videoEightOne", false, targetIndexInt);
  const fg2Mat = idToVideoMat("videoEightTwo", false, targetIndexInt);
  const mgMat = idToVideoMat("videoEightThree", false, targetIndexInt);
  const bgMat = idToVideoMat("videoEightFour", false, targetIndexInt);

  const listener = new THREE.AudioListener();

  camera.add(listener);

  const sound = new THREE.Audio(listener);

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("/Read_02b.mp3", function (buffer) {
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
          gl.setClearColor(0xc5df95, 0.6);

          // videoLibrary[targetIndexInt].forEach((video) => video.play());
          let prop = { scale: 0.0 };
          handleCover(prop);
          prop.scale = 0.5;
          handleCover(prop);
          sound.play();
        }}
        onAnchorLost={() => {
          sound.pause();
          // videoLibrary[targetIndexInt].forEach((video) => video.pause());

          gl.setClearColor(0x4d4d4d, 0.0);
          // let prop = { scale: 0.0 };
          // handleCover(prop);
        }}
      >
        <AnimatedGroup scale={0.7} position={[0.0, -0.05, 0]}>
          {/* <animated.mesh
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
          </animated.mesh> */}
        </AnimatedGroup>
      </ARAnchor>
    </>
  );
}
function SpreadThreeA(targetIndex) {
  const { gl, scene, camera } = useThree();
  gl.toneMapping = THREE.NoToneMapping;
  const { targetIndexInt } = handleVideoLibrary(targetIndex);

  const fg1Mat = idToVideoMat("videoEightOne", false, targetIndexInt);
  const fg2Mat = idToVideoMat("videoEightTwo", false, targetIndexInt);
  const mgMat = idToVideoMat("videoEightThree", false, targetIndexInt);
  const bgMat = idToVideoMat("videoEightFour", false, targetIndexInt);

  const listener = new THREE.AudioListener();

  camera.add(listener);

  const sound = new THREE.Audio(listener);

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("/Read_03a.mp3", function (buffer) {
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
          gl.setClearColor(0x4d4d4d, 0.6);

          // videoLibrary[targetIndexInt].forEach((video) => video.play());
          let prop = { scale: 0.0 };
          handleCover(prop);
          prop.scale = 0.5;
          handleCover(prop);
          sound.play();
        }}
        onAnchorLost={() => {
          sound.pause();
          // videoLibrary[targetIndexInt].forEach((video) => video.pause());

          gl.setClearColor(0x4d4d4d, 0.0);
          // let prop = { scale: 0.0 };
          // handleCover(prop);
        }}
      >
        <AnimatedGroup scale={0.7} position={[0.0, -0.05, 0]}>
          {/* <animated.mesh
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
          </animated.mesh> */}
        </AnimatedGroup>
      </ARAnchor>
    </>
  );
}
function SpreadThreeB(targetIndex) {
  const { gl, scene, camera } = useThree();
  gl.toneMapping = THREE.NoToneMapping;
  const { targetIndexInt } = handleVideoLibrary(targetIndex);

  const fg1Mat = idToVideoMat("videoEightOne", false, targetIndexInt);
  const fg2Mat = idToVideoMat("videoEightTwo", false, targetIndexInt);
  const mgMat = idToVideoMat("videoEightThree", false, targetIndexInt);
  const bgMat = idToVideoMat("videoEightFour", false, targetIndexInt);

  const listener = new THREE.AudioListener();

  camera.add(listener);

  const sound = new THREE.Audio(listener);

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("/Read_03b.mp3", function (buffer) {
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
          gl.setClearColor(0x4d4d4d, 0.6);

          // videoLibrary[targetIndexInt].forEach((video) => video.play());
          let prop = { scale: 0.0 };
          handleCover(prop);
          prop.scale = 0.5;
          handleCover(prop);
          sound.play();
        }}
        onAnchorLost={() => {
          sound.pause();
          // videoLibrary[targetIndexInt].forEach((video) => video.pause());

          gl.setClearColor(0x4d4d4d, 0.0);
          // let prop = { scale: 0.0 };
          // handleCover(prop);
        }}
      >
        <AnimatedGroup scale={0.7} position={[0.0, -0.05, 0]}>
          {/* <animated.mesh
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
          </animated.mesh> */}
        </AnimatedGroup>
      </ARAnchor>
    </>
  );
}
function SpreadFourA(targetIndex) {
  const { gl, scene, camera } = useThree();
  gl.toneMapping = THREE.NoToneMapping;
  const { targetIndexInt } = handleVideoLibrary(targetIndex);

  const fg1Mat = idToVideoMat("videoEightOne", false, targetIndexInt);
  const fg2Mat = idToVideoMat("videoEightTwo", false, targetIndexInt);
  const mgMat = idToVideoMat("videoEightThree", false, targetIndexInt);
  const bgMat = idToVideoMat("videoEightFour", false, targetIndexInt);

  const listener = new THREE.AudioListener();

  camera.add(listener);

  const sound = new THREE.Audio(listener);

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("/Read_04a.mp3", function (buffer) {
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
          gl.setClearColor(0x4d4d4d, 0.6);

          // videoLibrary[targetIndexInt].forEach((video) => video.play());
          let prop = { scale: 0.0 };
          handleCover(prop);
          prop.scale = 0.5;
          handleCover(prop);
          sound.play();
        }}
        onAnchorLost={() => {
          sound.pause();
          // videoLibrary[targetIndexInt].forEach((video) => video.pause());

          gl.setClearColor(0x4d4d4d, 0.0);
          // let prop = { scale: 0.0 };
          // handleCover(prop);
        }}
      >
        <AnimatedGroup scale={0.7} position={[0.0, -0.05, 0]}>
          {/* <animated.mesh
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
          </animated.mesh> */}
        </AnimatedGroup>
      </ARAnchor>
    </>
  );
}
function SpreadFourB(targetIndex) {
  const { gl, scene, camera } = useThree();
  gl.toneMapping = THREE.NoToneMapping;
  const { targetIndexInt } = handleVideoLibrary(targetIndex);

  const fg1Mat = idToVideoMat("videoEightOne", false, targetIndexInt);
  const fg2Mat = idToVideoMat("videoEightTwo", false, targetIndexInt);
  const mgMat = idToVideoMat("videoEightThree", false, targetIndexInt);
  const bgMat = idToVideoMat("videoEightFour", false, targetIndexInt);

  const listener = new THREE.AudioListener();

  camera.add(listener);

  const sound = new THREE.Audio(listener);

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("/Read_04b.mp3", function (buffer) {
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
          gl.setClearColor(0x4d4d4d, 0.6);

          // videoLibrary[targetIndexInt].forEach((video) => video.play());
          let prop = { scale: 0.0 };
          handleCover(prop);
          prop.scale = 0.5;
          handleCover(prop);
          sound.play();
        }}
        onAnchorLost={() => {
          sound.pause();
          // videoLibrary[targetIndexInt].forEach((video) => video.pause());

          gl.setClearColor(0x4d4d4d, 0.0);
          // let prop = { scale: 0.0 };
          // handleCover(prop);
        }}
      >
        <AnimatedGroup scale={0.7} position={[0.0, -0.05, 0]}>
          {/* <animated.mesh
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
          </animated.mesh> */}
        </AnimatedGroup>
      </ARAnchor>
    </>
  );
}
function SpreadFiveA(targetIndex) {
  const { gl, scene, camera } = useThree();
  gl.toneMapping = THREE.NoToneMapping;
  const { targetIndexInt } = handleVideoLibrary(targetIndex);

  const fg1Mat = idToVideoMat("videoEightOne", false, targetIndexInt);
  const fg2Mat = idToVideoMat("videoEightTwo", false, targetIndexInt);
  const mgMat = idToVideoMat("videoEightThree", false, targetIndexInt);
  const bgMat = idToVideoMat("videoEightFour", false, targetIndexInt);

  const listener = new THREE.AudioListener();

  camera.add(listener);

  const sound = new THREE.Audio(listener);

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("/Read_05a.mp3", function (buffer) {
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
          gl.setClearColor(0x4d4d4d, 0.6);

          // videoLibrary[targetIndexInt].forEach((video) => video.play());
          let prop = { scale: 0.0 };
          handleCover(prop);
          prop.scale = 0.5;
          handleCover(prop);
          sound.play();
        }}
        onAnchorLost={() => {
          sound.pause();
          // videoLibrary[targetIndexInt].forEach((video) => video.pause());

          gl.setClearColor(0x4d4d4d, 0.0);
          // let prop = { scale: 0.0 };
          // handleCover(prop);
        }}
      >
        <AnimatedGroup scale={0.7} position={[0.0, -0.05, 0]}>
          {/* <animated.mesh
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
          </animated.mesh> */}
        </AnimatedGroup>
      </ARAnchor>
    </>
  );
}
function SpreadFiveB(targetIndex) {
  const { gl, scene, camera } = useThree();
  gl.toneMapping = THREE.NoToneMapping;
  const { targetIndexInt } = handleVideoLibrary(targetIndex);

  const fg1Mat = idToVideoMat("videoEightOne", false, targetIndexInt);
  const fg2Mat = idToVideoMat("videoEightTwo", false, targetIndexInt);
  const mgMat = idToVideoMat("videoEightThree", false, targetIndexInt);
  const bgMat = idToVideoMat("videoEightFour", false, targetIndexInt);

  const listener = new THREE.AudioListener();

  camera.add(listener);

  const sound = new THREE.Audio(listener);

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("/Read_05b.mp3", function (buffer) {
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
          gl.setClearColor(0x4d4d4d, 0.6);

          // videoLibrary[targetIndexInt].forEach((video) => video.play());
          let prop = { scale: 0.0 };
          handleCover(prop);
          prop.scale = 0.5;
          handleCover(prop);
          sound.play();
        }}
        onAnchorLost={() => {
          sound.pause();
          // videoLibrary[targetIndexInt].forEach((video) => video.pause());

          gl.setClearColor(0x4d4d4d, 0.0);
          // let prop = { scale: 0.0 };
          // handleCover(prop);
        }}
      >
        <AnimatedGroup scale={0.7} position={[0.0, -0.05, 0]}>
          {/* <animated.mesh
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
          </animated.mesh> */}
        </AnimatedGroup>
      </ARAnchor>
    </>
  );
}

function SpreadSixA(targetIndex) {
  const { gl, scene, camera } = useThree();
  gl.toneMapping = THREE.NoToneMapping;
  const { targetIndexInt } = handleVideoLibrary(targetIndex);

  const texSixAFG = "MXT_CLM_120_Comp_Couch_SD_01-1.mov";
  const texSixAMG = "MXT_CLM_120_Comp_Lamp_SD_01-1.mov";

  const listener = new THREE.AudioListener();

  camera.add(listener);

  const sound = new THREE.Audio(listener);

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("/Read_06a.mp3", function (buffer) {
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
          gl.setClearColor(0x4d4d4d, 0.6);

          // videoLibrary[targetIndexInt].forEach((video) => video.play());
          let prop = { scale: 0.0 };
          handleCover(prop);
          prop.scale = 0.5;
          handleCover(prop);
          sound.play();
        }}
        onAnchorLost={() => {
          sound.pause();
          videoLibrary[targetIndexInt].forEach((video) => video.pause());

          gl.setClearColor(0x4d4d4d, 0.0);
          // let prop = { scale: 0.0 };
          // handleCover(prop);
        }}
      >
        <AnimatedGroup scale={0.7} position={[0.0, -0.05, 0]}>
          <animated.mesh
            position={[0.0, 0, 0.4]}
            // material={matSixAFG}
            scale={trails[0].scale}
          >
            <Suspense fallback={<FallbackMaterial />}>
              <VideoMaterial url={texSixAFG} />
            </Suspense>
            <planeGeometry args={[1.24, 1, 1]} />
          </animated.mesh>
          <animated.mesh
            position={[0.0, 0, 0.3]}
            // material={matSixAMG}
            scale={trails[0].scale}
          >
            <Suspense fallback={<FallbackMaterial />}>
              <VideoMaterial url={texSixAMG} />
            </Suspense>
            <planeGeometry args={[1.24, 1, 1]} />
          </animated.mesh>
        </AnimatedGroup>
      </ARAnchor>
    </>
  );
}
function SpreadSixB(targetIndex) {
  const { gl, scene, camera } = useThree();
  gl.toneMapping = THREE.NoToneMapping;
  const { targetIndexInt } = handleVideoLibrary(targetIndex);

  const texSixBFG = "MXT_CLM_130_FG_SD_01-1.mov";
  const texSixBMG = "MXT_CLM_130_BG_SD_01-1.mov";

  const listener = new THREE.AudioListener();

  camera.add(listener);

  const sound = new THREE.Audio(listener);

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("/Read_06b.mp3", function (buffer) {
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
          gl.setClearColor(0x4d4d4d, 0.6);

          // videoLibrary[targetIndexInt].forEach((video) => video.play());
          let prop = { scale: 0.0 };
          handleCover(prop);
          prop.scale = 0.5;
          handleCover(prop);
          sound.play();
        }}
        onAnchorLost={() => {
          sound.pause();
          // videoLibrary[targetIndexInt].forEach((video) => video.pause());

          gl.setClearColor(0x4d4d4d, 0.0);
          // let prop = { scale: 0.0 };
          // handleCover(prop);
        }}
      >
        <AnimatedGroup scale={0.7} position={[0.0, -0.05, 0]}>
          <animated.mesh
            position={[0.0, 0, 0.4]}
            // material={matSixBFG}
            scale={trails[0].scale}
          >
            <Suspense fallback={<FallbackMaterial />}>
              <VideoMaterial url={texSixBFG} />
            </Suspense>
            <planeGeometry args={[1.24, 1, 1]} />
          </animated.mesh>
          <animated.mesh
            position={[0.0, 0, -10.3]}
            // material={matSixBMG}
            scale={trails[0].scale}
          >
            <Suspense fallback={<FallbackMaterial />}>
              <VideoMaterial url={texSixBMG} />
            </Suspense>
            <planeGeometry args={[12.0, 10, 1]} />
          </animated.mesh>
        </AnimatedGroup>
      </ARAnchor>
    </>
  );
}
function SpreadEightA(targetIndex) {
  const { gl, scene, camera } = useThree();
  gl.toneMapping = THREE.NoToneMapping;
  const { targetIndexInt } = handleVideoLibrary(targetIndex);

  const texEigthAfg = "MXT_CLM_140_FG_SD_06_hvec.mov";
  const texEightAmg = "MXT_CLM_140_MG_SD_12_hvec.mov";

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
          gl.setClearColor(0xf5f0e4, 0.6);
          // gl.toneMapping(THREE.NoToneMapping);
          // fadeOnAction.play()

          // videoLibrary[targetIndexInt].forEach((video) => video.play());

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
          sound.pause();
          videoLibrary[targetIndexInt].forEach((video) => video.pause());

          gl.setClearColor(0xf5f0e4, 0.0);
          // let prop = { scale: 0.0 };
          // handleCover(prop);
        }}
      >
        <AnimatedGroup scale={0.7} position={[0.0, -0.05, 0]}>
          <animated.mesh
            position={[0.0, 0, 0.3]}
            // material={matEigthAFg}
            scale={trails[0].scale}
          >
            <planeGeometry args={[1.24, 1, 1]} />
            <Suspense fallback={<FallbackMaterial />}>
              <VideoMaterial url={texEigthAfg} />
            </Suspense>
          </animated.mesh>
          <animated.mesh
            position={[0.0, 0.0, 0.2]}
            // material={matEightAmg}
            scale={trails[0].scale}
          >
            <Suspense fallback={<FallbackMaterial />}>
              <VideoMaterial url={texEightAmg} />
            </Suspense>
            <planeGeometry args={[1.24, 1, 1]} />
          </animated.mesh>
          {/* <animated.mesh
            position={[0.0, 0.0, 0.0]}
            material={bgMat}
            scale={trails[0].scale}
          >
            <planeGeometry args={[1, 1, 1]} />
          </animated.mesh> */}
        </AnimatedGroup>
      </ARAnchor>
    </>
  );
}

function SpreadEightB(targetIndex) {
  const { gl, scene, camera } = useThree();
  gl.toneMapping = THREE.NoToneMapping;
  const { targetIndexInt } = handleVideoLibrary(targetIndex);

  const listener = new THREE.AudioListener();

  camera.add(listener);

  const texEightBFg1 = "MXT_CLM_COMP_FG1_150_SD_10.mp4";
  const texEightBFg2 = "MXT_CLM_COMP_FG2_150_SD_10.mp4";
  const texEightBMg = "MXT_CLM_COMP_MG_150_SD_10.mp4";
  const texEightBBg = "MXT_CLM_COMP_BG_150_SD_10.mp4";

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
          gl.setClearColor(0x4d4d4d, 0.6);

          // videoLibrary[targetIndexInt].forEach((video) => video.play());
          let prop = { scale: 0.0 };
          handleCover(prop);
          prop.scale = 0.5;
          handleCover(prop);
          sound.play();
        }}
        onAnchorLost={() => {
          sound.pause();
          gl.setClearColor(0x4d4d4d, 0.0);
          // videoLibrary[targetIndexInt].forEach((video) => video.pause());
          // let prop = { scale: 0.0 };
          // handleCover(prop);
        }}
      >
        <AnimatedGroup scale={0.7} position={[0.0, -0.05, 0]}>
          <animated.mesh
            position={[0.0, 0, 0.4]}
            // material={matEightBFg1}
            scale={trails[0].scale}
          >
            <Suspense fallback={<FallbackMaterial />}>
              <VideoMaterial url={texEightBFg1} />
            </Suspense>
            <planeGeometry args={[1.24, 1, 1]} />
          </animated.mesh>
          <animated.mesh
            position={[0.0, 0, 0.3]}
            // material={matEightBFg2}
            scale={trails[0].scale}
          >
            <Suspense fallback={<FallbackMaterial />}>
              <VideoMaterial url={texEightBFg2} />
            </Suspense>
            <planeGeometry args={[1.24, 1, 1]} />
          </animated.mesh>
          <animated.mesh
            position={[0.0, 0.0, 0.2]}
            // material={matEightBMg}
            scale={trails[0].scale}
          >
            <Suspense fallback={<FallbackMaterial />}>
              <VideoMaterial url={texEightBMg} />
            </Suspense>
            <planeGeometry args={[1.24, 1, 1]} />
          </animated.mesh>
          <animated.mesh
            position={[0.0, 0.0, 0.0]}
            // material={matEightBBg}
            scale={trails[0].scale}
          >
            <Suspense fallback={<FallbackMaterial />}>
              <VideoMaterial url={texEightBBg} />
            </Suspense>
            <planeGeometry args={[1.24, 1, 1]} />
          </animated.mesh>
        </AnimatedGroup>
      </ARAnchor>
    </>
  );
}

const TargetWrap = (props) => {
  return (
    <>
      <CoverTarget targetIndex={0} />
      <SpreadOneA targetIndex={2} />
      <SpreadOneB targetIndex={3} />
      <SpreadTwoA targetIndex={4} />
      <SpreadTwoB targetIndex={5} />
      <SpreadThreeA targetIndex={6} />
      <SpreadThreeB targetIndex={7} />
      <SpreadFourA targetIndex={8} />
      <SpreadFourB targetIndex={9} />
      <SpreadFiveA targetIndex={10} />
      <SpreadFiveB targetIndex={11} />
      <SpreadSixA targetIndex={12} />
      <SpreadSixB targetIndex={13} />
      {/* <SpreadThree targetIndex={3} /> */}
      {/* <SpreadFour targetIndex={4} /> */}
      {/* <SpreadFive targetIndex={5} /> */}
      {/* <SpreadSix targetIndex={6} /> */}
      {/* <SpreadSeven targetIndex={7} /> */}
      <SpreadEightB targetIndex={15} />
      <SpreadEightA targetIndex={14} />
    </>
  );
};

function App() {
  return (
    <>
      <StartUi />
      <ARView
        imageTargets={multiTargets}
        filterMinCF={0.0001}
        filterBeta={0.004}
        missTolerance={2}
        warmupTolerance={10}
        // maxTrack={2}
        gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
        linear
      >
        <TargetWrap />
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
