import { ARAnchor, ARView } from "react-three-mind";
// import cover from "./cover.mind";
import multiTargets from "./multiTargets7.mind";
// import multiTargets2 from "./multiTargets_lastHalf.mind";
import { Canvas, dispose, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  useState,
  useRef,
  useMemo,
  useEffect,
  useCallback,
  Suspense,
  memo,
} from "react";
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

function Ui(props) {
  const { children } = props;
  const [start, setStart] = useState(false);
  const [understood, setUnderstood] = useState(true);
  console.log("ui props", props);
  console.log("start", start);
  console.log("understood", understood);
  return (
    <>
      <div
        className={"flex"}
        id={"header"}
        style={{ display: start ? "none" : "flex" }}
      >
        <div className={"header-box"}></div>
        <div
          style={{
            display: understood ? "flex" : "none",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ textAlign: "center", fontSize: "12px" }}>
            For audio, turn your volume up & take your phone off vibrate
          </span>
          <div>
            <button
              onClick={() => setUnderstood(!understood)}
              className={"button"}
              id={"startButton"}
            >
              Gotcha!
            </button>
          </div>
        </div>
        <button
          style={{ display: understood ? "none" : "flex" }}
          onClick={setStart}
          className={"button"}
          id={"startButton"}
        >
          Start
        </button>
        <div></div>
      </div>
      {start ? children : <></>}
    </>
  );
}

// let soundPlayed = false;

// const videoLibrary = {};

// const handleVideoLibrary = (targetIndex) => {
//     const targetIndexInt = targetIndex.targetIndex;
//
//     return {targetIndexInt};
// };

const FallbackMaterial = () => {
  const material = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 99,
    side: THREE.BackSide,
    // depthWrite: true,
    // depthTest: depthTest,
    toneMapped: false,
  });
  return material;
};

