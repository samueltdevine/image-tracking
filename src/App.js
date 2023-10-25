import { ARAnchor, ARView } from "react-three-mind";
import cover from "./cover.mind";
import multiTargets from "./multiTargets7.mind";
// import multiTargets2 from "./multiTargets_lastHalf.mind";
import { Canvas, dispose, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import {
  useSpring,
  animated,
  config,
  useTrail,
  useSpringRef,
} from "@react-spring/three";
import {
  PlaneGeometry,
  Text3D,
  useTexture,
  useVideoTexture,
} from "@react-three/drei";

function degToRad(degrees) {
  var pi = Math.PI;
  return degrees * (pi / 180);
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

// const videoLibrary = {};

const handleVideoLibrary = (targetIndex) => {
  const targetIndexInt = targetIndex.targetIndex;

  return { targetIndexInt };
};

const FallbackMaterial = () => {
  const material = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 99,
    side: THREE.BackSide,
    // depthWrite: true,
    // depthTest: depthTest,
    toneMapped: false,
  });
  return <primitive object={material} />;
};

const idToVideoMat = (id, depthTest, targetIndexInt, alphaId) => {
  const video = document.getElementById(id);
  // if (videoLibrary[targetIndexInt] === undefined) {
  //   videoLibrary[targetIndexInt] = [];
  // }
  // videoLibrary[targetIndexInt].push(video);
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
  // console.log(texture, "texture");

  return materialVideo;
  // <meshBasicMaterial
  //   map={texture}
  //   alphaMap={texture}
  //   transparent={true}
  //   opacity={100}
  //   side={THREE.DoubleSide}
  //   depthWrite={true}
  //   depthTest={depthTest}
  //   toneMapped={false}
  // />
};

const VideoMat = (props) => {
  const video = document.getElementById(props.id);
  // const src = video.children[0].src;
  const texture = new THREE.VideoTexture(video);
  texture.format = THREE.RGBAFormat;
  return (
    <>
      {/* <FallbackMaterial /> */}
      <meshBasicMaterial
        map={texture}
        alphaMap={texture}
        transparent={true}
        opacity={100}
        side={THREE.DoubleSide}
        depthWrite={true}
        // depthTest={depthTest}
        toneMapped={false}
      />
    </>
  );
};

const ImageMaterial = (id) => {
  const img = document.getElementById(id.id);
  // debugger;
  const props = useTexture({ map: img.src });

  props.map.format = THREE.RGBAFormat;
  props.transparent = true;
  props.depthTest = true;

  return <meshBasicMaterial {...props} />;
};

const SimplePlane = () => {
  return <planeGeometry args={[1.24, 1, 1]} />;
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

const actionTexture = (ref, action) => {
  console.log("action", ref, JSON.stringify(action));
  const string = action;
  const refCurrent = ref.current;
  const children = refCurrent.children;
  console.log("action children", children);
  console.log("action string", string);
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    // if (child.material.map !== null) {
    const source = child.material.map.source.data;
    // const geo = child.geometry;
    const map = child.material.map;
    const alphaMap = child.material.alphaMap;
    const material = child.material;
    console.log(
      "action child",
      children,
      child,
      source,
      map,
      alphaMap,
      material
    );
    // const source = document.getElementById(sourceId);
    // childArray.push(source);
    if (string === "play") {
      // }
      source.play();
      console.log("action played");
      // if (source.paused === true) {
      //   console.log("was paused");
      // source.pause();
    }
    if (string === "pause") {
      console.log("action paused");

      source.pause();
      // source.play();
    }
    if (string === "dispose") {
      console.log("action disposed", map, material);
      map.dispose();
      alphaMap.dispose();
      material.dispose();
    }
    // } else {
  }
};

function TargetsUtil(props) {
  const { gl } = useThree();
  const func = props.props;
  console.log(func);
  if (func === "log") {
    console.log(gl.renderLists);
  }
  if (func === "dispose") {
    gl.renderLists.dispose();
    console.log("disposed");
  }
  return <></>;
}

function CoverTarget(props) {
  const { gl, scene, camera } = useThree();
  console.log("gl", gl);
  const [isFound, setIsFound] = useState(false);
  const { targetIndexInt, latestFind, setLatestFind } = props;

  // const logoMat = idToVideoMat("logo", true, targetIndexInt);
  // const yellowMat = idToVideoMat("videoYellow", false, targetIndexInt);
  // const pinkMat = idToVideoMat("videoPink", true, targetIndexInt);
  // const orangeMat = idToVideoMat("videoOrange", false, targetIndexInt);
  // const greenMat = idToVideoMat("videoGreen", false, targetIndexInt);

  const ref = useRef();

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
          gl.setClearColor(0x272727, 0.7);
          setLatestFind(targetIndexInt);
          actionTexture(ref, "play");

          // videoLibrary[targetIndexInt].forEach((video) => {
          //   console.log("child video", video);
          //   video.play();
          // });
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
          actionTexture(ref, "pause");
          actionTexture(ref, "dispose");
          setLatestFind(null);
          gl.dispose();

          sound.pause();
          console.log("lost cover");
          gl.setClearColor(0x272727, 0.0);
          let prop = { scale: 0.0 };
          handleCover(prop);
          // videoLibrary[targetIndexInt].forEach((video) => {
          //   video.pause();
          // });
          // videoLibrary[targetIndexInt] = [];
          // console.log(videoLibrary[targetIndexInt], "target INT");
          // targetTextures.forEach((texture) => {
          //   texture.dispose();
          // });
        }}
      >
        {targetIndexInt === latestFind ? (
          <group ref={ref} scale={0.7} position={[0.0, -0.05, 0]}>
            <>
              <animated.mesh
                position={[0.0, 0.5, -0.3]}
                // material={}
                scale={trails[3].scale}
              >
                <Suspense fallback={FallbackMaterial}>
                  <VideoMat id={"MXT_CLM_Comp_LogoAnimation_SD_01-1.mov"} />
                </Suspense>
                <planeGeometry args={[1.92, 1.08, 1]} />
              </animated.mesh>
              <animated.mesh
                position={[-0.35, 0, -0.1]}
                // material={pinkMat}
                scale={trails[3].scale}
              >
                <Suspense fallback={FallbackMaterial}>
                  <VideoMat
                    id={"MXT_CLM_Comp_LogoAnimtion_PinkMonster_CV_.mp4"}
                  />

                  {/* <primitive object={pinkMat} /> */}
                </Suspense>
                <SimplePlane />
              </animated.mesh>
              <animated.mesh
                position={[0, -0.1, 0]}
                // material={greenMat}
                scale={trails[0].scale}
              >
                <Suspense fallback={FallbackMaterial}>
                  <VideoMat
                    id={"MXT_CLM_Comp_LogoAnimtion_GreenMonster_CV_.mp4"}
                  />
                </Suspense>
                <SimplePlane />
              </animated.mesh>
              <animated.mesh
                position={[-0.3, 0, 0.1]}
                // material={yellowMat}
                scale={trails[1].scale}
              >
                <Suspense fallback={FallbackMaterial}>
                  <VideoMat
                    id={"MXT_CLM_Comp_LogoAnimtion_YellowMonster_CV_h265.mp4"}
                  />
                </Suspense>
                <SimplePlane />
              </animated.mesh>
              <animated.mesh
                position={[0.3, 0, -0.2]}
                // material={orangeMat}
                scale={trails[2].scale}
              >
                <Suspense fallback={FallbackMaterial}>
                  {/* <primitive object={orangeMat} /> */}
                  <VideoMat
                    id={"MXT_CLM_Comp_LogoAnimtion_OrangeMonster_CV_.mp4"}
                  />
                </Suspense>
                <SimplePlane />
              </animated.mesh>
            </>
          </group>
        ) : (
          <group ref={ref}></group>
        )}
      </ARAnchor>
    </>
  );
}

