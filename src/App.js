import { ARAnchor, ARView } from "react-three-mind";
import cover from "./cover.mind";
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
  return material;
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
    side: THREE.BackSide,
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
  video.play();
  // const src = ideo.children[0].src;
  const texture = new THREE.VideoTexture(video);
  console.log("tex", texture);
  texture.format = THREE.RGBAFormat;
  return (
    <>
      {/* <Suspense fallback={FallbackMaterial}> */}
      <meshBasicMaterial
        map={texture}
        alphaMap={texture}
        transparent={true}
        opacity={10}
        side={THREE.DoubleSide}
        depthWrite={true}
        // depthTest={depthTest}
        toneMapped={false}
      />
      {/* </Suspense> */}
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
  const string = JSON.stringify(action);
  const refCurrent = ref.current;
  const children = refCurrent.children;
  console.log("action children", children);
  console.log("action string", string);
  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    const source = child.material.map.source.data;

    const map = child.material.map;
    const alphaMap = child.material.alphaMap;
    const material = child.material;

    if (string === "play") {
      source.play();
      console.log("action played");
    }
    if (string === "pause") {
      // console.log("action paused");
      // source.pause();
    }
    if (string === "dispose") {
      // console.log("action disposed", map, material);
      // map.dispose();
      // alphaMap.dispose();
      // material.dispose();
    }
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

const AnchorTarget = (props) => {
  const { gl, camera } = useThree();
  const { targetIndexInt, setLatestFind, children, audioUrl, posRef, api } =
    props;

  const ref = useRef();

  const listener = new THREE.AudioListener();

  camera.add(listener);

  const sound = new THREE.Audio(listener);
  // "/CLM.mp3"
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load(audioUrl, function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(0.2);
  });

  const handleCover = (prop) => {
    api.start({ videoScale: prop.scale });
  };

  //on start

  // actionTexture(ref, "play");

  return (
    <>
      <ARAnchor
        target={targetIndexInt}
        onAnchorFound={() => {
          gl.setClearColor(0x272727, 0.7);
          setLatestFind(targetIndexInt);
          if (sound.isPlaying !== true) {
            sound.play();
          }
          let prop = { scale: 0.0 };
          handleCover(prop);
          prop.scale = 1.0;
          handleCover(prop);
        }}
        onAnchorLost={() => {
          console.log("lost");
          sound.pause();
          actionTexture(ref, "pause");
          actionTexture(ref, "dispose");
          let prop = { scale: 0.0 };
          handleCover(prop);
          setLatestFind(null);
          gl.dispose();
          gl.setClearColor(0x272727, 0.0);
        }}
      >
        <group scale={0.7} position={[0, 0, 0]} ref={ref}>
          {children}
        </group>
      </ARAnchor>
    </>
  );
};

const Cover = ({ trails }) => {
  return (
    <>
      <animated.mesh position={[0.0, 0.5, -0.3]} scale={trails[0].videoScale}>
        <VideoMat id={"MXT_CLM_Comp_LogoAnimation_SD_01-1.mov"} />
        <planeGeometry args={[1.92, 1.08, 1]} />
      </animated.mesh>
      <animated.mesh position={[-0.45, 0, -0.1]} scale={trails[1].videoScale}>
        <VideoMat id={"MXT_CLM_Comp_LogoAnimtion_PinkMonster_CV_.mp4"} />
        <planeGeometry args={[1, 0.52, 1]} />
        <SimplePlane />
      </animated.mesh>
      <animated.mesh position={[0.35, -0.1, 0]} scale={trails[2].videoScale}>
        <VideoMat id={"MXT_CLM_Comp_LogoAnimtion_GreenMonster_CV_.mp4"} />
        <SimplePlane />
      </animated.mesh>
      <animated.mesh position={[-0.5, 0, 0.1]} scale={trails[3].videoScale}>
        <VideoMat id={"MXT_CLM_Comp_LogoAnimtion_YellowMonster_CV_h265.mp4"} />
        <SimplePlane />
      </animated.mesh>
      <animated.mesh position={[0.3, 0, -0.2]} scale={trails[4].videoScale}>
        <VideoMat id={"MXT_CLM_Comp_LogoAnimtion_OrangeMonster_CV_.mp4"} />
        <SimplePlane />
      </animated.mesh>
    </>
  );
};