const VideoMat = (props) => {
  const video = document.getElementById(props.id);
  // const texture = useVideoTexture(props.id);
  useEffect(() => {
    video.play();
  }, []);
  // const src = ideo.children[0].src;
  const texture = new THREE.VideoTexture(video);
  texture.offset.set(-0.01, 0.01);
  texture.repeat.set(0.99, 0.99);
  // console.log("tex", texture);
  texture.format = THREE.RGBAFormat;
  return (
    <>
      <Suspense fallback={FallbackMaterial}>
        <meshBasicMaterial
          map={texture}
          alphaMap={texture}
          transparent={true}
          opacity={10}
          side={THREE.FrontSide}
          depthWrite={true}
          depthTest={true}
          toneMapped={false}
        />
      </Suspense>
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
  props.opacity = 1;

  return <meshBasicMaterial {...props} />;
};

const SimplePlane = () => {
  return <planeGeometry args={[1.24, 1, 1]} />;
};

// const fontPath = "/Nunito_Medium_Regular.json";

// const Group = (props) => {
//     return <group {...props}>{props.children}</group>;
// };

// const AnimatedGroup = animated(Group);

// const AnimatedText3D = animated(Text3D);

// const SampleSpacerGroup = (props) => {
//     const {setLengths, lengths, position} = props;
//     const groupRef = useRef();
//
//     useEffect(() => {
//         const tmpLengths = [];
//         const wordArray = groupRef.current.children;
//         const multiplier = 50.0;
//
//         wordArray.forEach((word, index) => {
//             const boundingBox = new THREE.Box3().setFromObject(word);
//             const length = boundingBox.max.x - boundingBox.min.x;
//             const spacing = 1;
//
//             const lengthNormalized = length * multiplier + spacing;
//             tmpLengths.push(lengthNormalized);
//         });
//
//         setLengths(tmpLengths);
//     }, []);
//
//     // const sum = lengths.reduce((partialSum, a) => partialSum + a, 0);
//     // const negSum = sum * -1.0;
//     return (
//         <group ref={groupRef} scale={props.scale}>
//             {props.children}
//         </group>
//     );
// };
//
// const SpacerGroup = (props) => {
//     const {lengths, position, delayMS} = props;
//     const groupRef = useRef();
//     useEffect(() => {
//         // async function renderDelayedText (){
//         //   await sleep(delayMS)
//         // setTimeout(()=>{
//         const wordArray = groupRef.current.children;
//         wordArray.forEach((word, index) => {
//             const lengthsAccum = lengths.map((elem, index) =>
//                 lengths.slice(0, index + 1).reduce((a, b) => a + b)
//             );
//             const currentLength = lengths[index];
//             const halfCurrentLength = currentLength * -0.5;
//             const currentSpacing = lengthsAccum[index] + halfCurrentLength;
//             // const currentLength = lengthsAccum[index] - lengths[index];
//             const child = word.children[0];
//             const childInner = child.children[0];
//             childInner.position.set(halfCurrentLength, 0, 0);
//             child.position.set(currentSpacing, 0, 0);
//             // child.position.set(halfCurrentLength, 0, 0);
//             console.log("word", word.position, child.position);
//             // box.getCenter(word.position);
//         });
//         // setIsDelaying(false)
//         // },delayMS)
//         // console.log("isDelaying", isDelaying)
//
//         // }
//     }, []);
//     // useEffect(()=>{
//
//     //   setTimeout(()=>{
//     //     setIsDelaying(false)
//     //   },delayMS)
//     //   },[])
//
//     return (
//         <group ref={groupRef} position={position} scale={props.scale}>
//             {props.children}
//         </group>
//     );
//     // useTimeout()
//     // console.log("yo else")
// };

// function BouncyText(props) {
//   const { scale, position, delayMS, onClick } = props;
//   // onClick()
//   const [isDelaying, setIsDelaying] = useState(true);
//   useEffect(() => {
//     setTimeout(() => {
//       setIsDelaying(false);
//     }, delayMS);
//   }, []);
//   const startingText = props.children;
//   const regex = /\S+\s*/g;
//   const textArray = startingText.match(regex);
//   const wordCount = textArray.length;

//   // const spring = useSpring({
//   //   from: { scale: [0, 0, 0], position: [0, -1.0, 0] },
//   //   to: { scale: [1, 1, 1], position: [0, 0, 0] },
//   //   config: {
//   //     friction: 10,
//   //   },
//   //   delay: 2000,
//   // });

//   // const trails = useTrail(wordCount, {
//   //   from: { scale: [0, 0, 0], position: [0, -3.0, 0] },
//   //   to: { scale: [1, 1, 1], position: [0, 0, 0] },
//   //   config: {
//   //     friction: 10,
//   //   },
//   //   delay: 500,
//   //   pause: isDelaying,
//   // });

//   const [lengths, setLengths] = useState([]);

//   if (lengths.length == 0) {
//     return (
//       <SampleSpacerGroup
//         scale={scale}
//         lengths={lengths}
//         setLengths={setLengths}
//       >
//         {textArray.map((text, index) => (
//           <AnimatedText3D font={fontPath} scale={1.0}>
//             {text}
//           </AnimatedText3D>
//         ))}
//       </SampleSpacerGroup>
//     );
//   } else {
//     return (
//       <SpacerGroup
//         scale={scale}
//         lengths={lengths}
//         position={position}
//         delayMS={delayMS}
//       >
//         {textArray.map((text, index) => (
//           <AnimatedGroup scale={1} position={trails[index].position}>
//             <AnimatedGroup
//               // scale={1}
//               scale={isDelaying ? 0.0 : trails[index].scale}
//             >
//               <AnimatedText3D
//                 font={fontPath}
//                 // scale={1}
//                 // position={trails[index].position}
//               >
//                 {text}
//               </AnimatedText3D>
//             </AnimatedGroup>
//           </AnimatedGroup>
//         ))}
//       </SpacerGroup>
//     );
//   }
// }

const actionTexture = (ref, action) => {
  console.log("action", ref);
  const string = action;
  const refCurrent = ref.current;
  const children = refCurrent.children;
  //console.log("action children", JSON.parse(JSON.stringify(children)), action);

  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    const source = child.material.map.source.data;

    const map = child.material.map;
    if (typeof map === "VideoTexture") {
      const alphaMap = child.material.alphaMap;
      const material = child.material;

      if (string === "play") {
        // source.play();
        // console.log("action played");
      }
      if (string === "pause") {
        console.log("action pausing", source);
        source.pause();
        console.log("action paused", source);
      }
      if (string === "dispose") {
        debugger;
        console.log("action disposing", map, material);
        map.dispose();
        alphaMap.dispose();
        material.dispose();
        // child.material.map = null;
        // child.material.alphaMap = null;
        // child.material = null;
        console.log("action disposed", map, alphaMap, material);
      }
    }
  }
};

