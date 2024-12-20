import * as THREE from "three";
import Firework from "@/js/firework.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { mobile_chronology, chronology } from "@/chronology.js";

export default function () {
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  const renderer = new THREE.WebGLRenderer({
    antialias: !isMobile,
  });
  renderer.setPixelRatio(window.devicePixelRatio);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    10000,
  );

  let cameraZPosition;
  let heightScale;
  let textSize;
  let fireworkPosition;
  let fireworkXRandom;
  let chronologyText;
  let lightZPosition;

  if (window.innerWidth <= 1024) {
    cameraZPosition = window.innerWidth / 5 + 4685
    chronologyText = mobile_chronology
    heightScale = 6.5 + window.innerWidth / 170
  } else {
    cameraZPosition = window.innerWidth / 8 + 4625
    chronologyText = chronology
    heightScale = 2 + window.innerWidth / 400
  }
  textSize = 6.5
  fireworkPosition = window.innerWidth * 2 + 1000
  fireworkXRandom = 4 * window.innerWidth / 5 + 100

  lightZPosition = cameraZPosition + 30;

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
  const totalResources = 3;

  function checkResourcesLoaded() {
    resourcesLoaded += 1;
    if (resourcesLoaded === totalResources) {
      hideLoadingSpinner();
      animate();
      startRandomIntervalEvent();
    }
  }

  function hideLoadingSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
      spinner.style.display = 'none';
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
  light.position.set(10, 10, lightZPosition);
  light.intensity = 25;
  light.color.set(0xffffff);
  scene.add(light);


  let textMesh;
  const fontLoader = new FontLoader();
  fontLoader.load('/assets/fonts/SB_Aggro_Bold.json', (font) => {
    const textGeometry = new TextGeometry(chronologyText, {
      font: font,
      size: textSize,
      height: 0.3,
      curveSegments: 6,
    });

    textGeometry.computeBoundingBox();
    const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
    const textHeight = textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y;

    const textMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xaaaaaa });
    textMesh = new THREE.Mesh(textGeometry, textMaterial);

    textMesh.position.set(-textWidth / 2, -textHeight / heightScale, cameraZPosition);
    const edges = new THREE.EdgesGeometry(textGeometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const lineSegments = new THREE.LineSegments(edges, lineMaterial);
    textMesh.add(lineSegments);
    textMesh.frustumCulled = true;

    checkResourcesLoaded();

    scene.add(textMesh);
  });

  let lastFireworkTime = 0;
  let lastFrameTime = 0;
  let lastTextUpdateTime = 0;
  const textUpdateInterval = 30;
  const fps = 30;
  const frameInterval = 1000 / fps;

  function animate() {
    const now = Date.now();
    const delta = now - lastFrameTime;

    if (textMesh && now - lastTextUpdateTime > textUpdateInterval) {
      textMesh.position.y += 0.4;
      textMesh.rotation.z = 0.005;
    }

    if (delta > frameInterval) {
      renderer.render(scene, camera);
      lastFrameTime = now - (delta % frameInterval);
    }
    requestAnimationFrame(animate);
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
      const randomDelay = Math.random() * 2000 + 300;
      if (now - lastFireworkTime > randomDelay) {
        addFirework()
        lastFireworkTime = now;
      }

      setTimeout(triggerEvent, randomDelay);
    }

    triggerEvent();
  }

  function fadeOutAndPlay(audio, duration = 1) {
    if (!soundControl) return;
    const gain = audio.gain;
    if (gain) {
      const currentTime = audio.context.currentTime;
      gain.gain.cancelScheduledValues(currentTime);
      gain.gain.setValueAtTime(gain.gain.value, currentTime);
      gain.gain.linearRampToValueAtTime(0, currentTime + duration);

      setTimeout(() => {
        audio.stop();
        audio.play();
        audio.setVolume(0.13);
      }, duration * 1000);
    } else {
      audio.stop();
      audio.play();
    }
  }


  function addFirework() {
    const firework = new Firework({
      x: Math.random() < 0.5 ? -fireworkPosition + THREE.MathUtils.randFloatSpread(fireworkXRandom) : fireworkPosition + THREE.MathUtils.randFloatSpread(fireworkXRandom),
      y: THREE.MathUtils.randFloatSpread(5000),
    });
    fadeOutAndPlay(fireworkSound, 0.1)

    if (document.visibilityState === 'visible') {
      scene.add(firework.points);
      fireworks.push(firework);
      if (fireworks.length > 5) {
        const oldFirework = fireworks.shift();
        scene.remove(oldFirework.points);
      }
    } else {
      scene.remove(firework.points)
    }
    setTimeout(() => {
      scene.remove(firework.points)
    }, 3000);
  }

  window.addEventListener('resize', handleResize);

  const soundIcon = document.querySelector('.sound-icon');

  function toggleSoundIcon(isActive) {
    if (isActive) {
      soundControl = true
      sound.play().catch(err => {
        console.error("Failed to play audio:", err);
      });
    } else {
      soundControl = false
      sound.pause();
    }
  }

  soundIcon.addEventListener('click', () => {
    if (soundIcon.classList.contains('active')) {
      soundIcon.classList.remove('active');
      toggleSoundIcon(false);
    } else {
      soundIcon.classList.add('active');
      toggleSoundIcon(true);
    }
  });

  soundIcon.addEventListener('click', () => {
    const audioContext = THREE.AudioContext.getContext();
    if (audioContext.state === 'suspended') {
      audioContext.resume().then(() => {
        console.log('Audio context resumed');
      }).catch(err => {
        console.error('Failed to resume audio context:', err);
      });
    }
  }, { once: true });

  var logo = document.querySelector(".logo_area");

  logo.addEventListener('click', () => {
    window.location.reload();
  })
}