function SpreadOneA(props) {
  const { targetIndexInt, latestFind, setLatestFind } = props;
  const { gl, scene, camera } = useThree();
  gl.toneMapping = THREE.NoToneMapping;
  const [isFound, setIsFound] = useState(false);

  const ref = useRef();

  // const mgMat = idToVideoMat("videoOneAmg", false, targetIndexInt);

  const listener = new THREE.AudioListener();

  camera.add(listener);

  const sound = new THREE.Audio(listener);

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("/Read_01a.mp3", function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(0.2);
  });

  return (
    <>
      <ARAnchor
        target={targetIndexInt}
        onAnchorFound={() => {
          setLatestFind(targetIndexInt);
          actionTexture(ref, "play");
          gl.setClearColor(0x272727, 0.7);

          // videoLibrary[targetIndexInt].forEach((video) => video.play());

          sound.play();
        }}
        onAnchorLost={() => {
          actionTexture(ref, "pause");
          actionTexture(ref, "dispose");
          setLatestFind(null);
          gl.dispose();

          sound.pause();
          gl.setClearColor(0x272727, 0.0);
          // videoLibrary[targetIndexInt].forEach((video) => {
          //   video.pause();
          // });
          // videoLibrary[targetIndexInt] = [];
          // console.log(videoLibrary[targetIndexInt], "target INT");

          // let prop = { scale: 0.0 };
          // handleCover(prop);
          // const fgMat = idToPictureMat("picOneAfg");
          // const bg1Mat = idToPictureMat("picOneAbg1");
          // const bg2Mat = idToPictureMat("picOneAbg2");
        }}
      >
        {targetIndexInt === latestFind ? (
          <>
            <group ref={ref} scale={0.7} position={[0.0, -0.05, 0]}>
              <animated.mesh position={[0.0, 0, 0.2]} scale={1}>
                <Suspense fallback={FallbackMaterial}>
                  <VideoMat id={"MXT_CLM_010_MG_SD_05-1.mov"} />
                </Suspense>
                <SimplePlane />
              </animated.mesh>
            </group>
            <group scale={0.7} position={[0.0, -0.05, 0]}>
              <animated.mesh position={[-0.1, 0, 0.0]} scale={1}>
                <SimplePlane />
                <ImageMaterial id={"picOneAfg"} />
              </animated.mesh>
              <animated.mesh position={[0.0, 0.0, -0.4]} scale={1}>
                <ImageMaterial id={"picOneAbg1"} />
                <SimplePlane />
              </animated.mesh>
              <animated.mesh position={[-0.2, 0.0, -0.5]} scale={1}>
                <ImageMaterial id={"picOneAbg2"} />
                <SimplePlane />
              </animated.mesh>
            </group>
          </>
        ) : (
          <group ref={ref}></group>
        )}
      </ARAnchor>
    </>
  );
}
function SpreadOneB(props) {
  const { targetIndexInt, latestFind, setLatestFind } = props;
  const { gl, scene, camera } = useThree();
  gl.toneMapping = THREE.NoToneMapping;
  const ref = useRef();

  // const fg1Mat = idToVideoMat("videoEightOne", false, targetIndexInt);
  // const fg2Mat = idToVideoMat("videoEightTwo", false, targetIndexInt);
  // const mgMat = idToVideoMat("videoEightThree", false, targetIndexInt);
  // const bgMat = idToVideoMat("videoEightFour", false, targetIndexInt);

  const listener = new THREE.AudioListener();

  camera.add(listener);

  const sound = new THREE.Audio(listener);

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("/Read_01b.mp3", function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(0.2);
  });

  return (
    <>
      <ARAnchor
        target={targetIndexInt}
        onAnchorFound={() => {
          // actionTexture(ref, "play");
          gl.setClearColor(0x272727, 0.7);

          // videoLibrary[targetIndexInt].forEach((video) => video.play());

          sound.play();
        }}
        onAnchorLost={() => {
          // actionTexture(ref, "pause");
          // actionTexture(ref, "dispose");

          sound.pause();
          // videoLibrary[targetIndexInt].forEach((video) => {
          //   video.pause();
          // });
          // videoLibrary[targetIndexInt] = [];
          // console.log(videoLibrary[targetIndexInt], "target INT");

          gl.setClearColor(0x272727, 0.0);
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
            <SimplePlane />
          </animated.mesh>
          <animated.mesh
            position={[0.0, 0, 0.3]}
            material={fg2Mat}
            scale={trails[0].scale}
          >
            <SimplePlane />
          </animated.mesh>
          <animated.mesh
            position={[0.0, 0.0, 0.2]}
            material={mgMat}
            scale={trails[0].scale}
          >
            <SimplePlane />
          </animated.mesh>
          <animated.mesh
            position={[0.0, 0.0, 0.0]}
            material={bgMat}
            scale={trails[0].scale}
          >
            <SimplePlane />
          </animated.mesh> */}
        </AnimatedGroup>
      </ARAnchor>
    </>
  );
}
function SpreadTwoA(props) {
  const { targetIndexInt, latestFind, setLatestFind } = props;
  const { gl, scene, camera } = useThree();
  gl.toneMapping = THREE.NoToneMapping;
  const [isFound, setIsFound] = useState(false);
  const ref = useRef();

  // const matTwoAFG = idToVideoMat("videoTwoAfg", false, targetIndexInt);
  // const matTwoAMG = idToVideoMat("videoTwoAmg", false, targetIndexInt);

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
    2,
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
          setLatestFind(targetIndexInt);
          console.log("latest", latestFind);
          actionTexture(ref, "play");
          gl.setClearColor(0x272727, 0.7);

          // videoLibrary[targetIndexInt].forEach((video) => video.play());
          let prop = { scale: 0.0 };
          handleCover(prop);
          prop.scale = 0.7;
          handleCover(prop);
          sound.play();
        }}
        onAnchorLost={() => {
          actionTexture(ref, "pause");
          actionTexture(ref, "dispose");
          setLatestFind(null);
          gl.dispose();

          sound.pause();
          // videoLibrary[targetIndexInt].forEach((video) => {
          //   video.pause();
          // });
          // videoLibrary[targetIndexInt] = [];
          // console.log(videoLibrary[targetIndexInt], "target INT");

          gl.setClearColor(0x272727, 0.0);
          // targetTextures.forEach((texture) => {
          //   texture.dispose();
          // });
        }}
      >
        {targetIndexInt === latestFind ? (
          <group ref={ref} scale={0.7} position={[0.0, -0.05, 0]}>
            <animated.mesh
              position={[0.0, 0, 0.4]}
              // material={matTwoAFG}
              scale={1.0}
            >
              <Suspense fallback={FallbackMaterial}>
                <VideoMat id={"MXT_CLM_030_Comp_Music_SD_01-1.mov"} />

                {/* <primitive object={matTwoAFG} /> */}
              </Suspense>
              <planeGeometry args={[1.24, 1, 1]} />
            </animated.mesh>
            <animated.mesh
              position={[0.0, 0, 0.3]}
              // material={matTwoAMG}
              scale={1.0}
            >
              <Suspense fallback={FallbackMaterial}>
                {/* <primitive object={matTwoAMG} /> */}
                <VideoMat id={"MXT_CLM_030_Comp_Green_SD_01-1.mov"} />
              </Suspense>
              <planeGeometry args={[1.24, 1, 1]} />
            </animated.mesh>
          </group>
        ) : (
          <group ref={ref}></group>
        )}
      </ARAnchor>
    </>
  );
}
function SpreadTwoB(props) {
  const { targetIndexInt, latestFind, setLatestFind } = props;
  const { gl, scene, camera } = useThree();
  gl.toneMapping = THREE.NoToneMapping;
  const ref = useRef();

  // const fg1Mat = idToVideoMat("videoEightOne", false, targetIndexInt);
  // const fg2Mat = idToVideoMat("videoEightTwo", false, targetIndexInt);
  // const mgMat = idToVideoMat("videoEightThree", false, targetIndexInt);
  // const bgMat = idToVideoMat("videoEightFour", false, targetIndexInt);

  const listener = new THREE.AudioListener();

  camera.add(listener);

  const sound = new THREE.Audio(listener);

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("/Read_02b.mp3", function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(0.2);
  });

  return (
    <>
      <ARAnchor
        target={targetIndexInt}
        onAnchorFound={() => {
          // actionTexture(ref, "play");
          gl.setClearColor(0x272727, 0.7);

          // videoLibrary[targetIndexInt].forEach((video) => video.play());

          sound.play();
        }}
        onAnchorLost={() => {
          // actionTexture(ref, "pause");
          // actionTexture(ref, "dispose");

          sound.pause();
          // videoLibrary[targetIndexInt].forEach((video) => {
          //   video.pause();
          // });
          // videoLibrary[targetIndexInt] = [];
          // console.log(videoLibrary[targetIndexInt], "target INT");

          gl.setClearColor(0x272727, 0.0);
          // let prop = { scale: 0.0 };
          // handleCover(prop);
        }}
      >
        <group ref={ref} scale={0.7} position={[0.0, -0.05, 0]}>
          {/* <animated.mesh
            position={[0.0, 0, 0.4]}
            material={fg1Mat}
            scale={1.0}
          >
            <SimplePlane />
          </animated.mesh>
          <animated.mesh
            position={[0.0, 0, 0.3]}
            material={fg2Mat}
            scale={1.0}
          >
            <SimplePlane />
          </animated.mesh>
          <animated.mesh
            position={[0.0, 0.0, 0.2]}
            material={mgMat}
            scale={1.0}
          >
            <SimplePlane />
          </animated.mesh>
          <animated.mesh
            position={[0.0, 0.0, 0.0]}
            material={bgMat}
            scale={1.0}
          >
            <SimplePlane />
          </animated.mesh> */}
        </group>
      </ARAnchor>
    </>
  );
}
function SpreadThreeA(props) {
  const { targetIndexInt, latestFind, setLatestFind } = props;
  const { gl, scene, camera } = useThree();
  gl.toneMapping = THREE.NoToneMapping;
  const ref = useRef();

  // const fg1Mat = idToVideoMat("videoEightOne", false, targetIndexInt);
  // const fg2Mat = idToVideoMat("videoEightTwo", false, targetIndexInt);
  // const mgMat = idToVideoMat("videoEightThree", false, targetIndexInt);
  // const bgMat = idToVideoMat("videoEightFour", false, targetIndexInt);

  const listener = new THREE.AudioListener();

  camera.add(listener);

  const sound = new THREE.Audio(listener);

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("/Read_03a.mp3", function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(0.2);
  });

  return (
    <>
      <ARAnchor
        target={targetIndexInt}
        onAnchorFound={() => {
          // actionTexture(ref, "play");
          gl.setClearColor(0x272727, 0.7);

          // videoLibrary[targetIndexInt].forEach((video) => video.play());

          sound.play();
        }}
        onAnchorLost={() => {
          // actionTexture(ref, "pause");
          // actionTexture(ref, "dispose");

          sound.pause();
          // videoLibrary[targetIndexInt].forEach((video) => {
          //   video.pause();
          // });
          // videoLibrary[targetIndexInt] = [];
          // console.log(videoLibrary[targetIndexInt], "target INT");

          gl.setClearColor(0x272727, 0.0);
          // let prop = { scale: 0.0 };
          // handleCover(prop);
        }}
      >
        <group ref={ref} scale={0.7} position={[0.0, -0.05, 0]}>
          {/* <animated.mesh
            position={[0.0, 0, 0.4]}
            material={fg1Mat}
            scale={1.0}
          >
            <SimplePlane />
          </animated.mesh>
          <animated.mesh
            position={[0.0, 0, 0.3]}
            material={fg2Mat}
            scale={1.0}
          >
            <SimplePlane />
          </animated.mesh>
          <animated.mesh
            position={[0.0, 0.0, 0.2]}
            material={mgMat}
            scale={1.0}
          >
            <SimplePlane />
          </animated.mesh>
          <animated.mesh
            position={[0.0, 0.0, 0.0]}
            material={bgMat}
            scale={1.0}
          >
            <SimplePlane />
          </animated.mesh> */}
        </group>
      </ARAnchor>
    </>
  );
}
function SpreadThreeB(props) {
  const { targetIndexInt, latestFind, setLatestFind } = props;
  const { gl, scene, camera } = useThree();
  gl.toneMapping = THREE.NoToneMapping;
  const ref = useRef();

  // const fg1Mat = idToVideoMat("videoEightOne", false, targetIndexInt);
  // const fg2Mat = idToVideoMat("videoEightTwo", false, targetIndexInt);
  // const mgMat = idToVideoMat("videoEightThree", false, targetIndexInt);
  // const bgMat = idToVideoMat("videoEightFour", false, targetIndexInt);

  const listener = new THREE.AudioListener();

  camera.add(listener);

  const sound = new THREE.Audio(listener);

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("/Read_03b.mp3", function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(0.2);
  });

  return (
    <>
      <ARAnchor
        target={targetIndexInt}
        onAnchorFound={() => {
          // actionTexture(ref, "play");
          gl.setClearColor(0x272727, 0.7);

          // videoLibrary[targetIndexInt].forEach((video) => video.play());

          sound.play();
        }}
        onAnchorLost={() => {
          // actionTexture(ref, "pause");
          // actionTexture(ref, "dispose");

          sound.pause();
          // videoLibrary[targetIndexInt].forEach((video) => {
          //   video.pause();
          // });
          // videoLibrary[targetIndexInt] = [];
          // console.log(videoLibrary[targetIndexInt], "target INT");

          gl.setClearColor(0x272727, 0.0);
          // let prop = { scale: 0.0 };
          // handleCover(prop);
        }}
      >
        <group ref={ref} scale={0.7} position={[0.0, -0.05, 0]}>
          {/* <animated.mesh
            position={[0.0, 0, 0.4]}
            material={fg1Mat}
            scale={1.0}
          >
            <SimplePlane />
          </animated.mesh>
          <animated.mesh
            position={[0.0, 0, 0.3]}
            material={fg2Mat}
            scale={1.0}
          >
            <SimplePlane />
          </animated.mesh>
          <animated.mesh
            position={[0.0, 0.0, 0.2]}
            material={mgMat}
            scale={1.0}
          >
            <SimplePlane />
          </animated.mesh>
          <animated.mesh
            position={[0.0, 0.0, 0.0]}
            material={bgMat}
            scale={1.0}
          >
            <SimplePlane />
          </animated.mesh> */}
        </group>
      </ARAnchor>
    </>
  );
}
function SpreadFourA(props) {
  const { targetIndexInt, latestFind, setLatestFind } = props;
  const { gl, scene, camera } = useThree();
  gl.toneMapping = THREE.NoToneMapping;
  const ref = useRef();

  // const fg1Mat = idToVideoMat("videoEightOne", false, targetIndexInt);
  // const fg2Mat = idToVideoMat("videoEightTwo", false, targetIndexInt);
  // const mgMat = idToVideoMat("videoEightThree", false, targetIndexInt);
  // const bgMat = idToVideoMat("videoEightFour", false, targetIndexInt);

  const listener = new THREE.AudioListener();

  camera.add(listener);

  const sound = new THREE.Audio(listener);

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("/Read_04a.mp3", function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(0.2);
  });

  return (
    <>
      <ARAnchor
        target={targetIndexInt}
        onAnchorFound={() => {
          // actionTexture(ref, "play");
          gl.setClearColor(0x272727, 0.7);

          // videoLibrary[targetIndexInt].forEach((video) => video.play());

          sound.play();
        }}
        onAnchorLost={() => {
          // actionTexture(ref, "pause");
          // actionTexture(ref, "dispose");

          sound.pause();
          // videoLibrary[targetIndexInt].forEach((video) => {
          //   video.pause();
          // });
          // videoLibrary[targetIndexInt] = [];
          // console.log(videoLibrary[targetIndexInt], "target INT");

          gl.setClearColor(0x272727, 0.0);
          // let prop = { scale: 0.0 };
          // handleCover(prop);
        }}
      >
        <group ref={ref} scale={0.7} position={[0.0, -0.05, 0]}>
          {/* <animated.mesh
            position={[0.0, 0, 0.4]}
            material={fg1Mat}
            scale={1.0}
          >
            <SimplePlane />
          </animated.mesh>
          <animated.mesh
            position={[0.0, 0, 0.3]}
            material={fg2Mat}
            scale={1.0}
          >
            <SimplePlane />
          </animated.mesh>
          <animated.mesh
            position={[0.0, 0.0, 0.2]}
            material={mgMat}
            scale={1.0}
          >
            <SimplePlane />
          </animated.mesh>
          <animated.mesh
            position={[0.0, 0.0, 0.0]}
            material={bgMat}
            scale={1.0}
          >
            <SimplePlane />
          </animated.mesh> */}
        </group>
      </ARAnchor>
    </>
  );
}
function SpreadFourB(props) {
  const { targetIndexInt, latestFind, setLatestFind } = props;
  const { gl, scene, camera } = useThree();
  gl.toneMapping = THREE.NoToneMapping;
  const ref = useRef();

  // const fg1Mat = idToVideoMat("videoEightOne", false, targetIndexInt);
  // const fg2Mat = idToVideoMat("videoEightTwo", false, targetIndexInt);
  // const mgMat = idToVideoMat("videoEightThree", false, targetIndexInt);
  // const bgMat = idToVideoMat("videoEightFour", false, targetIndexInt);

  const listener = new THREE.AudioListener();

  camera.add(listener);

  const sound = new THREE.Audio(listener);

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("/Read_04b.mp3", function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(0.2);
  });

  return (
    <>
      <ARAnchor
        target={targetIndexInt}
        onAnchorFound={() => {
          // actionTexture(ref, "play");
          gl.setClearColor(0x272727, 0.7);

          // videoLibrary[targetIndexInt].forEach((video) => video.play());

          sound.play();
        }}
        onAnchorLost={() => {
          // actionTexture(ref, "pause");
          // actionTexture(ref, "dispose");

          sound.pause();
          // videoLibrary[targetIndexInt].forEach((video) => {
          //   video.pause();
          // });
          // videoLibrary[targetIndexInt] = [];
          // console.log(videoLibrary[targetIndexInt], "target INT");

          gl.setClearColor(0x272727, 0.0);
          // let prop = { scale: 0.0 };
          // handleCover(prop);
        }}
      >
        <group ref={ref} scale={0.7} position={[0.0, -0.05, 0]}>
          {/* <animated.mesh
            position={[0.0, 0, 0.4]}
            material={fg1Mat}
            scale={1.0}
          >
            <SimplePlane />
          </animated.mesh>
          <animated.mesh
            position={[0.0, 0, 0.3]}
            material={fg2Mat}
            scale={1.0}
          >
            <SimplePlane />
          </animated.mesh>
          <animated.mesh
            position={[0.0, 0.0, 0.2]}
            material={mgMat}
            scale={1.0}
          >
            <SimplePlane />
          </animated.mesh>
          <animated.mesh
            position={[0.0, 0.0, 0.0]}
            material={bgMat}
            scale={1.0}
          >
            <SimplePlane />
          </animated.mesh> */}
        </group>
      </ARAnchor>
    </>
  );
}
function SpreadFiveA(props) {
  const { targetIndexInt, latestFind, setLatestFind } = props;
  const { gl, scene, camera } = useThree();
  gl.toneMapping = THREE.NoToneMapping;
  const ref = useRef();

  // const fg1Mat = idToVideoMat("videoEightOne", false, targetIndexInt);
  // const fg2Mat = idToVideoMat("videoEightTwo", false, targetIndexInt);
  // const mgMat = idToVideoMat("videoEightThree", false, targetIndexInt);
  // const bgMat = idToVideoMat("videoEightFour", false, targetIndexInt);

  const listener = new THREE.AudioListener();

  camera.add(listener);

  const sound = new THREE.Audio(listener);

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("/Read_05a.mp3", function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(0.2);
  });

  return (
    <>
      <ARAnchor
        target={targetIndexInt}
        onAnchorFound={() => {
          // actionTexture(ref, "play");
          gl.setClearColor(0x272727, 0.7);

          // videoLibrary[targetIndexInt].forEach((video) => video.play());

          sound.play();
        }}
        onAnchorLost={() => {
          // actionTexture(ref, "pause");
          // actionTexture(ref, "dispose");

          sound.pause();
          // videoLibrary[targetIndexInt].forEach((video) => {
          //   video.pause();
          // });
          // videoLibrary[targetIndexInt] = [];
          // console.log(videoLibrary[targetIndexInt], "target INT");

          gl.setClearColor(0x272727, 0.0);
          // let prop = { scale: 0.0 };
          // handleCover(prop);
        }}
      >
        <group ref={ref} scale={0.7} position={[0.0, -0.05, 0]}>
          {/* <animated.mesh
            position={[0.0, 0, 0.4]}
            material={fg1Mat}
            scale={1.0}
          >
            <SimplePlane />
          </animated.mesh>
          <animated.mesh
            position={[0.0, 0, 0.3]}
            material={fg2Mat}
            scale={1.0}
          >
            <SimplePlane />
          </animated.mesh>
          <animated.mesh
            position={[0.0, 0.0, 0.2]}
            material={mgMat}
            scale={1.0}
          >
            <SimplePlane />
          </animated.mesh>
          <animated.mesh
            position={[0.0, 0.0, 0.0]}
            material={bgMat}
            scale={1.0}
          >
            <SimplePlane />
          </animated.mesh> */}
        </group>
      </ARAnchor>
    </>
  );
}
function SpreadFiveB(props) {
  const { targetIndexInt, latestFind, setLatestFind } = props;
  const { gl, scene, camera } = useThree();
  gl.toneMapping = THREE.NoToneMapping;
  const ref = useRef();

  // const fg1Mat = idToVideoMat("videoEightOne", false, targetIndexInt);
  // const fg2Mat = idToVideoMat("videoEightTwo", false, targetIndexInt);
  // const mgMat = idToVideoMat("videoEightThree", false, targetIndexInt);
  // const bgMat = idToVideoMat("videoEightFour", false, targetIndexInt);

  const listener = new THREE.AudioListener();

  camera.add(listener);

  const sound = new THREE.Audio(listener);

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("/Read_05b.mp3", function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(0.2);
  });

  return (
    <>
      <ARAnchor
        target={targetIndexInt}
        onAnchorFound={() => {
          // actionTexture(ref, "play");
          gl.setClearColor(0x272727, 0.7);

          // videoLibrary[targetIndexInt].forEach((video) => video.play());

          sound.play();
        }}
        onAnchorLost={() => {
          // actionTexture(ref, "pause");
          // actionTexture(ref, "dispose");

          sound.pause();
          // videoLibrary[targetIndexInt].forEach((video) => {
          //   video.pause();
          // });
          // videoLibrary[targetIndexInt] = [];
          // console.log(videoLibrary[targetIndexInt], "target INT");

          gl.setClearColor(0x272727, 0.0);
          // let prop = { scale: 0.0 };
          // handleCover(prop);
        }}
      >
        <group ref={ref} scale={0.7} position={[0.0, -0.05, 0]}>
          {/* <animated.mesh
            position={[0.0, 0, 0.4]}
            material={fg1Mat}
            scale={1.0}
          >
            <SimplePlane />
          </animated.mesh>
          <animated.mesh
            position={[0.0, 0, 0.3]}
            material={fg2Mat}
            scale={1.0}
          >
            <SimplePlane />
          </animated.mesh>
          <animated.mesh
            position={[0.0, 0.0, 0.2]}
            material={mgMat}
            scale={1.0}
          >
            <SimplePlane />
          </animated.mesh>
          <animated.mesh
            position={[0.0, 0.0, 0.0]}
            material={bgMat}
            scale={1.0}
          >
            <SimplePlane />
          </animated.mesh> */}
        </group>
      </ARAnchor>
    </>
  );
}