// function TargetsUtil(props) {
//     const {gl} = useThree();
//     const func = props.props;
//     console.log(func);
//     if (func === "log") {
//         console.log(gl.renderLists);
//     }
//     if (func === "dispose") {
//         gl.renderLists.dispose();
//         console.log("disposed");
//     }
//     return <></>;
// }

const AnchorTarget = memo((props) => {
  const { resetKey } = props;
  const { gl, camera } = useThree();
  const { targetIndexInt, setLatestFind, children, audioUrl, api } = props;

  const ref = useRef();

  const listener = new THREE.AudioListener();

  camera.add(listener);

  const sound = new THREE.Audio(listener);
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load(audioUrl, function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(0.2);
  });

  // let prop = { scale: 1 };
  const handleTrails = (prop) => {
    api.start({ videoScale: prop.scale });
  };

  return (
    <>
      <ARAnchor
        target={targetIndexInt}
        onAnchorLost={() => {
          resetKey();
          // sound.pause();
          console.log("action lost");
          let prop = { scale: 0.0 };
          handleTrails(prop);
          setLatestFind(null);
          actionTexture(ref, "pause");
          actionTexture(ref, "dispose");
          gl.dispose();
          gl.setClearColor(0x272727, 0.0);
        }}
        onAnchorFound={() => {
          console.log("action found");
          let prop = { scale: 0.0 };
          handleTrails(prop);
          prop.scale = 1.0;
          handleTrails(prop);
          gl.setClearColor(0x272727, 0.7);
          setLatestFind(targetIndexInt);
          actionTexture(ref, "play");
          if (sound.isPlaying !== true) {
            sound.play();
          }
        }}
      >
        <group scale={0.7} position={[0, 0, 0]} ref={ref}>
          {children}
        </group>
      </ARAnchor>
    </>
  );
});

const Cover = memo(({ trails }) => {
  console.log("trails", trails);
  return (
    <>
      <></>
    </>
  );
});

const OneA = memo(({ trails }) => {
  return <></>;
});
const OneB = memo(({ trails }) => {
  return <></>;
});
const TwoA = memo(({ trails }) => {
  return <></>;
});
const TwoB = memo(({ trails }) => {
  return <></>;
});
const ThreeA = memo(({ trails }) => {
  return <></>;
});
const ThreeB = memo(({ trails }) => {
  return <></>;
});
const FourA = memo(({ trails }) => {
  return <></>;
});
const FourB = memo(({ trails }) => {
  return <></>;
});

const FiveA = memo(({ trails }) => {
  return <></>;
});

const FiveB = memo(({ trails }) => {
  return <></>;
});

const SixA = memo(({ trails }) => {
  return <></>;
});

const SixB = memo(({ trails }) => {
  return <></>;
});

const SevenA = memo(({ trails }) => {
  return <></>;
});

const SevenB = memo(({ trails }) => {
  return <></>;
});