const OneA = ({ trails }) => {
  return (
    <>
      <animated.mesh position={[0.0, 0, 0.2]} scale={trails[0].videoScale}>
        <VideoMat id={"MXT_CLM_010_MG_SD_05-1.mov"} />
        <SimplePlane />
      </animated.mesh>
      <animated.mesh position={[-0.1, 0, 0.0]} scale={trails[1].videoScale}>
        <SimplePlane />
        <ImageMaterial id={"picOneAfg"} />
      </animated.mesh>
      <animated.mesh position={[0.0, 0.0, -0.4]} scale={trails[2].videoScale}>
        <ImageMaterial id={"picOneAbg1"} />
        <SimplePlane />
      </animated.mesh>
      <animated.mesh position={[-0.2, 0.0, -0.5]} scale={trails[3].videoScale}>
        <ImageMaterial id={"picOneAbg2"} />
        <SimplePlane />
      </animated.mesh>
    </>
  );
};
const OneB = ({ trails }) => {
  return (
    <>
      <animated.mesh position={[-0.1, 0, 0.0]} scale={trails[0].videoScale}>
        <SimplePlane />
        {/* <ImageMaterial id={"picOneAfg"} /> */}
      </animated.mesh>
      <animated.mesh position={[0.0, 0.0, -0.4]} scale={trails[1].videoScale}>
        {/* <ImageMaterial id={"picOneAbg1"} /> */}
        <SimplePlane />
      </animated.mesh>
      <animated.mesh position={[-0.2, 0.0, -0.5]} scale={trails[2].videoScale}>
        {/* <ImageMaterial id={"picOneAbg2"} /> */}
        <SimplePlane />
      </animated.mesh>
    </>
  );
};
const TwoA = ({ trails }) => {
  return (
    <>
      <animated.mesh position={[0.0, 0.0, 0.2]} scale={trails[0].videoScale}>
        <ImageMaterial id={"MXT_CLM_2D_SD_030_03_FG.webp"} />
        <SimplePlane />
      </animated.mesh>
      <animated.mesh position={[0.0, 0.0, 0]} scale={trails[1].videoScale}>
        <ImageMaterial id={"MXT_CLM_2D_SD_030_03_MG.webp"} />
        <SimplePlane />
      </animated.mesh>
    </>
  );
};
const TwoB = ({ trails }) => {
  return (
    <>
      <animated.mesh position={[0.0, 0.0, 0.2]} scale={trails[0].videoScale}>
        <ImageMaterial id={"MXT_CLM_2D_SD_040_03_FG.webp"} />
        <SimplePlane />
      </animated.mesh>
      <animated.mesh position={[0.0, 0.0, -0.2]} scale={trails[1].videoScale}>
        <ImageMaterial id={"MXT_CLM_2D_SD_040_03_BG.webp"} />
        <SimplePlane />
      </animated.mesh>
      {/* <animated.mesh
        position={[0.0, 0, 0.4]}
        scale={1.0}
      >
        <VideoMat id={"MXT_CLM_030_Comp_Music_SD_01-1.mov"} />

        <planeGeometry args={[1.24, 1, 1]} />
  */}
    </>
  );
};
const ThreeA = ({ trails }) => {
  return (
    <>
      <animated.mesh position={[0.0, 0.0, 0.2]} scale={trails[0].videoScale}>
        <ImageMaterial id={"MXT_CLM_2D_SD_050_FG.webp"} />
        <SimplePlane />
      </animated.mesh>
      <animated.mesh position={[0.0, 0.0, 0.0]} scale={trails[1].videoScale}>
        <ImageMaterial id={"MXT_CLM_2D_SD_050_MG.webp"} />
        <SimplePlane />
      </animated.mesh>
      <animated.mesh position={[0.0, 0.0, -0.2]} scale={trails[2].videoScale}>
        <ImageMaterial id={"MXT_CLM_2D_SD_050_BG.webp"} />
        <SimplePlane />
      </animated.mesh>
      {/* <animated.mesh
        position={[0.0, 0, 0.4]}
        scale={1.0}
      >
        <VideoMat id={"MXT_CLM_030_Comp_Music_SD_01-1.mov"} />

        <planeGeometry args={[1.24, 1, 1]} />
  */}
    </>
  );
};
const ThreeB = ({ trails }) => {
  return (
    <>
      <animated.mesh position={[0.0, 0.0, 0.2]} scale={trails[0].videoScale}>
        <ImageMaterial id={"MXT_CLM_2D_SD_060_02_FG.webp"} />
        <SimplePlane />
      </animated.mesh>
      <animated.mesh position={[0.0, 0.0, 0.0]} scale={trails[1].videoScale}>
        <ImageMaterial id={"MXT_CLM_2D_SD_060_02_MG.webp"} />
        <SimplePlane />
      </animated.mesh>
      <animated.mesh position={[0.0, 0.0, -0.2]} scale={trails[2].videoScale}>
        <ImageMaterial id={"MXT_CLM_2D_SD_060_02_BG.webp"} />
        <SimplePlane />
      </animated.mesh>
      {/* <animated.mesh
        position={[0.0, 0, 0.4]}
        scale={1.0}
      >
        <VideoMat id={"MXT_CLM_030_Comp_Music_SD_01-1.mov"} />

        <planeGeometry args={[1.24, 1, 1]} />
  */}
    </>
  );
};
const FourA = ({ trails }) => {
  return (
    <>
      <animated.mesh position={[0.0, 0.0, 0.2]} scale={trails[0].videoScale}>
        <ImageMaterial id={"MXT_CLM_2D_SD_070_02_FG.webp"} />
        <SimplePlane />
      </animated.mesh>

      {/* <animated.mesh
        position={[0.0, 0, 0.4]}
        scale={1.0}
      >
        <VideoMat id={"MXT_CLM_030_Comp_Music_SD_01-1.mov"} />

        <planeGeometry args={[1.24, 1, 1]} />
  */}
    </>
  );
};
const FourB = ({ trails }) => {
  return (
    <>
      <animated.mesh position={[-0.6, 0.0, 0.2]} scale={trails[0].videoScale}>
        <ImageMaterial id={"MXT_CLM_2D_SD_080_02_FG.webp"} />
        <planeGeometry args={[2.4, 1.0, 1]} />
        {/* <SimplePlane /> */}
      </animated.mesh>
      {/* <animated.mesh
        position={[0.0, 0, 0.4]}
        scale={1.0}
      >
        <VideoMat id={"MXT_CLM_030_Comp_Music_SD_01-1.mov"} />

        <planeGeometry args={[1.24, 1, 1]} />
  */}
    </>
  );
};