function SpreadSixA(props) {
  const { targetIndexInt, latestFind, setLatestFind } = props;
  const { gl, scene, camera } = useThree();
  gl.toneMapping = THREE.NoToneMapping;
  const [isFound, setIsFound] = useState(false);
  const ref = useRef();

  // const matSixAFG = idToVideoMat("videoSixAfg", false, targetIndexInt);
  // const matSixAMG = idToVideoMat("videoSixAmg", false, targetIndexInt);

  const listener = new THREE.AudioListener();

  camera.add(listener);

  const sound = new THREE.Audio(listener);

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("/Read_06a.mp3", function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(0.2);
  });

  return (
    <>
      <ARAnchor
        target={targetIndexInt}
        onAnchorFound={() => {
          setLatestFind(targetIndexInt);
          console.log("latest", latestFind);
          actionTexture(ref, "play");
          gl.setClearColor(0x272727, 0.7);
          sound.play();
        }}
        onAnchorLost={() => {
          actionTexture(ref, "pause");
          actionTexture(ref, "dispose");
          setLatestFind(null);
          gl.dispose();

          sound.pause();

          gl.setClearColor(0x272727, 0.0);
        }}
      >
        {targetIndexInt === latestFind ? (
          <group ref={ref} scale={0.7} position={[0.0, -0.05, 0]}>
            <animated.mesh position={[0.0, 0, 0.4]} scale={1.0}>
              <Suspense fallback={FallbackMaterial}>
                <VideoMat id={"MXT_CLM_120_Comp_Couch_SD_01-1.mov"} />
                {/* <primitive object={matSixAFG} /> */}
              </Suspense>
              <planeGeometry args={[1.24, 1, 1]} />
            </animated.mesh>
            <animated.mesh position={[0.0, 0, 0.3]} scale={1.0}>
              <Suspense fallback={FallbackMaterial}>
                {/* <primitive object={matSixAMG} /> */}
                <VideoMat id={"MXT_CLM_120_Comp_Lamp_SD_01-1.mov"} />
              </Suspense>
              <planeGeometry args={[1.24, 1, 1]} />
            </animated.mesh>
          </group>
        ) : (
          <group ref={ref}></group>
        )}
      </ARAnchor>
    </>
  );
}
function SpreadSixB(props) {
  const { targetIndexInt, latestFind, setLatestFind } = props;
  const { gl, scene, camera } = useThree();
  gl.toneMapping = THREE.NoToneMapping;
  const [isFound, setIsFound] = useState(false);
  const ref = useRef();

  // const matSixBFG = idToVideoMat("videoSixBfg", false, targetIndexInt);
  // const matSixBMG = idToVideoMat("videoSixBmg", false, targetIndexInt);

  const listener = new THREE.AudioListener();

  camera.add(listener);

  const sound = new THREE.Audio(listener);

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("/Read_06b.mp3", function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(0.2);
  });

  return (
    <>
      <ARAnchor
        target={targetIndexInt}
        onAnchorFound={() => {
          setLatestFind(targetIndexInt);
          console.log("latest", latestFind);
          actionTexture(ref, "play");
          gl.setClearColor(0x272727, 0.7);

          // videoLibrary[targetIndexInt].forEach((video) => video.play());

          sound.play();
        }}
        onAnchorLost={() => {
          actionTexture(ref, "pause");
          actionTexture(ref, "dispose");
          setLatestFind(null);
          gl.dispose();

          sound.pause();
          // videoLibrary[targetIndexInt].forEach((video) => {
          //   video.pause();
          // });
          // videoLibrary[targetIndexInt] = [];
          // console.log(videoLibrary[targetIndexInt], "target INT");

          gl.setClearColor(0x272727, 0.0);
          // targetTextures.forEach((texture) => {
          //   texture.dispose();
          // });
          // let prop = { scale: 0.0 };
          // handleCover(prop);
        }}
      >
        {targetIndexInt === latestFind ? (
          <group ref={ref} scale={0.7} position={[0.0, -0.05, 0]}>
            <animated.mesh
              position={[0.0, 0, 0.4]}
              // material={matSixBFG}
              scale={1.0}
            >
              <Suspense fallback={FallbackMaterial}>
                {/* <primitive object={matSixBFG} /> */}
                <VideoMat id={"MXT_CLM_130_FG_SD_01-1.mov"} />
              </Suspense>
              <planeGeometry args={[1.24, 1, 1]} />
            </animated.mesh>
            <animated.mesh
              position={[0.0, 0, -5.3]}
              // material={matSixBMG}
              scale={1.0}
            >
              <Suspense fallback={FallbackMaterial}>
                {/* <primitive object={matSixBMG} /> */}
                <VideoMat id={"MXT_CLM_130_BG_SD_01-1.mov"} />
              </Suspense>
              <planeGeometry args={[12.0, 10, 1]} />
            </animated.mesh>
          </group>
        ) : (
          <group ref={ref}></group>
        )}
      </ARAnchor>
    </>
  );
}
function SpreadEightA(props) {
  const { targetIndexInt, latestFind, setLatestFind } = props;
  const { gl, scene, camera } = useThree();
  gl.toneMapping = THREE.NoToneMapping;
  const [isFound, setIsFound] = useState(false);

  const ref = useRef();

  // const matEigthAFg = idToVideoMat("videoEightAfg", false, targetIndexInt);
  // const matEightAmg = idToVideoMat("videoEightAmg", false, targetIndexInt);

  // const targetTextures = [
  //   matEightAmg.map,
  //   matEightAmg.alphaMap,
  //   matEigthAFg.map,
  //   matEigthAFg.alphaMap,
  // ];

  const listener = new THREE.AudioListener();

  camera.add(listener);

  const sound = new THREE.Audio(listener);

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("/Read_08a.mp3", function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(0.2);
  });

  return (
    <>
      <ARAnchor
        target={targetIndexInt}
        onAnchorFound={() => {
          console.log("latest", latestFind);
          setLatestFind(targetIndexInt);
          actionTexture(ref, "play");
          gl.setClearColor(0x272727, 0.7);
          // gl.toneMapping(THREE.NoToneMapping);
          // fadeOnAction.play()

          // videoLibrary[targetIndexInt].forEach((video) => video.play());

          // if (soundPlayed === false) {
          //   soundPlayed = true;
          // console.log(soundPlayed, true);
          sound.play();
          // }
        }}
        onAnchorLost={() => {
          actionTexture(ref, "pause");
          actionTexture(ref, "dispose");
          setLatestFind(null);
          gl.dispose();

          sound.pause();
          // videoLibrary[targetIndexInt].forEach((video) => {
          //   video.pause();
          // });
          // videoLibrary[targetIndexInt] = [];
          // console.log(videoLibrary[targetIndexInt], "target INT");

          gl.setClearColor(0x272727, 0.0);
          // targetTextures.forEach((texture) => {
          //   texture.dispose();
          // });
          // let prop = { scale: 0.0 };
          // handleCover(prop);
        }}
      >
        {targetIndexInt === latestFind ? (
          <group ref={ref} scale={0.7} position={[0.0, -0.05, 0]}>
            <animated.mesh
              position={[0.0, 0, 0.3]}
              // material={matEigthAFg}
              scale={1.0}
            >
              <Suspense fallback={FallbackMaterial}>
                {/* <primitive object={matEigthAFg} /> */}
                <VideoMat id={"MXT_CLM_140_FG_SD_06_hvec.mov"} />
              </Suspense>
              <planeGeometry args={[1.24, 1, 1]} />
            </animated.mesh>
            <animated.mesh
              position={[0.0, 0.0, 0.2]}
              // material={matEightAmg}
              scale={1.0}
            >
              <Suspense fallback={FallbackMaterial}>
                <VideoMat id={"MXT_CLM_140_MG_SD_12_hvec.mov"} />

                {/* <primitive object={matEightAmg} /> */}
              </Suspense>
              <planeGeometry args={[1.24, 1, 1]} />
            </animated.mesh>
            {/* <animated.mesh
            position={[0.0, 0.0, 0.0]}
            material={bgMat}
            scale={1.0}
          >
            <SimplePlane />
          </animated.mesh> */}
          </group>
        ) : (
          <group ref={ref}></group>
        )}
      </ARAnchor>
    </>
  );
}

