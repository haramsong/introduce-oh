import * as THREE from "three";
import Firework from "@/js/firework.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { chronology } from "@/chronology.js";

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

  let soundControl = false;

  const listener = new THREE.AudioListener();
  camera.add(listener);

  let resourcesLoaded = 0;
  const totalResources = 3; // 총 로딩해야 할 리소스 개수

  function checkResourcesLoaded() {
    resourcesLoaded += 1;
    if (resourcesLoaded === totalResources) {
      hideLoadingSpinner(); // 모든 리소스가 로딩되면 스피너 숨기기
      animate();
      startRandomIntervalEvent();
    }
  }

  function hideLoadingSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
      spinner.style.display = 'none'; // 스피너 숨기기
    }
  }

  const sound = new THREE.Audio(listener);
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load('/assets/audios/oh_gospel.mp3', (buffer) => {
    if (buffer) {
      console.log('Audio loaded successfully');
      sound.setBuffer(buffer);
      sound.setLoop(true);
      sound.setVolume(0.3);
      checkResourcesLoaded();
    }
  });

  const fireworkListener = new THREE.AudioListener();
  camera.add(fireworkListener);

  const fireworkSound = new THREE.Audio(fireworkListener);
  audioLoader.load('/assets/audios/firework.mp3', (buffer) => {
    if (buffer) {
      fireworkSound.setBuffer(buffer);
      fireworkSound.setVolume(0.13);
      checkResourcesLoaded();
    }
  });
  camera.remove(fireworkListener)

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
  fontLoader.load('/assets/fonts/SB_Aggro_Bold.json', (font) => {
    const textGeometry = new TextGeometry(chronology, {
      font: font,
      size: 6.5, // 텍스트 크기
      height: 0.5, // 텍스트 깊이
      curveSegments: 16,
    });

    textGeometry.computeBoundingBox();
    const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
    const textHeight = textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y;

    const textMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xaaaaaa }); // 텍스트 색상
    textMesh = new THREE.Mesh(textGeometry, textMaterial);

    // 텍스트 초기 위치
    textMesh.position.set(-textWidth / 2, -textHeight / 3.5, 4840); // X, Y, Z 위치 설정
    const edges = new THREE.EdgesGeometry(textGeometry); // 윤곽선 생성
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 }); // 윤곽선 색상 (검정)
    const lineSegments = new THREE.LineSegments(edges, lineMaterial);
    textMesh.add(lineSegments); // 텍스트에 윤곽선 추가

    checkResourcesLoaded();

    scene.add(textMesh);
  });

  let lastFireworkTime = 0;

  // 애니메이션
  function animate() {
    requestAnimationFrame(animate); // 반복 호출

    if (textMesh) {
      textMesh.position.y += 0.13; // Y축으로 이동
      textMesh.rotation.z = 0.005; // 약간의 기울기 추가
    }

    renderer.render(scene, camera);
  }

  render();

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
      const now = Date.now();
      const randomDelay = Math.random() * 2000 + 300; // 300~2300ms (0.3~2.3초)
      if (now - lastFireworkTime > randomDelay) {
        addFirework()
        lastFireworkTime = now;
      }

      // 다음 이벤트를 위한 타이머 설정
      setTimeout(triggerEvent, randomDelay);
    }

    triggerEvent(); // 초기 호출
  }

  function fadeOutAndPlay(audio, duration = 1) {
    if (!soundControl) return;
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
        audio.setVolume(0.13); // 원래 볼륨 복원
      }, duration * 1000); // duration을 밀리초로 변환
    } else {
      // GainNode가 없는 경우 바로 재생
      audio.stop();
      audio.play();
    }
  }


  function addFirework() {
    const firework = new Firework({
      x: Math.random() < 0.5 ? -4000 + THREE.MathUtils.randFloatSpread(500) : 4000 + THREE.MathUtils.randFloatSpread(500),
      y: THREE.MathUtils.randFloatSpread(5000),
    });
    fadeOutAndPlay(fireworkSound, 0.1)

    if (document.visibilityState === 'visible') {
      scene.add(firework.points);
      fireworks.push(firework);
      if (fireworks.length > 5) {
        fireworks.shift();
      }
    } else {
      scene.remove(firework.points)
    }
  }

  window.addEventListener('resize', handleResize);

  const soundIcon = document.querySelector('.sound-icon');

  function toggleSoundIcon(isActive) {
    if (isActive) {
      soundControl = true
      sound.play(); // 사운드 재생
      soundIcon.classList.add('active'); // 활성화 클래스 추가
    } else {
      soundControl = false
      sound.pause(); // 사운드 재생
      soundIcon.classList.remove('active'); // 클래스 제거
    }
  }

  // 클릭 이벤트에 `active` 토글 적용
  soundIcon.addEventListener('click', () => {
    if (soundIcon.classList.contains('active')) {
      toggleSoundIcon(false); // 비활성화 표시
    } else {
      toggleSoundIcon(true); // 활성화 표시
    }
  });

  var logo = document.querySelector(".logo_area");

  logo.addEventListener('click', () => {
    window.location.reload();
  })
}
