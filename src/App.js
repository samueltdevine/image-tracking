import { ARAnchor, ARView } from "react-three-mind";
import cover from './cover.mind'
import { useThree } from "@react-three/fiber";

function Plane(props) {
  return (
    <mesh {...props}>
      <boxGeometry args={[1, 1, 0.1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}

function Foo(){
  const {gl, scene, camera} = useThree()
  return(
    <>
  <ambientLight />
  <pointLight position={[10, 10, 10]} />
  <ARAnchor target={0} onAnchorFound={() => gl.setClearColor(0x272727, 0.95)} onAnchorLost={() => gl.setClearColor(0x272727, 0.0)}>
  </ARAnchor>
    </>
  )
}


function degToRad(degrees) {
  var pi = Math.PI;
  return degrees * (pi / 180);
}

function App() {
  return (
    <ARView
      imageTargets={cover}
      filterMinCF={.00005}
      filterBeta={.001}
      missTolerance={10}
      warmupTolerance={0}
    >
   <Foo/>
    </ARView>
  );
}

export default App;