function SpreadEightB(props) {
  const { targetIndexInt, latestFind, setLatestFind } = props;
  const { gl, scene, camera } = useThree();
  gl.toneMapping = THREE.NoToneMapping;
  const [isFound, setIsFound] = useState(false);

  const ref = useRef();

  const listener = new THREE.AudioListener();

  camera.add(listener);

  // const matEightBFg1 = idToVideoMat("videoEightOne", false, targetIndexInt);
  // const matEightBFg2 = idToVideoMat("videoEightTwo", false, targetIndexInt);
  // const matEightBMg = idToVideoMat("videoEightThree", false, targetIndexInt);
  // const matEightBBg = idToVideoMat("videoEightFour", false, targetIndexInt);

  // const targetTextures = [
  //   matEightBFg1.map,
  //   matEightBFg2.map,
  //   matEightBMg.map,
  //   matEightBBg.map,
  //   matEightBFg1.alphaMap,
  //   matEightBFg2.alphaMap,
  //   matEightBMg.alphaMap,
  //   matEightBBg.alphaMap,
  // ];

  const sound = new THREE.Audio(listener);

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("/Read_08b.mp3", function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(0.2);
  });

  return (
    <>
      <ARAnchor
        target={targetIndexInt}
        onAnchorFound={() => {
          console.log("latest", latestFind);
          setLatestFind(targetIndexInt);
          actionTexture(ref, "play");
          gl.setClearColor(0x272727, 0.7);

          // videoLibrary[targetIndexInt].forEach((video) => video.play());

          sound.play();
        }}
        onAnchorLost={() => {
          actionTexture(ref, "pause");
          actionTexture(ref, "dispose");
          setLatestFind(null);
          gl.dispose();

          sound.pause();
          gl.setClearColor(0x272727, 0.0);
          // videoLibrary[targetIndexInt].forEach((video) => {
          //   video.pause();
          // });
          // videoLibrary[targetIndexInt] = [];
          // console.log(videoLibrary[targetIndexInt], "target INT");
          // targetTextures.forEach((texture) => {
          //   texture.dispose();
          // });
          // let prop = { scale: 0.0 };
          // handleCover(prop);
        }}
      >
        {targetIndexInt === latestFind ? (
          <group ref={ref} scale={0.7} position={[0.0, -0.05, 0]}>
            <animated.mesh
              position={[0.0, 0, 0.4]}
              // material={matEightBFg1}
              scale={1.0}
            >
              <Suspense fallback={FallbackMaterial}>
                <VideoMat id={"MXT_CLM_COMP_FG1_150_SD_10.mp4"} />
                {/* <primitive object={matEightBFg1} /> */}
              </Suspense>
              <planeGeometry args={[1.24, 1, 1]} />
            </animated.mesh>
            <animated.mesh
              position={[0.0, 0, 0.3]}
              // material={matEightBFg2}
              scale={1.0}
            >
              <Suspense fallback={FallbackMaterial}>
                <VideoMat id={"MXT_CLM_COMP_FG2_150_SD_10.mp4"} />
                {/* <primitive object={matEightBFg2} /> */}
              </Suspense>
              <planeGeometry args={[1.24, 1, 1]} />
            </animated.mesh>
            <animated.mesh
              position={[0.0, 0.0, 0.2]}
              // material={matEightBMg}
              scale={1.0}
            >
              <Suspense fallback={FallbackMaterial}>
                {/* <primitive object={matEightBMg} /> */}
                <VideoMat id={"MXT_CLM_COMP_MG_150_SD_10.mp4"} />
              </Suspense>
              <planeGeometry args={[1.24, 1, 1]} />
            </animated.mesh>
            <animated.mesh
              position={[0.0, 0.0, 0.0]}
              // material={matEightBBg}
              scale={1.0}
            >
              <Suspense fallback={FallbackMaterial}>
                {/* <primitive object={matEightBBg} /> */}
                <VideoMat id={"MXT_CLM_COMP_BG_150_SD_10.mp4"} />
              </Suspense>
              <planeGeometry args={[1.24, 1, 1]} />
            </animated.mesh>
          </group>
        ) : (
          <group ref={ref}></group>
        )}
      </ARAnchor>
    </>
  );
}