const FiveA = ({ trails }) => {
  return (
    <>
      <animated.mesh position={[0.0, 0.0, 0.2]} scale={trails[0].videoScale}>
        <ImageMaterial id={"MXT_CLM_2D_SD_090_02_FG.webp"} />
        <SimplePlane />
      </animated.mesh>
      <animated.mesh position={[0.0, 0.0, 0.0]} scale={trails[1].videoScale}>
        <ImageMaterial id={"MXT_CLM_2D_SD_090_02_MG.webp"} />
        <SimplePlane />
      </animated.mesh>
      {/* <animated.mesh
        position={[0.0, 0, 0.4]}
        scale={1.0}
      >
        <VideoMat id={"MXT_CLM_030_Comp_Music_SD_01-1.mov"} />

        <planeGeometry args={[1.24, 1, 1]} />
  */}
    </>
  );
};
const FiveB = ({ trails }) => {
  return (
    <>
      <animated.mesh position={[0.0, 0.0, 0.2]} scale={trails[0].videoScale}>
        <ImageMaterial id={"MXT_CLM_2D_SD_100_02_FG.webp"} />
        <SimplePlane />
      </animated.mesh>
      {/* <animated.mesh
        position={[0.0, 0, 0.4]}
        scale={1.0}
      >
        <VideoMat id={"MXT_CLM_030_Comp_Music_SD_01-1.mov"} />

        <planeGeometry args={[1.24, 1, 1]} />
  */}
    </>
  );
};

const SixA = ({ trails }) => {
  return (
    <>
      <animated.mesh position={[0.0, 0.0, 0.2]} scale={trails[0].videoScale}>
        <ImageMaterial id={"MXT_CLM_2D_SD_110_SD_FG.webp"} />
        <SimplePlane />
      </animated.mesh>
      {/* <animated.mesh position={[0.0, 0, 0.4]} scale={1.0}>
        <VideoMat id={"MXT_CLM_120_Comp_Couch_SD_01-1.mov"} />
        <planeGeometry args={[1.24, 1, 1]} />
      </animated.mesh>
      <animated.mesh position={[0.0, 0, 0.3]} scale={1.0}>
        <VideoMat id={"MXT_CLM_120_Comp_Lamp_SD_01-1.mov"} />
        <planeGeometry args={[1.24, 1, 1]} />
      </animated.mesh> */}
    </>
  );
};

