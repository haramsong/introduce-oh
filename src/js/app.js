import * as THREE from "three";
import Firework from "./firework";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { chronology } from "/src/chronology";

export default function () {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    10000,
  );

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  camera.position.z = 5000;

  const fireworks = [];

  fireworks.update = function () {
    for (let i = 0; i < this.length; i++) {
      const firework = fireworks[i];

      firework.update();
    }
  }

  const light = new THREE.PointLight(0xffffff, 1);
  light.position.set(10, 10, 4980);
  light.intensity = 20; // 광원의 밝기 증가
  light.color.set(0xffffff); // 흰색 광원
  scene.add(light);


  let textMesh;
  const fontLoader = new FontLoader();
  fontLoader.load('/src/assets/fonts/SB_Aggro_Bold.json', (font) => {
    const textGeometry = new TextGeometry(chronology, {
      font: font,
      size: 20, // 텍스트 크기
      height: 5, // 텍스트 깊이
      curveSegments: 16,
    });

    const textMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xaaaaaa }); // 텍스트 색상
    textMesh = new THREE.Mesh(textGeometry, textMaterial);

    // 텍스트 초기 위치
    textMesh.position.set(-100, 0, 4920); // X, Y, Z 위치 설정
    const edges = new THREE.EdgesGeometry(textGeometry); // 윤곽선 생성
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 }); // 윤곽선 색상 (검정)
    const lineSegments = new THREE.LineSegments(edges, lineMaterial);
    textMesh.add(lineSegments); // 텍스트에 윤곽선 추가

    scene.add(textMesh);
  });

  // 애니메이션
  function animate() {
    requestAnimationFrame(animate);

    if (textMesh) {
      textMesh.position.y += 0.1; // Y축으로 이동
      textMesh.rotation.z = Math.PI * 0.01; // 약간의 기울기 추가
    }

    renderer.render(scene, camera);
  }

  render();
  animate();

  function render() {
    fireworks.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  }


  function handleMouseDown() {
    const firework = new Firework({
      x: Math.random() < 0.5 ? -1500 : 1500,
      y: THREE.MathUtils.randFloatSpread(500),
    });

    scene.add(firework.points);

    fireworks.push(firework);
  }

  window.addEventListener('resize', handleResize);
  window.addEventListener('mousedown', handleMouseDown);
}