const TargetWrap = (props) => {
  const { latestFind, setLatestFind } = props;
  const { resetKey } = props;
  // const [latestFind, setLatestFind] = useState(null);
  console.log("latest", latestFind);

  const { gl, scene } = useThree();

  console.log("renderer.info", gl.info);
  console.log("renderer.info.memory", gl.info.memory);

  const posRef = useRef();
  //const AnchorTargetMemo = useMemo(() => AnchorTarget, [latestFind]);
  const AnchorTargetMemo = AnchorTarget;

  const [trails, api] = useTrail(
    5,
    () => ({ videoScale: 0, config: config.wobbly }),
    []
  );

  return (
    <>
      {/* <group scale={10}> */}
      <AnchorTargetMemo
        api={api}
        resetKey={resetKey}
        targetIndexInt={0}
        latestFind={latestFind}
        setLatestFind={setLatestFind}
        posRef={posRef}
        audioUrl={"/CLM.mp3"}
      >
        {latestFind === 0 ? <Cover trails={trails} /> : <></>}
      </AnchorTargetMemo>

      <AnchorTargetMemo
        api={api}
        resetKey={resetKey}
        targetIndexInt={2}
        latestFind={latestFind}
        setLatestFind={setLatestFind}
        posRef={posRef}
        audioUrl={"/Read_01a.mp3"}
      >
        {latestFind === 2 ? <OneA trails={trails} /> : <></>}
      </AnchorTargetMemo>

      <AnchorTargetMemo
        api={api}
        resetKey={resetKey}
        targetIndexInt={3}
        latestFind={latestFind}
        setLatestFind={setLatestFind}
        posRef={posRef}
        audioUrl={"/Read_01b.mp3"}
      >
        {latestFind === 3 ? <OneB trails={trails} /> : <></>}
      </AnchorTargetMemo>

      <AnchorTargetMemo
        api={api}
        resetKey={resetKey}
        targetIndexInt={4}
        latestFind={latestFind}
        setLatestFind={setLatestFind}
        posRef={posRef}
        audioUrl={"/Read_02a.mp3"}
      >
        {latestFind === 4 ? <TwoA trails={trails} /> : <></>}
      </AnchorTargetMemo>

      <AnchorTargetMemo
        api={api}
        resetKey={resetKey}
        targetIndexInt={5}
        latestFind={latestFind}
        setLatestFind={setLatestFind}
        posRef={posRef}
        audioUrl={"/Read_02b.mp3"}
      >
        {latestFind === 5 ? <TwoB trails={trails} /> : <></>}
      </AnchorTargetMemo>

      <AnchorTargetMemo
        api={api}
        resetKey={resetKey}
        targetIndexInt={6}
        latestFind={latestFind}
        setLatestFind={setLatestFind}
        posRef={posRef}
        audioUrl={"/Read_03a.mp3"}
      >
        {latestFind === 6 ? <ThreeA trails={trails} /> : <></>}
      </AnchorTargetMemo>

      <AnchorTargetMemo
        api={api}
        resetKey={resetKey}
        targetIndexInt={7}
        latestFind={latestFind}
        setLatestFind={setLatestFind}
        posRef={posRef}
        audioUrl={"/Read_03b.mp3"}
      >
        {latestFind === 7 ? <ThreeB trails={trails} /> : <></>}
      </AnchorTargetMemo>

      <AnchorTargetMemo
        api={api}
        resetKey={resetKey}
        targetIndexInt={8}
        latestFind={latestFind}
        setLatestFind={setLatestFind}
        posRef={posRef}
        audioUrl={"/Read_04a.mp3"}
      >
        {latestFind === 8 ? <FourA trails={trails} /> : <></>}
      </AnchorTargetMemo>

      <AnchorTargetMemo
        api={api}
        resetKey={resetKey}
        targetIndexInt={9}
        latestFind={latestFind}
        setLatestFind={setLatestFind}
        posRef={posRef}
        audioUrl={"/Read_04b.mp3"}
      >
        {latestFind === 9 ? <FourB trails={trails} /> : <></>}
      </AnchorTargetMemo>

      <AnchorTargetMemo
        api={api}
        resetKey={resetKey}
        targetIndexInt={10}
        latestFind={latestFind}
        setLatestFind={setLatestFind}
        posRef={posRef}
        audioUrl={"/Read_05a.mp3"}
      >
        {latestFind === 10 ? <FiveA trails={trails} /> : <></>}
      </AnchorTargetMemo>

      <AnchorTargetMemo
        api={api}
        resetKey={resetKey}
        targetIndexInt={11}
        latestFind={latestFind}
        setLatestFind={setLatestFind}
        posRef={posRef}
        audioUrl={"/Read_05b.mp3"}
      >
        {latestFind === 11 ? <FiveB trails={trails} /> : <></>}
      </AnchorTargetMemo>

      <AnchorTargetMemo
        api={api}
        resetKey={resetKey}
        targetIndexInt={12}
        latestFind={latestFind}
        setLatestFind={setLatestFind}
        posRef={posRef}
        audioUrl={"/Read_06a.mp3"}
      >
        {latestFind === 12 ? <SixA trails={trails} /> : <></>}
      </AnchorTargetMemo>
      <AnchorTargetMemo
        api={api}
        resetKey={resetKey}
        targetIndexInt={13}
        latestFind={latestFind}
        setLatestFind={setLatestFind}
        posRef={posRef}
        audioUrl={"/Read_06b.mp3"}
      >
        {latestFind === 13 ? <SixB trails={trails} /> : <></>}
      </AnchorTargetMemo>
      <AnchorTargetMemo
        api={api}
        resetKey={resetKey}
        targetIndexInt={15}
        latestFind={latestFind}
        setLatestFind={setLatestFind}
        posRef={posRef}
        audioUrl={"/Read_08b.mp3"}
      >
        {latestFind === 15 ? <SevenB trails={trails} /> : <></>}
      </AnchorTargetMemo>
      <AnchorTargetMemo
        api={api}
        resetKey={resetKey}
        targetIndexInt={14}
        latestFind={latestFind}
        setLatestFind={setLatestFind}
        posRef={posRef}
        audioUrl={"/Read_08a.mp3"}
      >
        {latestFind === 14 ? <SevenA trails={trails} /> : <></>}
      </AnchorTargetMemo>
      {/* </group> */}
    </>
  );
};

