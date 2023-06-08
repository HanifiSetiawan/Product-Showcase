// Import the THREE.js library
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// To allow for the camera to move around the scene
import {
  OrbitControls
} from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
// To allow for importing the .gltf file
import {
  GLTFLoader
} from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// Create a Three.JS Scene
const scene = new THREE.Scene();
// Create a new camera with positions and angles
const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);

// Keep the 3D object on a global variable so we can access it later
let object;

// OrbitControls allow the camera to move around the scene
let controls;

// Set which object to render
let objToRender = 'laptop2';

// Instantiate a loader for the .gltf file
const loader = new GLTFLoader();

// Load the file
loader.load(
  `models/${objToRender}/scene.gltf`,
  function (gltf) {
    // If the file is loaded, add it to the scene
    object = gltf.scene;
    scene.add(object);
    // Create hotspots after loading the model
    createHotspot(new THREE.Vector3(0, 0.1, -0.25), 'LED Screen'); // Adjust the position as needed
    createHotspot(new THREE.Vector3(0, -0.12, 0), 'Keyboard');
  },
  function (xhr) {
    // While it is loading, log the progress
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  function (error) {
    // If there is an error, log it
    console.error(error);
  }
);

// Array to store the hotspots
let hotspots = [];

// Function to create hotspots
function createHotspot(position, label) {
  const hotspotElement = document.createElement('div');
  hotspotElement.classList.add('hotspot');
  hotspotElement.textContent = label;

  const hotspot = {
    element: hotspotElement,
    position: position,
    label: label
  };

  hotspots.push(hotspot);

  const container = document.getElementById('hotspotContainer');
  container.appendChild(hotspotElement);

  // Add an event listener to handle hotspot click
  hotspotElement.addEventListener('click', () => {
    // Perform the desired action when the hotspot is clicked
    console.log(`Clicked on hotspot: ${hotspot.label}`);
  });

  updateHotspotPosition(hotspot); // Update the initial position

  return hotspot;
}

// Update the position of a hotspot
function updateHotspotPosition(hotspot) {
  // Convert the 3D position to screen coordinates
  const screenPosition = hotspot.position.clone().project(camera);
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  // Position the hotspot element on the screen
  hotspot.element.style.left = `${screenPosition.x * windowHalfX + windowHalfX}px`;
  hotspot.element.style.top = `${-screenPosition.y * windowHalfY + windowHalfY}px`;
}

// Instantiate a new renderer and set its size
const renderer = new THREE.WebGLRenderer({
  alpha: true
}); // Alpha: true allows for the transparent background
renderer.setSize(window.innerWidth, window.innerHeight);

// Add the renderer to the DOM
document.getElementById("container3D").appendChild(renderer.domElement);

// Set how far the camera will be from the 3D model
camera.position.z = objToRender === "laptop2" ? 0.7 : 500;

// Add lights to the scene, so we can actually see the 3D model
const topLight = new THREE.DirectionalLight(0xffffff, 1); // (color, intensity)
topLight.position.set(500, 500, 500); // top-left-ish
topLight.castShadow = true;
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x333333, objToRender === "laptop2" ? 5 : 1);
scene.add(ambientLight);

// This adds controls to the camera, so we can rotate / zoom it with the mouse
if (objToRender === "laptop2") {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 0.5; // Set the minimum allowed distance (zoom in)
  controls.maxDistance = 1; // Set the maximum allowed distance (zoom out)
}

// Render the scene
function animate() {
  requestAnimationFrame(animate);
  // Update the hotspot positions whenever the camera or object changes
  hotspots.forEach(hotspot => updateHotspotPosition(hotspot));
  renderer.render(scene, camera);
}

// Add a listener to the window, so we can resize the window and the camera
window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start the 3D rendering
animate();

