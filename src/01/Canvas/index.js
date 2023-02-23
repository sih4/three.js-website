import * as THREE from "three";
import * as dat from "lil-gui";
import gsap from "gsap";
import { Power2 } from "gsap/all";
import { ScrollTrigger } from "gsap/all";

const itemWrapper = document.querySelector(".side-scroll__itemOuter");
const itemInner = document.querySelector(".side-scroll__itemInner");

gsap.registerPlugin(ScrollTrigger);
gsap.to(itemInner, {
  x: () => -(itemInner.clientWidth - itemWrapper.clientWidth),
  ease: "none",
  scrollTrigger: {
    trigger: ".side-scroll__section",
    start: "top top",
    end: () => `+=${itemInner.clientWidth - itemWrapper.clientWidth}`,
    scrub: true,
    pin: true,
    invalidateOnRefresh: true,
    anticipatePin: 1,
    snap: {
      // スナップスクロールにする
      snapTo: 1 / (3 - 1), // スナップで移動させる位置
      duration: { min: 0.2, max: 3 }, // スナップで移動する際の遅延時間
      ease: Power2.easeInOut, // easing
    },
  },
});

/**
 * Debug
 */
const gui = new dat.GUI();
gui.hide();

// parameters
const parameters = {
  materialColor1: "#89e7e7",
  materialColor2: "#ffc0cb",
  materialColor3: "#7fffd4",
};

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Texture
const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load("/images/textures/gradients/3.jpg");
gradientTexture.magFilter = THREE.NearestFilter;

/**
 * Test cube
 */
// const cube = new THREE.Mesh(
//   new THREE.BoxGeometry(1, 1, 1),
//   new THREE.MeshBasicMaterial({ color: "#ff0000" })
// );
// scene.add(cube);

const material1 = new THREE.MeshToonMaterial({
  color: parameters.materialColor1,
  gradientMap: gradientTexture,
});
const material2 = new THREE.MeshToonMaterial({
  color: parameters.materialColor2,
  gradientMap: gradientTexture,
});
const material3 = new THREE.MeshToonMaterial({
  color: parameters.materialColor3,
  gradientMap: gradientTexture,
});

const mesh1 = new THREE.Mesh(
  new THREE.TorusGeometry(1, 0.4, 16, 60),
  material1
);

const mesh2 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), material2);

const mesh3 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
  material3
);
const objectsDistance = 7;
mesh1.position.x = objectsDistance * 0;

mesh2.position.x = objectsDistance * 1;
mesh2.position.y = -1;

mesh3.position.x = objectsDistance * 2;
mesh3.position.y = 1;
const sectionMeshes = [mesh1, mesh2, mesh3];

scene.add(mesh1, mesh2, mesh3);

const particlesCount = 400;
const positions = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount; i++) {
  positions[i * 3 + 0] =
    objectsDistance * -0.5 +
    Math.random() * objectsDistance * sectionMeshes.length;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
}

const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);

// Material
const particlesMaterial = new THREE.PointsMaterial({
  color: parameters.materialColor,
  sizeAttenuation: true,
  size: 0.03,
});

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight("#ffffff", 1);
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

let scrollY = window.scrollY;
let currentSection = 0;

window.addEventListener("scroll", () => {
  scrollY = window.scrollY;

  const newSection = Math.round(scrollY / sizes.width);

  if (newSection != currentSection) {
    currentSection = newSection;

    gsap.to(sectionMeshes[currentSection].rotation, {
      duration: 1.5,
      ease: "power2.inOut",
      x: "+=6",
      y: "+=3",
      z: "+=1.5",
    });
  }
});

/**
 * Cursor
 */
const cursor = {};
cursor.x = 0;
cursor.y = 0;

window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = event.clientY / sizes.height - 0.5;
});

// Base camera
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 9;
cameraGroup.add(camera);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearAlpha(0);

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  for (const mesh of sectionMeshes) {
    mesh.rotation.x += deltaTime * 0.1;
    mesh.rotation.y += deltaTime * 0.12;
  }

  camera.position.x = (scrollY / sizes.width) * objectsDistance;

  const parallaxX = cursor.x * 0.5;
  const parallaxY = -cursor.y * 0.5;

  cameraGroup.position.x +=
    (parallaxX - cameraGroup.position.x) * 5 * deltaTime;
  cameraGroup.position.y +=
    (parallaxY - cameraGroup.position.y) * 5 * deltaTime;

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
