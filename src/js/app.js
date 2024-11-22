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
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.zIndex = '-1';
  document.body.appendChild(renderer.domElement);
  camera.position.z = 5000;

  const listener = new THREE.AudioListener();
  camera.add(listener);

  const sound = new THREE.Audio(listener);
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load('/src/assets/audios/Star_Wars_Imperial_March.mp3', (buffer) => {
    if (buffer) {
      console.log('Audio loaded successfully');
      sound.setBuffer(buffer);
      sound.setLoop(true);
      sound.setVolume(0.3);
      sound.play(); // 오디오 재생
    }
  });

  const fireworkListener = new THREE.AudioListener();
  camera.add(fireworkListener);

  const fireworkSound = new THREE.Audio(fireworkListener);
  audioLoader.load('/src/assets/audios/firework.mp3', (buffer) => {
    if (buffer) {
      fireworkSound.setBuffer(buffer);
      fireworkSound.setVolume(0.2);
    }
  });
  const fireworks = [];

  fireworks.update = function () {
    for (let i = 0; i < this.length; i++) {
      const firework = fireworks[i];

      firework.update();
    }
  }

  const light = new THREE.PointLight(0xffffff, 1);
  light.position.set(10, 10, 4970);
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

    textGeometry.computeBoundingBox();
    const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
    const textHeight = textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y;

    const textMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xaaaaaa }); // 텍스트 색상
    textMesh = new THREE.Mesh(textGeometry, textMaterial);

    // 텍스트 초기 위치
    textMesh.position.set(-textWidth / 2, -textHeight / 2, 4840); // X, Y, Z 위치 설정
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
      textMesh.position.y += 0.2; // Y축으로 이동
      textMesh.rotation.z = 0.01; // 약간의 기울기 추가
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

  function startRandomIntervalEvent() {
    function triggerEvent() {
      const randomDelay = Math.random() * 1000 + 1000; // 1000~2000ms (1~2초)
      addFirework()

      // 다음 이벤트를 위한 타이머 설정
      setTimeout(triggerEvent, randomDelay);
    }

    triggerEvent(); // 초기 호출
  }

  startRandomIntervalEvent();

  function fadeOutAndPlay(audio, duration = 1) {
    const gain = audio.gain; // THREE.Audio 내부 GainNode 접근
    if (gain) {
      const currentTime = audio.context.currentTime;

      // 기존 볼륨 조정 취소 및 현재 값으로 시작
      gain.gain.cancelScheduledValues(currentTime);
      gain.gain.setValueAtTime(gain.gain.value, currentTime);

      // 볼륨을 0으로 페이드아웃
      gain.gain.linearRampToValueAtTime(0, currentTime + duration);

      // 페이드아웃 완료 후 stop 및 재생
      setTimeout(() => {
        audio.stop(); // 완전히 중지
        audio.play(); // 다시 재생
        audio.setVolume(0.3); // 원래 볼륨 복원
      }, duration * 1000); // duration을 밀리초로 변환
    } else {
      // GainNode가 없는 경우 바로 재생
      audio.stop();
      audio.play();
    }
  }


  function addFirework() {
    const firework = new Firework({
      x: Math.random() < 0.5 ? -3500 : 3500,
      y: THREE.MathUtils.randFloatSpread(3000),
    });

    scene.add(firework.points);
    fadeOutAndPlay(fireworkSound, 1)

    fireworkSound.play()

    fireworks.push(firework);
  }

  window.addEventListener('resize', handleResize);

  document.body.addEventListener('click', () => {
    if (sound.context.state === 'suspended') {
      sound.context.resume(); // 오디오 컨텍스트 활성화
    }
  });
}