const SixB = ({ trails }) => {
  return (
    <>
      <animated.mesh position={[0.0, 0.0, 0.2]} scale={trails[0].videoScale}>
        <ImageMaterial id={"MXT_CLM_2D_SD_120_SD_FG.webp"} />
        <SimplePlane />
      </animated.mesh>
      <animated.mesh position={[0.0, 0.0, 0.0]} scale={trails[1].videoScale}>
        <ImageMaterial id={"MXT_CLM_2D_SD_120_SD_MG.webp"} />
        <SimplePlane />
      </animated.mesh>

      {/* <animated.mesh
        position={[0.0, 0, 0.4]}
        // material={matSixBFG}
        scale={1.0}
      >
        <VideoMat id={"MXT_CLM_130_FG_SD_01-1.mov"} />
        <planeGeometry args={[1.24, 1, 1]} />
      </animated.mesh>
      <animated.mesh position={[0.0, 0, -5.3]} scale={1.0}>
        <VideoMat id={"MXT_CLM_130_BG_SD_01-1.mov"} />
        <planeGeometry args={[12.0, 10, 1]} />
      </animated.mesh> */}
    </>
  );
};

const SevenA = ({ trails }) => {
  return (
    <>
      <animated.mesh position={[0.0, 0.0, 0.2]} scale={trails[0].videoScale}>
        <ImageMaterial id={"MXT_CLM_2D_SD_130_02_FG.webp"} />
        <SimplePlane />
      </animated.mesh>
      <animated.mesh position={[0.0, 0.0, 0.0]} scale={trails[1].videoScale}>
        <ImageMaterial id={"MXT_CLM_2D_SD_130_02_MG.webp"} />
        <SimplePlane />
      </animated.mesh>
    </>
  );
};
const SevenB = ({ trails }) => {
  return (
    <>
      <animated.mesh position={[0.0, 0, 0.4]} scale={1.0}>
        <VideoMat id={"MXT_CLM_COMP_FG1_150_SD_10.mp4"} />
        <planeGeometry args={[1.24, 1, 1]} />
      </animated.mesh>
      <animated.mesh position={[0.0, 0, 0.3]} scale={1.0}>
        <VideoMat id={"MXT_CLM_COMP_FG2_150_SD_10.mp4"} />
        <planeGeometry args={[1.24, 1, 1]} />
      </animated.mesh>
      <animated.mesh position={[0.0, 0.0, 0.2]} scale={1.0}>
        <VideoMat id={"MXT_CLM_COMP_MG_150_SD_10.mp4"} />
        <planeGeometry args={[1.24, 1, 1]} />
      </animated.mesh>
      <animated.mesh position={[0.0, 0.0, 0.0]} scale={1.0}>
        <VideoMat id={"MXT_CLM_COMP_BG_150_SD_10.mp4"} />
        <planeGeometry args={[1.24, 1, 1]} />
      </animated.mesh>
    </>
  );
};

const TargetWrap = (props) => {
  const [latestFind, setLatestFind] = useState(null);
  console.log("latest", latestFind);
  const { gl, scene } = useThree();
  const posRef = useRef();
  const AnchorTargetMemo = useMemo(() => AnchorTarget, [latestFind]);
  const [trails, api] = useTrail(
    5,
    () => ({ videoScale: 0, config: config.wobbly }),
    []
  );

  return (
    <>
      <AnchorTargetMemo
        api={api}
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
        targetIndexInt={14}
        latestFind={latestFind}
        setLatestFind={setLatestFind}
        posRef={posRef}
        audioUrl={"/Read_08a.mp3"}
      >
        {latestFind === 14 ? <SevenA trails={trails} /> : <></>}
      </AnchorTargetMemo>
    </>
  );
};

function App() {
  return (
    <>
      <Ui>
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
          gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
          linear
        >
          <TargetWrap />
        </ARView>
      </Ui>

      {/* </div> */}
    </>
  );
}

export default App;
