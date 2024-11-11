import * as THREE from 'three';

// Basic Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.set(0, 50, 50);
camera.lookAt(0, 0, 0);

// Maze configuration
const mazeSize = 10; // Size of maze (e.g., 10x10 grid)
const cellSize = 2;

// Create a 2D array to represent the maze
const maze = Array(mazeSize).fill(null).map(() => Array(mazeSize).fill(false));

// Create a stack to keep track of the path (for DFS)
const stack = [];
let currentCell = { x: 0, z: 0 };
maze[0][0] = true;
stack.push(currentCell);

// Maze generation using DFS algorithm
function generateMaze() {
    if (stack.length > 0) {
        const { x, z } = currentCell;
        const neighbors = getUnvisitedNeighbors(x, z);

        if (neighbors.length > 0) {
            // Choose a random neighbor
            const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
            const { x: nx, z: nz } = randomNeighbor;

            // Remove wall between current cell and chosen neighbor
            removeWall(x, z, nx, nz);

            // Mark the chosen cell as visited and move to it
            maze[nx][nz] = true;
            stack.push(currentCell);
            currentCell = { x: nx, z: nz };
        } else {
            // Backtrack
            currentCell = stack.pop();
        }
    }
}

// Get unvisited neighbors for DFS
function getUnvisitedNeighbors(x, z) {
    const neighbors = [];
    if (x > 0 && !maze[x - 1][z]) neighbors.push({ x: x - 1, z });
    if (x < mazeSize - 1 && !maze[x + 1][z]) neighbors.push({ x: x + 1, z });
    if (z > 0 && !maze[x][z - 1]) neighbors.push({ x, z: z - 1 });
    if (z < mazeSize - 1 && !maze[x][z + 1]) neighbors.push({ x, z: z + 1 });
    return neighbors;
}

// Remove wall between two cells
function removeWall(x1, z1, x2, z2) {
    const wallX = (x1 + x2) / 2;
    const wallZ = (z1 + z2) / 2;
    scene.remove(getCube(wallX, wallZ)); // Remove the wall cube
}

// Helper to create a cube
function createCube(x, z, color = 0x0077ff) {
    const geometry = new THREE.BoxGeometry(cellSize, cellSize, cellSize);
    const material = new THREE.MeshBasicMaterial({ color });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(x * cellSize, cellSize / 2, z * cellSize);
    scene.add(cube);
    return cube;
}

// Helper to retrieve a cube at a specific position
function getCube(x, z) {
    return scene.getObjectByProperty("position", new THREE.Vector3(x * cellSize, cellSize / 2, z * cellSize));
}

// Initialize the maze with walls
for (let x = 0; x < mazeSize; x++) {
    for (let z = 0; z < mazeSize; z++) {
        createCube(x, z);
    }
}

// Render loop
function animate() {
    requestAnimationFrame(animate);
    generateMaze(); // Generate the maze step-by-step
    renderer.render(scene, camera);
}
animate();