const TargetWrap = (props) => {
  const [latestFind, setLatestFind] = useState(null);
  const { gl } = useThree();
  return (
    <>
      <CoverTarget
        targetIndexInt={0}
        latestFind={latestFind}
        setLatestFind={setLatestFind}
      />
      <SpreadOneA
        targetIndexInt={2}
        latestFind={latestFind}
        setLatestFind={setLatestFind}
      />
      <SpreadOneB
        targetIndexInt={3}
        latestFind={latestFind}
        setLatestFind={setLatestFind}
      />
      <SpreadTwoA
        targetIndexInt={4}
        latestFind={latestFind}
        setLatestFind={setLatestFind}
      />
      <SpreadTwoB
        targetIndexInt={5}
        latestFind={latestFind}
        setLatestFind={setLatestFind}
      />
      <SpreadThreeA
        targetIndexInt={6}
        latestFind={latestFind}
        setLatestFind={setLatestFind}
      />
      <SpreadThreeB
        targetIndexInt={7}
        latestFind={latestFind}
        setLatestFind={setLatestFind}
      />
      <SpreadFourA
        targetIndexInt={8}
        latestFind={latestFind}
        setLatestFind={setLatestFind}
      />
      <SpreadFourB
        targetIndexInt={9}
        latestFind={latestFind}
        setLatestFind={setLatestFind}
      />
      <SpreadFiveA
        targetIndexInt={10}
        latestFind={latestFind}
        setLatestFind={setLatestFind}
      />
      <SpreadFiveB
        targetIndexInt={11}
        latestFind={latestFind}
        setLatestFind={setLatestFind}
      />
      <SpreadSixA
        targetIndexInt={12}
        latestFind={latestFind}
        setLatestFind={setLatestFind}
      />
      <SpreadSixB
        targetIndexInt={13}
        latestFind={latestFind}
        setLatestFind={setLatestFind}
      />
      <SpreadEightB
        targetIndexInt={15}
        latestFind={latestFind}
        setLatestFind={setLatestFind}
      />
      <SpreadEightA
        targetIndexInt={14}
        latestFind={latestFind}
        setLatestFind={setLatestFind}
      />
    </>
  );
};