const AR = (props) => {
  const { latestFind, setLatestFind } = props;
  const { resetKey } = props;
  return (
    <>
      {/* <Canvas> */}

      {/* </Canvas> */}
      <ARView
        // mindar-image="uiScanning: #example-scanning-overlay;"
        // uiLoading="yes"
        // uiScanning="#example-scanning-overlay"
        imageTargets={multiTargets}
        filterMinCF={0.0001}
        filterBeta={0.004}
        missTolerance={1}
        warmupTolerance={5}
        // maxTrack={2}
        gl={glOptions}
        linear
      >
        <TargetWrap
          latestFind={latestFind}
          setLatestFind={setLatestFind}
          resetKey={resetKey}
        />
        {/* <TargetWrap resetKey={resetKey} /> */}
      </ARView>
    </>
  );
};

const glOptions = { antialias: true, toneMapping: THREE.NoToneMapping };

function App() {
  const [key, setKey] = useState("");

  const [latestFind, setLatestFind] = useState(4);
  const resetKey = useCallback(() => {
    const next = Math.random();
    console.log("resetting key to", next);
    setKey(next);
  }, [setKey]);

  return (
    <>
      <Ui>
        <AR
          resetKey={resetKey}
          latestFind={latestFind}
          setLatestFind={setLatestFind}
        />
      </Ui>
    </>
  );
}

export default App;
