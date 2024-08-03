import * as THREE from '../node_modules/three/build/three.module.js';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(57, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; 
document.body.appendChild(renderer.domElement);

const geometry = new THREE.SphereGeometry(0.5, 32, 32);
const sphereMaterial1 = new THREE.MeshStandardMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 });
const sphereMaterial2 = new THREE.MeshStandardMaterial({ color: 0xff0000 });

const sphere1 = new THREE.Mesh(geometry, sphereMaterial1);
const sphere2 = new THREE.Mesh(geometry, sphereMaterial2);
scene.add(sphere1);
scene.add(sphere2);

sphere1.position.set(0, 0, 0);
sphere2.position.set(2, 0, 0);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5).normalize();
light.castShadow = true; 
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040); 
scene.add(ambientLight);

const planeGeometry = new THREE.PlaneGeometry(500, 500);
const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.5 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = - Math.PI / 2;
plane.position.y = -1;
plane.receiveShadow = true; 
scene.add(plane);

sphere1.castShadow = true;
sphere1.receiveShadow = true;
sphere2.castShadow = true;
sphere2.receiveShadow = true;

const lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
const points = [];
points.push(new THREE.Vector3(0, 0, 0));
points.push(new THREE.Vector3(1, 0, 0));

const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
const line = new THREE.Line(lineGeometry, lineMaterial);
scene.add(line);

function detectCollision(sphere1, sphere2) {
    const distance = sphere1.position.distanceTo(sphere2.position);
    ChangeDistancetext(distance);
    const combinedRadius = sphere1.geometry.parameters.radius + sphere2.geometry.parameters.radius;
    return distance <= combinedRadius;
}

function resolveCollision(sphere1, sphere2) {
    const distance = sphere1.position.distanceTo(sphere2.position);
    ChangeDistancetext(distance);
    const combinedRadius = sphere1.geometry.parameters.radius + sphere2.geometry.parameters.radius;
    if (distance < combinedRadius) {
        const normal = new THREE.Vector3().subVectors(sphere2.position, sphere1.position).normalize();
        const overlap = combinedRadius - distance;
        sphere1.position.sub(normal.clone().multiplyScalar(overlap / 2));
        sphere2.position.add(normal.clone().multiplyScalar(overlap / 2));
    }
}

function escapeFromSphere1(sphere1, sphere2) {
    const direction = new THREE.Vector3().subVectors(sphere2.position, sphere1.position).normalize();
    sphere2.position.add(direction.multiplyScalar(0.1));
}

function animate() {
    requestAnimationFrame(animate);

    if (detectCollision(sphere1, sphere2)) {
        resolveCollision(sphere1, sphere2);
        escapeFromSphere1(sphere1, sphere2);
        sphere2.material.color.set(0x00ff00);
        line.material.color.set(0xff0000);
    } else {
        sphere1.material.transparent = true;
        sphere2.material.color.set(0xff0000);
        line.material.color.set(0x0000ff);
    }

    const start = new THREE.Vector3();
    const end = new THREE.Vector3();
    sphere1.getWorldPosition(start);
    sphere2.getWorldPosition(end);
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    line.geometry.dispose();
    line.geometry = lineGeometry;

    const vector = new THREE.Vector3();
    sphere1.getWorldPosition(vector);
    const projection = vector.project(camera);

    const widthHalf = window.innerWidth / 2;
    const heightHalf = window.innerHeight / 2;

    const x = projection.x * widthHalf + widthHalf;
    const y = -projection.y * heightHalf + heightHalf;

    const h1 = document.getElementById('Sone');
    h1.style.left = `${x - 180}px`;
    h1.style.top = `${y}px`;

    renderer.render(scene, camera);
}

animate();

// Movimiento de la esfera con el ratón
window.addEventListener('mousemove', (event) => {
    setTimeout(() => {
        ChangeDistancetext(sphere1.position.distanceTo(sphere2.position));
        const x = (event.clientX / window.innerWidth) * 2 - 1;
        const y = -(event.clientY / window.innerHeight) * 2 + 1;
        const vector = new THREE.Vector3(x, y, 0.5);
        vector.unproject(camera);
        const dir = vector.sub(camera.position).normalize();
        const distance = -camera.position.z / dir.z;
        const pos = camera.position.clone().add(dir.multiplyScalar(distance));
        sphere1.position.copy(pos);
    }, 80);
});

function ChangeDistancetext(distance) {
    const textD = document.getElementById('distance');
    textD.innerHTML = `Distance between sphere1 and sphere2: ${distance.toFixed(2)}`;
}

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