function App() {
  // const [group1, setGroup1] = useState(false);
  // const [group2, setGroup2] = useState(false);
  // const [group3, setGroup3] = useState(false);
  // const [group4, setGroup4] = useState(false);
  // const [targetUtil, settargetUtil] = useState(null);
  // const { gl } = useThree();
  return (
    <>
      <StartUi />
      {/* <div style={{ height: "100vh" }}> */}
      {/* <button
          onClick={() => {
            setGroup1(!group1);
          }}
        >
          Group1
        </button>
        <button
          onClick={() => {
            setGroup2(!group2);
          }}
        >
          Group2
        </button>
        <button
          onClick={() => {
            setGroup3(!group3);
          }}
        >
          Group3
        </button>
        <button
          onClick={() => {
            setGroup4(!group4);
          }}
        >
          Group4
        </button>
        <button onClick={() => settargetUtil("log")}>Log</button>
        <button onClick={() => settargetUtil("dispose")}>Dispose</button> */}
      {/* <Canvas> */}
      {/* <TargetsUtil props={targetUtil} /> */}
      <ARView
        imageTargets={multiTargets}
        filterMinCF={0.0001}
        filterBeta={0.004}
        missTolerance={1}
        warmupTolerance={5}
        // maxTrack={2}
        gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
        linear
      >
        <TargetWrap />
        {/* </Canvas> */}
        {/* </div> */}
      </ARView>
    </>
  );
}

