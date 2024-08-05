const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 600;
canvas.height = 520;

// Store points in memory
let points = [];
let delay = 5000;
let pointCount = 0; 
const MAX_ITERATIONS = 1000000; // Maximum number of iterations

function drawPoint(x, y, color = 'black', size = 1) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.fill();
}

function midpoint(x1, y1, x2, y2) {
    return [(x1 + x2) / 2, (y1 + y2) / 2];
}

function drawTemporaryLine(x1, y1, x2, y2, color = 'rgba(200, 200, 200, 0.5)', duration = delay) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    drawAllPoints();

    setTimeout(() => {
        ctx.strokeStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        drawAllPoints();
    }, duration);
}

function drawAllPoints() {
    // Draw all previously generated points
    points.forEach(point => {
        drawPoint(point[0], point[1], 'blue', 1);
    });
}

function redrawCanvas() {
    // Clear the canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Redraw all stored points
    points.forEach(point => drawPoint(point[0], point[1], 'blue', 2));

    // Redraw vertices
    vertices.forEach(v => drawPoint(v[0], v[1], 'red', 3));
}

const vertices = [
    [300, 20],  // top
    [20, 500],  // bottom left
    [580, 500]  // bottom right
];

function isPointInTriangle(px, py, v1, v2, v3) {
    const [x1, y1] = v1;
    const [x2, y2] = v2;
    const [x3, y3] = v3;

    const areaOrig = Math.abs((x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1));
    const area1 = Math.abs((x1 - px) * (y2 - py) - (x2 - px) * (y1 - py));
    const area2 = Math.abs((x2 - px) * (y3 - py) - (x3 - px) * (y2 - py));
    const area3 = Math.abs((x3 - px) * (y1 - py) - (x1 - px) * (y3 - py));

    return Math.abs(area1 + area2 + area3 - areaOrig) < 0.1;
}

function chaosGame(startX, startY) {
    // Draw vertices
    vertices.forEach(v => drawPoint(v[0], v[1], 'red', 3));

    let x = startX;
    let y = startY;

    function drawNextPoint() {
        // Randomly select a vertex
        const vertex = vertices[Math.floor(Math.random() * 3)];

        // Draw temporary line from current point to selected vertex
        drawTemporaryLine(x, y, vertex[0], vertex[1]);

        // Find and draw the midpoint
        const [midX, midY] = midpoint(x, y, vertex[0], vertex[1]);
        drawPoint(midX, midY, 'blue', 2);

        // Store the new point
        points.push([midX, midY]);
        
        // Update current point to midpoint
        x = midX;
        y = midY;

        pointCount++;
        if (pointCount % 10 === 0 && delay > 0) {
            delay = Math.max(0, delay * 0.7); // Decrease delay, but not below 50ms
        }

        // Check if we've reached the maximum number of iterations
        if (pointCount < MAX_ITERATIONS) {
            // Schedule the next point
            setTimeout(drawNextPoint, delay);
        }
    }

    // Start the drawing process
    drawNextPoint();
}

function displayMessage(message) {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}

// Draw initial triangle and display message
vertices.forEach(v => drawPoint(v[0], v[1], 'red', 3));
displayMessage('Click inside the triangle to choose a starting point');

// Wait for user to click to start the chaos game
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (isPointInTriangle(x, y, vertices[0], vertices[1], vertices[2])) {
        // Clear previous points and reset
        points = [];
        pointCount = 0;
        delay = 500;
        redrawCanvas();

        // Start the chaos game with the clicked point
        chaosGame(x, y);
    }
});