export default App;

// {group1 && (
//   <group>
//     <animated.mesh
//       position={[0.0, 0, 0.4]}
//       // material={matEightBFg1}
//       scale={1.0}
//     >
//       <Suspense fallback={FallbackMaterial}>
//         <VideoMat id={"MXT_CLM_COMP_FG1_150_SD_10.mp4"} />
//         {/* <primitive object={matEightBFg1} /> */}
//       </Suspense>
//       <planeGeometry args={[1.24, 1, 1]} />
//     </animated.mesh>
//     <animated.mesh
//       position={[0.0, 0, 0.3]}
//       // material={matEightBFg2}
//       scale={1.0}
//     >
//       <Suspense fallback={FallbackMaterial}>
//         <VideoMat id={"MXT_CLM_COMP_FG2_150_SD_10.mp4"} />
//         {/* <primitive object={matEightBFg2} /> */}
//       </Suspense>
//       <planeGeometry args={[1.24, 1, 1]} />
//     </animated.mesh>
//     <animated.mesh
//       position={[0.0, 0.0, 0.2]}
//       // material={matEightBMg}
//       scale={1.0}
//     >
//       <Suspense fallback={FallbackMaterial}>
//         {/* <primitive object={matEightBMg} /> */}
//         <VideoMat id={"MXT_CLM_COMP_MG_150_SD_10.mp4"} />
//       </Suspense>
//       <planeGeometry args={[1.24, 1, 1]} />
//     </animated.mesh>
//     <animated.mesh
//       position={[0.0, 0.0, 0.0]}
//       // material={matEightBBg}
//       scale={1.0}
//     >
//       <Suspense fallback={FallbackMaterial}>
//         {/* <primitive object={matEightBBg} /> */}
//         <VideoMat id={"MXT_CLM_COMP_BG_150_SD_10.mp4"} />
//       </Suspense>
//       <planeGeometry args={[1.24, 1, 1]} />
//     </animated.mesh>
//   </group>
// )}
// {group2 && (
//   <group position={[0, 0, 1]}>
//     <animated.mesh
//       position={[0.0, 0, 0.3]}
//       // material={matEigthAFg}
//       scale={1.0}
//     >
//       <Suspense fallback={FallbackMaterial}>
//         {/* <primitive object={matEigthAFg} /> */}
//         <VideoMat id={"MXT_CLM_140_FG_SD_06_hvec.mov"} />
//       </Suspense>
//       <planeGeometry args={[1.24, 1, 1]} />
//     </animated.mesh>
//     <animated.mesh
//       position={[0.0, 0.0, 0.2]}
//       // material={matEightAmg}
//       scale={1.0}
//     >
//       <Suspense fallback={FallbackMaterial}>
//         <VideoMat id={"MXT_CLM_140_MG_SD_12_hvec.mov"} />

//         {/* <primitive object={matEightAmg} /> */}
//       </Suspense>
//       <planeGeometry args={[1.24, 1, 1]} />
//     </animated.mesh>
//   </group>
// )}
// {group3 && (
//   <group position={[0, 0, 2]}>
//     <animated.mesh
//       position={[0.0, 0, 0.4]}
//       // material={matSixBFG}
//       scale={1.0}
//     >
//       <Suspense fallback={FallbackMaterial}>
//         {/* <primitive object={matSixBFG} /> */}
//         <VideoMat id={"MXT_CLM_130_FG_SD_01-1.mov"} />
//       </Suspense>
//       <planeGeometry args={[1.24, 1, 1]} />
//     </animated.mesh>
//     <animated.mesh
//       position={[0.0, 0, -5.3]}
//       // material={matSixBMG}
//       scale={1.0}
//     >
//       <Suspense fallback={FallbackMaterial}>
//         {/* <primitive object={matSixBMG} /> */}
//         <VideoMat id={"MXT_CLM_130_BG_SD_01-1.mov"} />
//       </Suspense>
//       <planeGeometry args={[12.0, 10, 1]} />
//     </animated.mesh>
//   </group>
// )}
// {group4 && (
//   <group position={[0, 0, 3]}>
//     <animated.mesh position={[0.0, 0, 0.4]} scale={1.0}>
//       <Suspense fallback={FallbackMaterial}>
//         <VideoMat id={"MXT_CLM_120_Comp_Couch_SD_01-1.mov"} />
//         {/* <primitive object={matSixAFG} /> */}
//       </Suspense>
//       <planeGeometry args={[1.24, 1, 1]} />
//     </animated.mesh>
//     <animated.mesh position={[0.0, 0, 0.3]} scale={1.0}>
//       <Suspense fallback={FallbackMaterial}>
//         {/* <primitive object={matSixAMG} /> */}
//         <VideoMat id={"MXT_CLM_120_Comp_Lamp_SD_01-1.mov"} />
//       </Suspense>
//       <planeGeometry args={[1.24, 1, 1]} />
//     </animated.mesh>
//   </group>
// )}
